/**
 * ALSAM · Interacciones generales
 * --------------------------------------------------------------------------
 * Cada módulo es una función independiente que se inicializa al final.
 * Sin dependencias externas.
 */
(function () {
  "use strict";

  const doc = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  doc.classList.add("js");

  /* --- Entrada del hero ----------------------------------------------- */
  function initHero() {
    document.querySelectorAll(".hero__title .line > span").forEach((el, i) => {
      el.style.setProperty("--i", i);
    });
    // Doble rAF: garantiza que el estado inicial se pinte antes de animar.
    requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add("is-loaded")));
  }

  /* --- Cabecera: estado al hacer scroll -------------------------------- */
  function initHeader() {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* --- Menú móvil ------------------------------------------------------ */
  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav]");
    if (!toggle || !nav) return;
    const label = toggle.querySelector(".menu-toggle__label");

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Cerrar" : "Menú";
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia("(min-width: 1181px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* --- Revelado al entrar en pantalla --------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    // Escalonado para elementos hermanos (tarjetas, pasos, filas).
    items.forEach((el) => {
      const siblings = Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal"));
      const idx = siblings.indexOf(el);
      if (siblings.length > 2) el.style.setProperty("--d", `${Math.min(idx, 6) * 70}ms`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* --- Navegación activa según la sección visible --------------------- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll(".nav__link"));
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    // Se observan todas las secciones: las que no están en el menú
    // (Soluciones, Contacto) simplemente apagan el indicador.
    const sections = Array.from(document.querySelectorAll("main > section[id]"));
    if (!("IntersectionObserver" in window) || !sections.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.removeAttribute("aria-current"));
        const link = map.get(entry.target.id);
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  }

  /* --- Divisiones: el CTA de cada una preselecciona el servicio ------- */
  function initServices() {
    document.querySelectorAll("[data-service]").forEach((link) => {
      link.addEventListener("click", () => {
        const select = document.getElementById("f-servicio");
        if (select) {
          select.value = link.dataset.service;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });
  }

  /* --- Método: barra de progreso ligada al scroll --------------------- */
  function initMethodProgress() {
    const section = document.querySelector("[data-method]");
    const bar = document.querySelector("[data-method-progress]");
    if (!section || !bar) return;
    if (reduceMotion) { bar.style.setProperty("--p", 1); return; }
    let ticking = false;
    const update = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height * 0.75)));
      bar.style.setProperty("--p", p.toFixed(3));
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* --- Esquema SVG: pausar animación si se prefiere menos movimiento -- */
  function initSchema() {
    const svg = document.querySelector("[data-schema]");
    if (svg && reduceMotion && typeof svg.pauseAnimations === "function") svg.pauseAnimations();
  }

  /* --- WhatsApp (solo si hay número configurado) ---------------------- */
  function initWhatsApp() {
    const cfg = window.ALSAM_CONFIG || {};
    const number = String(cfg.whatsappNumber || "").replace(/\D/g, "");
    const btn = document.querySelector("[data-whatsapp]");
    if (!btn || number.length < 8) return;
    btn.href = `https://wa.me/${number}?text=${encodeURIComponent(cfg.whatsappMessage || "")}`;
    btn.hidden = false;
  }

  /* --- Barra de progreso de lectura ----------------------------------- */
  function initProgress() {
    const bar = document.querySelector("[data-progress]");
    if (!bar) return;
    let ticking = false;
    const update = () => {
      const max = doc.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* --- Año del pie ---------------------------------------------------- */
  function initYear() {
    const el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  initHero();
  initHeader();
  initMenu();
  initReveal();
  initActiveNav();
  initServices();
  initMethodProgress();
  initSchema();
  initWhatsApp();
  initProgress();
  initYear();
})();
