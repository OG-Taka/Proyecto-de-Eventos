// eventos.js — crud de eventos

// leer
async function cargarEventos() {
  try {
    const response = await api.get('/eventos');
    renderizarEventos(response.data);
  } catch (error) {
    mostrarMensaje('Error al cargar eventos');
    console.error(error);
  }
}

async function renderizarEventos(eventos) {
  const contenedor = document.getElementById('lista-eventos');
  contenedor.innerHTML = '';

  if (eventos.length === 0) {
    contenedor.innerHTML = '<p>No hay eventos registrados.</p>';
    return;
  }

  for (const evento of eventos) {
    const resIns = await api.get('/inscripciones');
    const inscriptos = resIns.data.filter(
      (ins) => String(ins.eventoId) === String(evento.id)
    ).length;

    const bloque = document.createElement('div');
    bloque.innerHTML = `
      <hr>
      <p><strong>${evento.nombre}</strong> [${evento.estado}]</p>
      <p>Fecha: ${evento.fecha} | Lugar: ${evento.lugar} | Inscriptos: ${inscriptos}/${evento.capacidad}</p>
      <button class="btn-editar">Editar</button>
      <button class="btn-eliminar">Eliminar</button>
    `;

    bloque.querySelector('.btn-editar').addEventListener('click', () => {
      prepararEdicionEvento(evento.id);
    });
    bloque.querySelector('.btn-eliminar').addEventListener('click', () => {
      confirmarAccion(
        `¿Eliminar el evento "${evento.nombre}"?`,
        () => eliminarEvento(evento.id)
      );
    });

    contenedor.appendChild(bloque);
  }
}

// crear / actualizar
document.getElementById('form-evento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id    = document.getElementById('evento-id').value;
  const datos = {
    nombre:    document.getElementById('evento-nombre').value.trim(),
    fecha:     document.getElementById('evento-fecha').value,
    lugar:     document.getElementById('evento-lugar').value.trim(),
    capacidad: parseInt(document.getElementById('evento-capacidad').value),
    estado:    document.getElementById('evento-estado').value,
  };

  try {
    if (id) {
      await api.patch(`/eventos/${id}`, datos);
      mostrarMensaje('Evento actualizado correctamente');
    } else {
      await api.post('/eventos', datos);
      mostrarMensaje('Evento creado correctamente');
    }
    resetFormEvento();
    cargarEventos();
  } catch (error) {
    mostrarMensaje('Error al guardar el evento');
    console.error(error);
  }
});

// preparar edición
async function prepararEdicionEvento(id) {
  try {
    const response = await api.get(`/eventos/${id}`);
    const evento = response.data;

    document.getElementById('evento-id').value        = evento.id;
    document.getElementById('evento-nombre').value    = evento.nombre;
    document.getElementById('evento-fecha').value     = evento.fecha;
    document.getElementById('evento-lugar').value     = evento.lugar;
    document.getElementById('evento-capacidad').value = evento.capacidad;
    document.getElementById('evento-estado').value    = evento.estado;

    document.getElementById('titulo-form-evento').textContent     = 'Editar Evento';
    document.getElementById('btn-guardar-evento').textContent     = 'Actualizar Evento';
    document.getElementById('btn-cancelar-evento').style.display = 'inline';
  } catch (error) {
    mostrarMensaje('Error al cargar el evento');
    console.error(error);
  }
}

// cancelar edición
document.getElementById('btn-cancelar-evento').addEventListener('click', resetFormEvento);

function resetFormEvento() {
  document.getElementById('form-evento').reset();
  document.getElementById('evento-id').value                    = '';
  document.getElementById('titulo-form-evento').textContent     = 'Nuevo Evento';
  document.getElementById('btn-guardar-evento').textContent     = 'Guardar Evento';
  document.getElementById('btn-cancelar-evento').style.display = 'none';
}

// eliminar
async function eliminarEvento(id) {
  try {
    await api.delete(`/eventos/${id}`);
    mostrarMensaje('Evento eliminado correctamente');
    cargarEventos();
  } catch (error) {
    mostrarMensaje('Error al eliminar el evento');
    console.error(error);
  }
}
