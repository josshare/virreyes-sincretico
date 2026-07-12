/**
 * Ateneo analytics — modo presentación (sin base de datos).
 * Conserva UTM / first-win en sessionStorage; no envía a Supabase.
 */
(function (global) {
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const SS_UTM = "ateneo_utm";
  const SS_SESSION = "ateneo_session_id";
  const SS_FIRST_WIN = "ateneo_first_win";

  let page = "unknown";
  let started = false;

  function uuid() {
    if (global.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function getSessionId() {
    try {
      let id = sessionStorage.getItem(SS_SESSION);
      if (!id) {
        id = uuid();
        sessionStorage.setItem(SS_SESSION, id);
      }
      return id;
    } catch {
      return uuid();
    }
  }

  function readUtmFromUrl() {
    const params = new URLSearchParams(location.search);
    const utm = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });
    return utm;
  }

  function persistUtm(utm) {
    if (!utm || !Object.keys(utm).length) return getUtm();
    try {
      sessionStorage.setItem(SS_UTM, JSON.stringify(utm));
    } catch (_) {}
    return utm;
  }

  function getUtm() {
    try {
      return JSON.parse(sessionStorage.getItem(SS_UTM) || "{}");
    } catch {
      return {};
    }
  }

  function track(event, props) {
    if (!event) return Promise.resolve();
    if (global.console && console.debug) {
      console.debug("[AteneoAnalytics]", event, props || {}, getUtm());
    }
    return Promise.resolve();
  }

  function hasFirstWin() {
    try {
      return sessionStorage.getItem(SS_FIRST_WIN) === "1";
    } catch {
      return false;
    }
  }

  function markFirstWin(type, extra) {
    if (hasFirstWin()) return Promise.resolve();
    try {
      sessionStorage.setItem(SS_FIRST_WIN, "1");
    } catch (_) {}
    return track("first_win", Object.assign({ type: type || "unknown" }, extra || {}));
  }

  function trackCtaWhatsapp(extra) {
    markFirstWin((extra && extra.win_type) || "whatsapp", extra);
    return track("cta_whatsapp", extra || {});
  }

  function trackCtaTuritop(extra) {
    markFirstWin("turitop", extra);
    return track("cta_turitop", Object.assign({ promo: "VIRREYES" }, extra || {}));
  }

  function bindOutbound() {
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
        if (!a) return;
        const href = a.getAttribute("href") || "";
        if (/wa\.me|api\.whatsapp\.com/i.test(href)) {
          const extra = {
            href: href.slice(0, 180),
            win_type: page === "voces" ? "voces" : page === "cumbre" ? "cumbre" : page === "ateneo" ? "espacio" : "whatsapp",
          };
          if (a.dataset.tourId) extra.tour_id = a.dataset.tourId;
          trackCtaWhatsapp(extra);
        } else if (/turitop\.com/i.test(href)) {
          trackCtaTuritop({ href: href.slice(0, 180) });
        }
      },
      true
    );
  }

  function init(opts) {
    if (started) return;
    started = true;
    opts = opts || {};
    page = opts.page || document.body.getAttribute("data-page") || location.pathname.split("/").pop() || "home";
    const fromUrl = readUtmFromUrl();
    persistUtm(Object.keys(fromUrl).length ? fromUrl : getUtm());
    track(Object.keys(fromUrl).length ? "ad_landing" : "session_start", { path: location.pathname + location.search });
    track("page_view", { path: location.pathname + location.search });
    bindOutbound();
    return { utm: getUtm(), sessionId: getSessionId() };
  }

  function promptCsat(context) {
    const score = prompt("¿Qué tan útil te resultó? (1–5)", "5");
    if (score == null) return Promise.resolve();
    const n = Number(score);
    if (!(n >= 1 && n <= 5)) return Promise.resolve();
    return track("csat", Object.assign({ score: n }, context || {}));
  }

  global.AteneoAnalytics = {
    init,
    track,
    setUser: function () {},
    markFirstWin,
    trackCtaWhatsapp,
    trackCtaTuritop,
    getUtm,
    getSessionId,
    promptCsat,
    flushQueue: function () {},
  };
})(typeof window !== "undefined" ? window : globalThis);
