/* Praxia · landing "unete" · sin dependencias */
(function () {
  'use strict';

  var ZOOM = 'https://us06web.zoom.us/j/2411834937?pwd=VMdDqUSH9bmFulStR44VmJWD4kCLHA.1&omn=89924839785';
  var CANAL = 'https://whatsapp.com/channel/0029VbEDpVA6hENrgjZx3Y0P';

  // Codigo de vendedor: minusculas, sin acentos, solo [a-z0-9-_], max 40; vacio -> "directo".
  function normalizeRef(raw) {
    var s = String(raw == null ? '' : raw).toLowerCase();
    try { s = s.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* sin normalize */ }
    s = s.replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    return s || 'directo';
  }
  function isWhatsapp(v) { return /^\+?[0-9]{7,16}$/.test(v); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 254; }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { normalizeRef: normalizeRef, isWhatsapp: isWhatsapp, isEmail: isEmail, ZOOM: ZOOM, CANAL: CANAL };
  }
  if (typeof document === 'undefined') return;

  var $ = function (id) { return document.getElementById(id); };
  var form = $('form');
  var okBox = $('ok');
  if (!form || !okBox) return;

  var ref = normalizeRef(new URLSearchParams(location.search).get('ref'));
  form.elements.vendedor.value = ref;
  form.elements.ref.value = ref;

  function showAccess(nombre) {
    $('ok-nombre').textContent = nombre;
    form.hidden = true;
    $('intro').hidden = true;
    okBox.hidden = false;
    try { okBox.scrollIntoView({ block: 'start' }); okBox.focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  // Solo para capturar la pantalla de exito sin enviar nada.
  if (location.hash === '#demo-exito') { showAccess('Ana'); return; }

  // Una sola llamada a tw.lead por envio, con el payload canonico (el snippet captura el <form data-lead>
  // por su cuenta: se intercepta esa llamada para que no haya lead duplicado ni claves distintas).
  var sent = false, canonical = null;
  function hookTw() {
    var tw = window.tw;
    if (!tw || tw.__praxiaHook || typeof tw.lead !== 'function') return;
    var orig = tw.lead;
    tw.__praxiaHook = true;
    tw.lead = function (data) {
      if (!canonical) return orig.call(tw, data);
      if (sent) return;
      sent = true;
      return orig.call(tw, canonical);
    };
  }
  ['DOMContentLoaded', 'load'].forEach(function (ev) { window.addEventListener(ev, hookTw); });
  form.addEventListener('focusin', hookTw);

  function setErr(name, msg) {
    var el = $('e-' + name);
    var input = form.elements[name];
    el.textContent = msg || '';
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }

  var busy = false;
  // Captura en document y antes que el snippet (app.js va antes de t.js): valida, fija el payload
  // canonico y, si hay error, corta la propagacion para que el snippet no registre un lead invalido.
  document.addEventListener('submit', function (e) {
    if (e.target !== form) return;
    e.preventDefault();
    if (busy) { e.stopImmediatePropagation(); return; }
    var f = form.elements;
    var nombre = f.nombre.value.trim();
    var wa = f.whatsapp.value.replace(/[\s().-]/g, '');
    var email = f.email.value.trim();
    var okN = setErr('nombre', nombre ? '' : 'Escribe tu nombre.');
    var okW = setErr('whatsapp', isWhatsapp(wa) ? '' : 'Usa solo números y el código de país, por ejemplo +573001234567.');
    var okE = setErr('email', isEmail(email) ? '' : 'Escribe un correo válido.');
    var okC = setErr('consent', f.consent.checked ? '' : 'Necesitamos que aceptes para enviarte el acceso.');
    if (!(okN && okW && okE && okC)) {
      e.stopImmediatePropagation();
      var bad = form.querySelector('[aria-invalid="true"]');
      if (bad) bad.focus();
      return;
    }
    busy = true;
    $('btn').disabled = true;
    $('btn').textContent = 'Enviando…';
    canonical = { name: nombre, contact: wa, fields: { email: email, vendedor: ref, ref: ref } };
    hookTw();
    showAccess(nombre);
    // Respaldo: si el snippet no capturo el form (no cargo), se llama a tw.lead una vez. Nunca bloquea la UI.
    setTimeout(function () {
      try {
        if (!sent && window.tw && typeof window.tw.lead === 'function') window.tw.lead(canonical);
      } catch (err) { /* el tracking nunca bloquea el acceso */ }
    }, 0);
  }, true);
})();
