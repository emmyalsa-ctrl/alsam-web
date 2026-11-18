/**
 * ALSAM · Formulario de contacto
 * --------------------------------------------------------------------------
 * - Validación accesible en el cliente (aria-invalid + mensajes en vivo).
 * - Envío real por fetch al endpoint de config.js (formato JSON, compatible
 *   con Formspree). Sin endpoint configurado NO simula éxito: lo informa.
 * - Anti-spam: campo trampa + tiempo mínimo de llenado.
 * La validación del servidor sigue siendo obligatoria en el proveedor/backend.
 */
(function () {
  "use strict";

  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const cfg = window.ALSAM_CONFIG || {};
  const status = form.querySelector("[data-form-status]");
  const submit = form.querySelector("[data-submit]");
  const submitLabel = form.querySelector("[data-submit-label]");
  const counter = form.querySelector("[data-counter]");
  const message = form.elements.mensaje;
  const startedAt = Date.now();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /** Reglas por campo: devuelven un mensaje de error o "" si es válido. */
  const rules = {
    nombre: (v) => {
      v = v.trim();
      if (!v) return "Escribe tu nombre.";
      if (v.length < 2) return "El nombre es demasiado corto.";
      return "";
    },
    email: (v) => {
      v = v.trim();
      if (!v) return "Escribe tu correo electrónico.";
      if (!EMAIL_RE.test(v)) return "Revisa el formato del correo (ej. nombre@empresa.com).";
      return "";
    },
    servicio: (v) => (v ? "" : "Selecciona el servicio que te interesa."),
    mensaje: (v) => {
      v = v.trim();
      if (!v) return "Cuéntanos brevemente sobre tu proyecto.";
      if (v.length < 20) return `Agrega un poco más de detalle (mínimo 20 caracteres, llevas ${v.length}).`;
      if (v.length > 2000) return "El mensaje supera los 2000 caracteres.";
      return "";
    },
    consentimiento: (_v, el) => (el.checked ? "" : "Necesitamos tu autorización para responderte.")
  };

  const errorIds = { nombre: "e-nombre", email: "e-email", servicio: "e-servicio", mensaje: "e-mensaje", consentimiento: "e-consent" };

  function validateField(name) {
    const el = form.elements[name];
    const msg = rules[name](el.value, el);
    const out = document.getElementById(errorIds[name]);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    if (out) out.textContent = msg;
    return !msg;
  }

  // Validar al salir del campo; revalidar en vivo si ya mostraba error.
  Object.keys(rules).forEach((name) => {
    const el = form.elements[name];
    const evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "blur";
    el.addEventListener(evt, () => validateField(name));
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") validateField(name); });
  });

  // Contador de caracteres
  const updateCount = () => { if (counter) counter.textContent = `${message.value.length} / 2000`; };
  message.addEventListener("input", updateCount);
  updateCount();

  function setStatus(text, type) {
    status.textContent = text;
    status.classList.toggle("is-ok", type === "ok");
    status.classList.toggle("is-error", type === "error");
  }

  function setLoading(loading) {
    submit.disabled = loading;
    submitLabel.textContent = loading ? "Enviando…" : "Enviar solicitud";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      setStatus("Revisa los campos marcados.", "error");
      return;
    }

    // Anti-spam: si el campo trampa tiene contenido o el envío es instantáneo, se descarta.
    if (form.elements.website.value || Date.now() - startedAt < 2500) {
      setStatus("No pudimos procesar el envío. Inténtalo de nuevo en unos segundos.", "error");
      return;
    }

    const endpoint = String(cfg.formEndpoint || "").trim();
    if (!endpoint) {
      setStatus("El formulario funciona, pero aún no está conectado a un servicio de envío. Falta configurar formEndpoint en assets/js/config.js.", "error");
      console.warn("[ALSAM] Formulario sin endpoint: configura ALSAM_CONFIG.formEndpoint.");
      return;
    }

    const payload = {
      nombre: form.elements.nombre.value.trim(),
      email: form.elements.email.value.trim(),
      empresa: form.elements.empresa.value.trim(),
      servicio: form.elements.servicio.options[form.elements.servicio.selectedIndex].text,
      mensaje: form.elements.mensaje.value.trim(),
      _subject: "Nueva solicitud desde alsam (sitio web)"
    };

    setLoading(true);
    // Registro en el CRM de ALSAM OS (no bloquea el envío por correo si falla).
    const leadsEndpoint = String(cfg.leadsEndpoint || "").trim();
    if (leadsEndpoint) {
      const key = form.dataset.key || (form.dataset.key = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)));
      fetch(leadsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({
          nombre: payload.nombre, email: payload.email, empresa: payload.empresa,
          telefono: form.elements.telefono ? form.elements.telefono.value.trim() : "",
          servicio_codigo: form.elements.servicio.value, servicio_texto: payload.servicio,
          mensaje: payload.mensaje, consentimiento: form.elements.consentimiento.checked,
          website: form.elements.website.value
        })
      }).catch((err) => console.warn("[ALSAM] CRM no disponible:", err));
    }
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      delete form.dataset.key;
      updateCount();
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.setAttribute("aria-invalid", "false"));
      setStatus("Gracias. Recibimos tu solicitud y te contactaremos pronto.", "ok");
    } catch (err) {
      console.error("[ALSAM] Error al enviar el formulario:", err);
      setStatus("No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
