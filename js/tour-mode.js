/**
 * Modo recorrido Voces de México
 * Geolocalización en foreground + notificaciones locales al entrar a un POI.
 */
(function (global) {
  const KEY = (id) => `voces-tour-${id}`;

  function haversineM(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function loadProgress(tourId) {
    try {
      return JSON.parse(localStorage.getItem(KEY(tourId)) || "{}");
    } catch {
      return {};
    }
  }

  function saveProgress(tourId, progress) {
    localStorage.setItem(KEY(tourId), JSON.stringify(progress));
  }

  async function ensurePermissions() {
    if (!("geolocation" in navigator)) {
      throw new Error("Este dispositivo no soporta geolocalización.");
    }
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  function notify(parada) {
    const title = parada.notif_titulo || `Llegaste a ${parada.nombre}`;
    const body = parada.notif_cuerpo || parada.subtitulo || "";
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, tag: `voces-${parada.id}` });
      } catch (_) {
        /* ignore */
      }
    }
    return { title, body };
  }

  function createTourMode({ recorrido, onEnter, onUpdate, onError, onStop }) {
    let watchId = null;
    let active = false;
    const progress = loadProgress(recorrido.id);
    if (!progress.visited) progress.visited = {};
    if (!progress.notified) progress.notified = {};

    function markVisited(paradaId) {
      progress.visited[paradaId] = Date.now();
      saveProgress(recorrido.id, progress);
    }

    function checkPosition(pos) {
      const { latitude: lat, longitude: lng } = pos.coords;
      let here = null;
      let nearest = { dist: Infinity, parada: null };

      for (const p of recorrido.paradas) {
        if (p.lat == null || p.lng == null) continue;
        const d = haversineM(lat, lng, p.lat, p.lng);
        if (d < nearest.dist) nearest = { dist: d, parada: p };
        const radio = p.radio_m || 120;
        if (d <= radio) {
          here = p;
          if (!progress.notified[p.id]) {
            progress.notified[p.id] = Date.now();
            markVisited(p.id);
            saveProgress(recorrido.id, progress);
            const n = notify(p);
            if (typeof onEnter === "function") onEnter(p, n, d);
          } else {
            markVisited(p.id);
          }
        }
      }

      if (typeof onUpdate === "function") {
        onUpdate({
          lat,
          lng,
          here,
          nearest,
          progress,
          active,
        });
      }
    }

    async function start() {
      await ensurePermissions();
      active = true;
      watchId = navigator.geolocation.watchPosition(
        checkPosition,
        (err) => {
          if (typeof onError === "function") onError(err);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
      return progress;
    }

    function stop() {
      active = false;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (typeof onStop === "function") onStop();
    }

    function reset() {
      progress.visited = {};
      progress.notified = {};
      saveProgress(recorrido.id, progress);
    }

    function simulateAt(paradaId) {
      const p = recorrido.paradas.find((x) => x.id === paradaId);
      if (!p || p.lat == null) return;
      checkPosition({ coords: { latitude: p.lat, longitude: p.lng } });
    }

    return {
      start,
      stop,
      reset,
      simulateAt,
      getProgress: () => progress,
      isActive: () => active,
      haversineM,
    };
  }

  global.VocesTourMode = { createTourMode, haversineM, loadProgress, saveProgress };
})(typeof window !== "undefined" ? window : globalThis);
