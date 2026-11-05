/* Movimiento sutil de la home (Fase H1). Spec: docs/requisitos/hero-editorial-2026-11-04.md
   1) Viento en cortinas y plantas + brillo del mar: filtros SVG sobre la misma foto (solo escritorio).
   2) Motas de algodón flotando en la luz: canvas[data-motes] (hero y sección del Pima).
   Con prefers-reduced-motion no se mueve nada. */
(function () {
  "use strict";
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  /* ---------- 1. Viento (filtros SVG) ---------- */
  function wind() {
    var host = document.querySelector(".hx-fx");
    if (!host || !matchMedia("(min-width: 761px)").matches) return;
    var src = "/hero/poster-desktop.webp";
    var zones = [
      // [id, base frequency, frecuencias animadas, escala, escalas animadas, duración, rectángulos de máscara x,y,w,h]
      ["sea", "0.004 0.09", "0.004 0.09;0.005 0.11;0.004 0.09", 6, null, 6, [[290, 205, 410, 260]]],
      ["palm", "0.03", "0.03;0.036;0.03", 5, null, 5, [[180, 480, 470, 260]]],
      ["curtain", "0.011 0.0018", "0.011 0.0018;0.0135 0.0022;0.011 0.0018", 12, "8;16;8", 8, [[0, 0, 175, 820], [1295, 0, 90, 360]]],
      ["leaf", "0.018", "0.018;0.022;0.018", 8, "4;11;4", 4.5, [[0, 420, 230, 310], [1420, 0, 500, 290]]]
    ];
    var defs = '<filter id="hx-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>';
    var layers = "";
    zones.forEach(function (z) {
      var scaleAnim = z[4] ? '<animate attributeName="scale" dur="' + (z[5] * 0.85).toFixed(1) + 's" values="' + z[4] + '" repeatCount="indefinite"/>' : "";
      defs +=
        '<filter id="hx-f-' + z[0] + '" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">' +
        '<feTurbulence type="fractalNoise" baseFrequency="' + z[1] + '" numOctaves="2" seed="7" result="n">' +
        '<animate attributeName="baseFrequency" dur="' + z[5] + 's" values="' + z[2] + '" repeatCount="indefinite"/></feTurbulence>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="' + z[3] + '" xChannelSelector="R" yChannelSelector="G">' + scaleAnim + "</feDisplacementMap></filter>" +
        '<mask id="hx-m-' + z[0] + '" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">' +
        z[6].map(function (r) { return '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="#fff" filter="url(#hx-soft)"/>'; }).join("") +
        "</mask>";
      layers += '<g mask="url(#hx-m-' + z[0] + ')"><image href="' + src + '" width="1920" height="1080" filter="url(#hx-f-' + z[0] + ')"/></g>';
    });
    host.innerHTML = '<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" focusable="false"><defs>' + defs + "</defs>" + layers + "</svg>";

    // Pausar cuando el hero sale de pantalla (ahorra batería y CPU)
    var svg = host.firstChild;
    if ("IntersectionObserver" in window && svg.pauseAnimations) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations(); });
      }).observe(host);
    }
  }

  /* ---------- 2. Motas de algodón ---------- */
  function motes(cv) {
    var ctx = cv.getContext("2d");
    if (!ctx) return;
    var dense = parseFloat(cv.getAttribute("data-motes")) || 1;
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), list = [], visible = true, raf = 0, last = 0;
    function size() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function mk(initial) {
      var beam = Math.random() < 0.7;
      return {
        x: (beam ? Math.random() * 0.55 : Math.random()) * W,
        y: initial ? Math.random() * H : H * (0.35 + Math.random() * 0.6),
        r: 0.6 + Math.random() * 2.2,
        vx: 0.05 + Math.random() * 0.18,
        vy: -(0.03 + Math.random() * 0.12),
        ph: Math.random() * 6.28,
        a: 0.25 + Math.random() * 0.5
      };
    }
    function init() {
      size();
      list = [];
      var n = Math.round(Math.min(70, W / 18) * dense);
      for (var i = 0; i < n; i++) list.push(mk(true));
    }
    function frame(t) {
      raf = 0;
      if (!visible) return;
      var dt = last ? Math.min(48, t - last) / 16.7 : 1;
      last = t;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        m.ph += 0.012 * dt;
        m.x += (m.vx + Math.sin(m.ph) * 0.12) * dt;
        m.y += (m.vy + Math.cos(m.ph * 0.7) * 0.06) * dt;
        if (m.x > W + 10 || m.y < -10) { list[i] = mk(false); continue; }
        var beam = Math.max(0, 1 - m.x / (W * 0.7));
        var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 3);
        g.addColorStop(0, "rgba(255,250,240," + (m.a * (0.45 + 0.55 * beam)).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255,250,240,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 3, 0, 6.283);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    init();
    window.addEventListener("resize", init);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
      }).observe(cv);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    wind();
    document.querySelectorAll("canvas[data-motes]").forEach(motes);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
