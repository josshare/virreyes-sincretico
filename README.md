# Ateneo de Virreyes

Clon del frontend de [virreyes-sincretico.netlify.app](https://virreyes-sincretico.netlify.app): app móvil para concierge del Hotel Virreyes (login, espacios del Ateneo, experiencias Sincrético, wallet y room service de Cumbre), más el módulo **Voces de México**.

## Páginas

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Login + home (espacios, experiencias, QR, cuenta, enlace a Voces) |
| `hotel.html` | Info y contacto del hotel |
| `ateneo.html` | Reserva de espacios por WhatsApp / correo |
| `cumbre.html` | Menú room service de Cumbre Café |
| `voces.html` | Catálogo y detalle de los 7 recorridos de Voces de México |

Datos del módulo Voces: `data/voces.json`. Covers: `assets/voces/`.

## Voces de México

7 recorridos narrativos con anfitrión e itinerario de ~10 paradas (Mercados, Chapultepec, Centro, Roma, Coyoacán, Chopo, Lagunilla). Detalle con `?r=coyoacan` (etc.) y CTA por WhatsApp.

## Cómo correrlo

```bash
npm start
```

Abre [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

El login y los listados del home usan Supabase (auth + tablas `profiles`, `properties`, `espacios`, `experiencias`). Voces es estático (JSON local).
