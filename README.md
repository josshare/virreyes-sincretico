# Ateneo de Virreyes

Clon del frontend de [virreyes-sincretico.netlify.app](https://virreyes-sincretico.netlify.app): app móvil para concierge del Hotel Virreyes, más el módulo **Voces de México**.

## Páginas

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Login + home (espacios, experiencias, QR, cuenta, enlace a Voces) |
| `hotel.html` | Info y contacto del hotel |
| `ateneo.html` | Reserva de espacios por WhatsApp / correo |
| `cumbre.html` | Menú room service de Cumbre Café |
| `voces.html` | Catálogo, detalle de paradas y **Modo recorrido** (GPS) |

Datos: `data/voces.json`. Covers: `assets/voces/`. Lógica GPS: `js/tour-mode.js`.

## Voces de México

Fuente de contenido: **Guía del Guía · Grupo Casa Pepe / Experience** (PDFs por recorrido).

7 recorridos con anfitrión, costeo, guion ES/EN y ~60 puntos con:

- `lat` / `lng` / `radio_m` (geofence)
- tip, horario, Maps y links (boletos, Wikipedia, oficiales)
- notificación al entrar al radio

Detalle: `voces.html?r=coyoacan` · parada: `?r=coyoacan&s=s5`

### Modo recorrido (notificaciones)

1. Abre un recorrido y pulsa **Iniciar modo recorrido**.
2. Acepta ubicación y (opcional) notificaciones del navegador.
3. Al entrar en el radio de un POI (~80–150 m) la app:
   - marca la parada como visitada
   - muestra banner / toast
   - dispara `Notification` si hay permiso

**Límite (fase 1):** funciona con la pestaña abierta (foreground). Las PWA no hacen geofencing real en background; Capacitor/native sería fase 2.

Para probar sin GPS real: con el modo activo, usa **Simular llegada (prueba)**.

## Cómo correrlo

```bash
npm start
```

Abre [http://127.0.0.1:8765/](http://127.0.0.1:8765/) o [http://127.0.0.1:8765/voces.html](http://127.0.0.1:8765/voces.html).

El login del home usa Supabase. Voces es estático (JSON local + geolocalización del navegador).
