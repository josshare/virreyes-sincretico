-- Ateneo CEO KPIs: first-party events + attributed sales (weekly revenue bridge)
-- Apply via Supabase SQL editor or: supabase db push

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  session_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  page text,
  props jsonb not null default '{}'::jsonb,
  utm jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_event_idx on public.analytics_events (event);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);

create table if not exists public.attributed_sales (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sold_at date not null default (timezone('America/Mexico_City', now()))::date,
  product_name text not null,
  channel text not null default 'turitop',
  amount_mxn numeric(12,2) not null check (amount_mxn >= 0),
  commission_pct numeric(5,4) not null default 0.10 check (commission_pct >= 0 and commission_pct <= 1),
  promo_code text,
  utm_campaign text,
  notes text,
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists attributed_sales_sold_at_idx on public.attributed_sales (sold_at desc);

alter table public.analytics_events enable row level security;
alter table public.attributed_sales enable row level security;

drop policy if exists analytics_events_insert_anon on public.analytics_events;
create policy analytics_events_insert_anon on public.analytics_events
  for insert to anon, authenticated
  with check (true);

drop policy if exists analytics_events_select_auth on public.analytics_events;
create policy analytics_events_select_auth on public.analytics_events
  for select to authenticated
  using (true);

drop policy if exists attributed_sales_select_auth on public.attributed_sales;
create policy attributed_sales_select_auth on public.attributed_sales
  for select to authenticated
  using (true);

drop policy if exists attributed_sales_insert_auth on public.attributed_sales;
create policy attributed_sales_insert_auth on public.attributed_sales
  for insert to authenticated
  with check (true);

drop policy if exists attributed_sales_update_auth on public.attributed_sales;
create policy attributed_sales_update_auth on public.attributed_sales
  for update to authenticated
  using (true)
  with check (true);

drop policy if exists attributed_sales_delete_auth on public.attributed_sales;
create policy attributed_sales_delete_auth on public.attributed_sales
  for delete to authenticated
  using (true);

grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant select, insert, update, delete on public.attributed_sales to authenticated;

create or replace function public.ceo_kpi_summary(p_days int default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  prev_since timestamptz := since - make_interval(days => greatest(p_days, 1));
  result jsonb;
begin
  if auth.role() is distinct from 'authenticated' then
    raise exception 'authenticated only';
  end if;

  with ev as (
    select * from analytics_events where created_at >= prev_since
  ),
  cur as (
    select * from ev where created_at >= since
  ),
  prev as (
    select * from ev where created_at < since
  ),
  sales_cur as (
    select coalesce(count(*),0) as n,
           coalesce(sum(amount_mxn),0) as gmv,
           coalesce(sum(amount_mxn * commission_pct),0) as commission
    from attributed_sales
    where sold_at >= (timezone('America/Mexico_City', since))::date
  ),
  sales_prev as (
    select coalesce(count(*),0) as n,
           coalesce(sum(amount_mxn),0) as gmv,
           coalesce(sum(amount_mxn * commission_pct),0) as commission
    from attributed_sales
    where sold_at >= (timezone('America/Mexico_City', prev_since))::date
      and sold_at < (timezone('America/Mexico_City', since))::date
  )
  select jsonb_build_object(
    'period_days', p_days,
    'since', since,
    'acquisition', jsonb_build_object(
      'sessions', (select count(distinct session_id) from cur where event in ('session_start','page_view','ad_landing')),
      'sessions_prev', (select count(distinct session_id) from prev where event in ('session_start','page_view','ad_landing')),
      'ad_landings', (select count(*) from cur where event = 'ad_landing'),
      'with_utm', (select count(distinct session_id) from cur where utm <> '{}'::jsonb)
    ),
    'activation', jsonb_build_object(
      'first_wins', (select count(*) from cur where event = 'first_win'),
      'sessions', (select count(distinct session_id) from cur where event in ('session_start','page_view','ad_landing')),
      'by_type', coalesce((select jsonb_object_agg(t, c) from (
          select props->>'type' as t, count(*) as c from cur where event='first_win' group by 1
        ) q), '{}'::jsonb)
    ),
    'retention', jsonb_build_object(
      'multi_action_sessions', (
        select count(*) from (
          select session_id from cur
          where event in ('first_win','cta_whatsapp','cta_turitop','tour_start','poi_visited')
          group by session_id having count(*) >= 2
        ) s
      )
    ),
    'revenue', jsonb_build_object(
      'cta_turitop', (select count(*) from cur where event = 'cta_turitop'),
      'cta_whatsapp', (select count(*) from cur where event = 'cta_whatsapp'),
      'bookings', (select n from sales_cur),
      'bookings_prev', (select n from sales_prev),
      'gmv_mxn', (select gmv from sales_cur),
      'gmv_prev', (select gmv from sales_prev),
      'commission_mxn', (select commission from sales_cur)
    ),
    'referral', jsonb_build_object(
      'csat_avg', (select avg((props->>'score')::numeric) from cur where event = 'csat' and props ? 'score'),
      'csat_n', (select count(*) from cur where event = 'csat'),
      'shares', (select count(*) from cur where event = 'share')
    ),
    'product', jsonb_build_object(
      'tour_starts', (select count(*) from cur where event = 'tour_start'),
      'poi_visited', (select count(*) from cur where event = 'poi_visited'),
      'login_success', (select count(*) from cur where event = 'login_success')
    ),
    'top_campaigns', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(utm->>'utm_campaign','(none)') as campaign,
               count(*) filter (where event in ('cta_turitop','cta_whatsapp')) as intents,
               count(*) filter (where event = 'first_win') as first_wins,
               count(distinct session_id) as sessions
        from cur
        group by 1
        order by intents desc, first_wins desc
        limit 5
      ) t
    ), '[]'::jsonb),
    'top_tours', coalesce((
      select jsonb_agg(row_to_json(t)) from (
        select coalesce(props->>'tour_id', props->>'recorrido_id', '(n/a)') as tour_id,
               count(*) filter (where event = 'tour_start') as starts,
               count(*) filter (where event = 'cta_whatsapp') as wa,
               count(*) filter (where event = 'poi_visited') as pois
        from cur
        where props ? 'tour_id' or props ? 'recorrido_id' or event in ('tour_start','poi_visited')
        group by 1
        order by starts desc, wa desc
        limit 7
      ) t
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.ceo_kpi_summary(int) from public;
grant execute on function public.ceo_kpi_summary(int) to authenticated;
