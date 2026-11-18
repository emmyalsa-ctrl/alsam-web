/**
 * ALSAM · Mini demos interactivas de las divisiones
 * --------------------------------------------------------------------------
 * Cuatro simulaciones (sitio web, flujo automático, asistente virtual y
 * panel de mantenimiento). Son ilustrativas: no envían datos a ningún lado.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Con movimiento reducido las secuencias se acortan.
  const T = (ms) => (reduceMotion ? Math.round(ms * 0.25) : ms);
  const wait = (ms) => new Promise((r) => setTimeout(r, T(ms)));
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const pad = (n) => String(n).padStart(2, "0");
  const clock = (sec) => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}${sec ? ":" + pad(d.getSeconds()) : ""}`;
  };

  const setPressed = (buttons, active) => {
    buttons.forEach((b) => {
      const on = b === active;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  };

  // Ejecuta `fn` la primera vez que el elemento aparece en pantalla.
  const onFirstView = (el, fn) => {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
    }, { threshold: 0.5 });
    io.observe(el);
  };

  // Escribe texto carácter por carácter en un campo.
  const typeInto = async (input, text) => {
    input.value = "";
    for (const ch of text) {
      input.value += ch;
      await wait(45);
    }
  };

  /* --- 01 · Sitio web ---------------------------------------------------- */
  function initWeb(root) {
    const site = root.querySelector("[data-site]");
    const pages = Array.from(root.querySelectorAll("[data-page]"));
    const panels = Array.from(root.querySelectorAll("[data-panel]"));
    const views = Array.from(root.querySelectorAll("[data-view]"));
    const path = root.querySelector("[data-path]");
    const burger = root.querySelector("[data-burger]");
    const body = root.querySelector("[data-body]");
    const formBox = root.querySelector("[data-form-box]");
    const name = root.querySelector("[data-name]");
    const mail = root.querySelector("[data-mail]");
    const send = root.querySelector("[data-send]");
    const ok = root.querySelector("[data-ok]");
    const okTitle = root.querySelector("[data-ok-title]");
    let sending = false;

    const setMenu = (open) => {
      site.classList.toggle("is-menu", open);
      burger.setAttribute("aria-expanded", String(open));
    };

    const show = (page) => {
      setMenu(false);
      site.classList.remove("is-loading");
      void site.offsetWidth; // reinicia la barra de carga
      site.classList.add("is-loading");
      setTimeout(() => site.classList.remove("is-loading"), T(600));
      setPressed(pages, pages.find((p) => p.dataset.page === page));
      panels.forEach((p) => { p.hidden = p.dataset.panel !== page; });
      path.textContent = page === "inicio" ? "" : `/${page}`;
      body.scrollTop = 0;
      if (page === "contacto" && !sending) { formBox.hidden = false; ok.hidden = true; }
    };

    pages.forEach((b) => b.addEventListener("click", () => show(b.dataset.page)));
    root.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));
    burger.addEventListener("click", () => setMenu(!site.classList.contains("is-menu")));
    views.forEach((b) => b.addEventListener("click", () => {
      setPressed(views, b);
      setMenu(false);
      root.classList.toggle("is-mob", b.dataset.view === "mob");
    }));

    const submit = async () => {
      if (sending) return;
      sending = true;
      send.disabled = true;
      if (!name.value.trim()) await typeInto(name, "Ana López");
      if (!mail.value.trim()) await typeInto(mail, "ana@correo.com");
      send.classList.add("is-busy");
      send.textContent = "Enviando…";
      await wait(900);
      okTitle.textContent = `¡Gracias, ${name.value.trim().split(/\s+/)[0]}!`;
      formBox.hidden = true;
      ok.hidden = false;
      send.classList.remove("is-busy");
      send.textContent = "Enviar mensaje";
      send.disabled = false;
      name.value = "";
      mail.value = "";
      sending = false;
    };
    send.addEventListener("click", submit);
    [name, mail].forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); }));
  }

  /* --- 02 · Flujo automático -------------------------------------------- */
  const PEOPLE = ["Ana L.", "Carlos R.", "Lucía M.", "Jorge P.", "Sofía G.", "Diego T."];
  const ASKS = ["pidió una cotización", "preguntó por un servicio", "solicitó una cita", "pidió información"];
  const STEPS = ["Cliente guardado en la hoja", "Aviso enviado al equipo", "Reporte actualizado"];

  function initFlow(root) {
    const inputs = Array.from(root.querySelectorAll(".flow__in"));
    const wiresL = Array.from(root.querySelectorAll(".flow__w--l"));
    const wiresR = Array.from(root.querySelectorAll(".flow__w--r"));
    const outs = Array.from(root.querySelectorAll("[data-out]"));
    const hub = root.querySelector(".flow__hub");
    const feed = root.querySelector("[data-feed]");
    const count = root.querySelector("[data-count]");
    const auto = root.querySelector("[data-auto]");
    let total = 0;
    let busy = false;
    let timer = null;
    let visible = false;

    const log = (html, cls) => {
      const empty = feed.querySelector(".feed__empty");
      if (empty) empty.remove();
      const li = document.createElement("li");
      if (cls) li.className = cls;
      li.innerHTML = `<time>${clock(true)}</time><span>${html}</span>`;
      feed.appendChild(li);
      while (feed.children.length > 5) feed.firstElementChild.remove();
    };

    const run = async (i) => {
      if (busy) return;
      busy = true;
      const btn = inputs[i];
      root.classList.add("is-running");
      [...inputs, ...wiresL, ...wiresR, ...outs].forEach((el) => el.classList.remove("is-live", "is-done"));

      btn.classList.add("is-live");
      log(`<b>${btn.dataset.src}</b> · ${pick(PEOPLE)} ${pick(ASKS)}`, "is-new");
      wiresL[i].classList.add("is-live");
      await wait(520);
      hub.classList.add("is-busy");
      await wait(420);
      for (let k = 0; k < outs.length; k++) {
        wiresR[k].classList.add("is-live");
        await wait(320);
        outs[k].classList.add("is-done");
        log(`✓ ${STEPS[k]}`, "is-ok");
      }
      hub.classList.remove("is-busy");
      total += 1;
      count.textContent = String(total);
      await wait(400);
      btn.classList.remove("is-live");
      root.classList.remove("is-running");
      busy = false;
    };

    inputs.forEach((btn, i) => btn.addEventListener("click", () => run(i)));

    const setAuto = (on) => {
      auto.setAttribute("aria-pressed", String(on));
      clearInterval(timer);
      if (!on) return;
      if (!busy) run(Math.floor(Math.random() * inputs.length));
      timer = setInterval(() => {
        if (visible && !busy) run(Math.floor(Math.random() * inputs.length));
      }, T(3600));
    };
    auto.addEventListener("click", () => setAuto(auto.getAttribute("aria-pressed") !== "true"));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(root);
    }
    // Primera solicitud de ejemplo al entrar en pantalla.
    onFirstView(root, () => setTimeout(() => { if (total === 0) run(0); }, T(500)));
  }

  /* --- 03 · Asistente virtual ------------------------------------------- */
  const REPLIES = {
    saludo: { a: "¡Hola! ¿En qué te puedo ayudar hoy?" },
    cotizacion: {
      q: "Quiero una cotización",
      a: "¡Con gusto! Para preparar tu cotización, ¿me compartes qué servicio necesitas y para cuándo?",
    },
    servicios: {
      q: "¿Qué servicios ofrecen?",
      a: "Estos son nuestros servicios:",
      list: ["Servicio uno", "Servicio dos", "Servicio tres"],
      after: "¿Te interesa alguno?",
    },
    horario: {
      q: "¿Cuál es su horario?",
      a: "Yo respondo las 24 horas 🙂 Si necesitas a una persona, el equipo te atiende en su horario de oficina.",
    },
    asesor: {
      q: "Quiero hablar con una persona",
      a: "Claro, ya avisé a un asesor 🙌 Te escribirá por este mismo chat.",
      note: "Conversación transferida a un asesor",
    },
    gracias: { a: "¡Con gusto! Aquí estoy si necesitas algo más." },
    otro: { a: "Buena pregunta. En la versión real, aquí respondería con la información de tu negocio. ¿Quieres hablar con un asesor?" },
  };
  const INTENTS = [
    ["asesor", /asesor|persona|humano|agente|llamar|hablar con/],
    ["cotizacion", /cotiz|precio|costo|cuanto|presupuesto/],
    ["servicios", /servicio|ofrecen|hacen|catalogo|producto/],
    ["horario", /horario|hora|abren|cierran|atienden/],
    ["gracias", /gracias|perfecto|excelente|genial/],
    ["saludo", /^(hola|buen|que tal|hey)/],
  ];
  const detect = (text) => {
    const t = text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const hit = INTENTS.find(([, re]) => re.test(t));
    return hit ? hit[0] : "otro";
  };

  function initChat(root) {
    const log = root.querySelector("[data-log]");
    const status = root.querySelector("[data-status]");
    const chips = Array.from(root.querySelectorAll("[data-q]"));
    const form = root.querySelector("[data-chat-form]");
    const input = root.querySelector("[data-input]");
    const reset = root.querySelector("[data-reset]");
    const startHTML = log.innerHTML;
    const statusHTML = status.innerHTML;
    let busy = false;
    let session = 0;

    const scroll = () => { log.scrollTop = log.scrollHeight; };

    const bubble = (who) => {
      const el = document.createElement("div");
      el.className = `msg msg--${who}`;
      log.appendChild(el);
      return el;
    };

    const addUser = (text) => {
      const el = bubble("user");
      el.innerHTML = `<p></p><time>${clock()} <i class="msg__ticks" aria-hidden="true">✓✓</i></time>`;
      el.querySelector("p").textContent = text;
      scroll();
      return el;
    };

    const addBot = (reply) => {
      const el = bubble("bot");
      const p = document.createElement("p");
      p.textContent = reply.a;
      el.appendChild(p);
      if (reply.list) {
        const ul = document.createElement("ul");
        reply.list.forEach((item) => { const li = document.createElement("li"); li.textContent = item; ul.appendChild(li); });
        el.appendChild(ul);
        const p2 = document.createElement("p");
        p2.textContent = reply.after;
        el.appendChild(p2);
      }
      el.insertAdjacentHTML("beforeend", `<time>${clock()}</time>`);
      scroll();
    };

    const respond = async (key, userText) => {
      if (busy) return;
      busy = true;
      const id = session;
      const reply = REPLIES[key];
      const sent = addUser(userText || reply.q);
      await wait(450);
      if (id !== session) return;
      sent.classList.add("is-read");
      status.innerHTML = "<i aria-hidden=\"true\"></i>Escribiendo…";
      const typing = bubble("bot");
      typing.classList.add("msg--typing");
      typing.innerHTML = "<span></span><span></span><span></span>";
      scroll();
      await wait(1100);
      if (id !== session) return;
      typing.remove();
      status.innerHTML = statusHTML;
      addBot(reply);
      if (reply.note) {
        await wait(500);
        if (id !== session) return;
        const n = document.createElement("p");
        n.className = "chat__note";
        n.textContent = reply.note;
        log.appendChild(n);
        scroll();
      }
      busy = false;
    };

    const greet = async () => {
      const id = session;
      busy = true;
      const typing = bubble("bot");
      typing.classList.add("msg--typing");
      typing.innerHTML = "<span></span><span></span><span></span>";
      await wait(900);
      if (id !== session) return;
      typing.remove();
      addBot({ a: "¡Hola! 👋 Soy el asistente virtual de Tu Empresa. ¿En qué te puedo ayudar?" });
      busy = false;
    };

    chips.forEach((chip) => chip.addEventListener("click", () => respond(chip.dataset.q)));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || busy) return;
      input.value = "";
      respond(detect(text), text);
    });
    reset.addEventListener("click", () => {
      session += 1;
      busy = false;
      log.innerHTML = startHTML;
      status.innerHTML = statusHTML;
      greet();
    });

    // Saludo inicial solo si la persona aún no ha escrito nada.
    onFirstView(root, () => { if (!log.querySelector(".msg")) greet(); });
  }

  /* --- 04 · Panel de mantenimiento -------------------------------------- */
  const TASKS = [
    ["Instalando 3 actualizaciones…", "listo"],
    ["Creando respaldo completo…", "listo"],
    ["Analizando seguridad…", "sin alertas"],
    ["Optimizando imágenes…", "listo"],
  ];

  function initCare(root) {
    const rows = Array.from(root.querySelectorAll("[data-row]"));
    const run = root.querySelector("[data-run]");
    const msg = root.querySelector("[data-msg]");
    const status = root.querySelector("[data-status]");
    const ring = root.querySelector("[data-ring]");
    const scoreEl = root.querySelector("[data-score]");
    const term = root.querySelector("[data-term]");
    const START = 72;
    let score = START;

    const setScore = (v) => {
      score = v;
      scoreEl.textContent = String(Math.round(v));
      ring.style.strokeDashoffset = String(100 - v);
    };
    const animateScore = (to, ms) => new Promise((resolve) => {
      const from = score;
      const dur = T(ms);
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        setScore(from + (to - from) * k);
        if (k < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    const line = (html) => {
      const p = document.createElement("p");
      p.innerHTML = html;
      term.appendChild(p);
      while (term.children.length > 4) term.firstElementChild.remove();
      return p;
    };

    const resetDemo = () => {
      root.classList.add("is-warn");
      root.classList.remove("is-done");
      rows.forEach((r) => {
        r.classList.remove("is-ok", "is-checking");
        r.querySelector("[data-st]").textContent = r.dataset.warn;
      });
      setScore(START);
      status.textContent = "4 puntos requieren atención";
      msg.textContent = "Última revisión: hace 6 días";
      term.innerHTML = "<p><span>$</span> esperando revisión…</p>";
      run.textContent = "Ejecutar mantenimiento";
    };

    run.addEventListener("click", async () => {
      if (root.classList.contains("is-done")) { resetDemo(); return; }
      run.disabled = true;
      run.textContent = "En curso…";
      status.textContent = "Mantenimiento en curso…";
      term.innerHTML = "";
      line("<span>$</span> alsam-care --mantenimiento");

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        r.classList.add("is-checking");
        r.querySelector("[data-st]").textContent = "Trabajando…";
        const p = line(`<span>›</span> ${TASKS[i][0]}`);
        await animateScore(START + ((100 - START) * (i + 1)) / rows.length, 900);
        p.insertAdjacentHTML("beforeend", ` <em>${TASKS[i][1]}</em>`);
        r.classList.remove("is-checking");
        r.classList.add("is-ok");
        r.querySelector("[data-st]").textContent =
          r.dataset.ok === "Creado hoy" ? `Creado hoy, ${clock()}` : r.dataset.ok;
      }
      line("<span>✓</span> <em>Mantenimiento completo</em>");
      root.classList.remove("is-warn");
      root.classList.add("is-done");
      status.textContent = "Todo en orden · 0 alertas";
      msg.textContent = `Última revisión: hoy, ${clock()}`;
      run.textContent = "Reiniciar demo";
      run.disabled = false;
    });

    setScore(START);
  }

  const INIT = { web: initWeb, flow: initFlow, chat: initChat, care: initCare };
  document.querySelectorAll("[data-demo]").forEach((el) => {
    const fn = INIT[el.dataset.demo];
    if (fn) fn(el);
  });
})();
