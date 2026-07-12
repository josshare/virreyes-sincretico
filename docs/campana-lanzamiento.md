# Brief de campaña · Lanzamiento Ateneo de Virreyes

## North Star (mensaje único)

**Métrica:** experiencias pagadas atribuidas a Ateneo por semana (bookings TuriTop `VIRREYES` + ventas WA cerradas).

**CTA creativo (elige uno por pieza; no listar features):**

- QR habitación: “Escanea y empieza Voces de México”
- Ads / pre-arrival: “Reserva con código VIRREYES desde Ateneo”

## First win (Activation)

Una sesión cuenta como activada si el huésped hace **una** de:

1. Inicia modo recorrido Voces  
2. Abre WhatsApp (espacio / Cumbre / Voces)  
3. Click TuriTop (promo VIRREYES)

**Meta 30 días:** first-win rate ≥ 40% de sesiones.

## Naming UTM (obligatorio en ads y QR)

| Parámetro | Ejemplo |
|-----------|---------|
| `utm_source` | `meta` · `qr` · `email` · `concierge` |
| `utm_medium` | `paid` · `print` · `whatsapp` · `staff` |
| `utm_campaign` | `launch90_voces` · `qr_habitacion_voces` · `prearrival_virreyes` |
| `utm_content` | `cta_escanea` · `cta_reservar` · ` Lobby_a` |

Ejemplo QR:

`https://TU-DOMINIO/voces.html?utm_source=qr&utm_medium=print&utm_campaign=qr_habitacion_voces&utm_content=habitacion`

Ejemplo ad → home:

`https://TU-DOMINIO/?utm_source=meta&utm_medium=paid&utm_campaign=launch90_voces&utm_content=cta_reservar`

## Cómo usan las 3 metodologías la campaña

| Metodología | Decide | No decide sola |
|-------------|--------|----------------|
| **North Star** | Objetivo y un solo CTA | Creativos tácticos diarios |
| **AARRR** | Dónde poner presupuesto (fuga del embudo) | Satisfacción del huésped |
| **HEART / Adoption** | QR, scripts concierge, UX del first-win | ROAS sin contexto de estancia |

## Cadencia 30 / 60 / 90

| Día | Foco | Qué revisar en el tablero CEO |
|-----|------|-------------------------------|
| 0–7 | Baseline | Instrumentación viva; no escalar ads |
| 30 | Activation | First-win ≥ 40%; 1 QR + 1 creativo |
| 60 | Revenue | Bookings atribuidos semana a semana; cargar ventas en tablero |
| 90 | Retention + referral | Repeat use (≥2 acciones) + CSAT; caso para subir spend |

## Script concierge (una frase)

> “Si quieres un recorrido por la ciudad desde el celular, escanea este QR y abre Voces — o reserva en TuriTop con el código VIRREYES.”

## Tablero

Abrir [`ceo-dashboard.html`](../ceo-dashboard.html) con login staff. Cargar ventas atribuidas cada semana (puente revenue). Wallet del home lee las mismas ventas.
