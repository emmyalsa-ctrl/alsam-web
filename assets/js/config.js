/**
 * ALSAM · Configuración del sitio
 * --------------------------------------------------------------------------
 * Único archivo que hay que tocar para conectar servicios externos.
 * Mientras un valor esté vacío, la función correspondiente queda desactivada
 * y el sitio lo indica con honestidad (no simula que funciona).
 */
window.ALSAM_CONFIG = Object.freeze({
  /**
   * Endpoint que recibe el formulario de contacto (POST, JSON).
   * Compatible con Formspree: crea un formulario en https://formspree.io
   * y pega aquí la URL, p. ej. "https://formspree.io/f/abcdwxyz".
   * Si usas otro proveedor o un backend propio, actualiza también
   * connect-src y form-action en la Content-Security-Policy de index.html.
   */
  /** Endpoint de ALSAM OS que registra el prospecto en el CRM. Vacío = desactivado.
   *  Producción: "https://<tu-dominio-de-alsam-os>/api/public/leads" (y añadirlo a connect-src). */
  leadsEndpoint: "http://localhost:3000/api/public/leads",

  formEndpoint: "https://formspree.io/f/xoedadrg",

  /**
   * Número oficial de WhatsApp en formato internacional, solo dígitos.
   * Ejemplo México: "5215512345678". Vacío = el botón no se muestra.
   */
  whatsappNumber: "526143824529",

  /** Mensaje prellenado al abrir WhatsApp. */
  whatsappMessage: "Hola ALSAM, me gustaría conocer más sobre sus servicios."
});
