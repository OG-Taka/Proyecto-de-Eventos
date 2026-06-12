// Axios y utilidades


const BASE_URL = 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });


function mostrarMensaje(mensaje) {
  const el = document.getElementById('mensaje');
  el.textContent = mensaje;
  setTimeout(() => el.textContent = '', 3000);
}


function confirmarAccion(mensaje, callback) {
  if (confirm(mensaje)) callback();
}
