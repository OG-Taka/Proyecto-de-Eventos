// api.js — configuración base de axios y utilidades compartidas

const BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

// mensaje de feedback
function mostrarMensaje(mensaje) {
  const el = document.getElementById('mensaje');
  el.textContent = mensaje;
  setTimeout(() => el.textContent = '', 3000);
}

// confirmación nativa del navegador
function confirmarAccion(mensaje, callback) {
  if (confirm(mensaje)) callback();
}
