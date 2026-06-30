// inscripciones.js — crud de inscripciones

// cargar eventos en el selector
async function cargarSelectorEventos() {
  try {
    const response = await api.get('/eventos');
    const select = document.getElementById('select-evento-inscripcion');
    select.innerHTML = '<option value="">-- Elegir evento --</option>';
    response.data.forEach((evento) => {
      const option = document.createElement('option');
      option.value = evento.id;
      option.textContent = `${evento.nombre} (${evento.fecha})`;
      select.appendChild(option);
    });
  } catch (error) {
    mostrarMensaje('Error al cargar eventos');
    console.error(error);
  }
}

// cargar participantes en el selector
async function cargarSelectorParticipantes() {
  try {
    const response = await api.get('/participantes');
    const select = document.getElementById('select-participante-inscripcion');
    select.innerHTML = '<option value="">-- Elegir participante --</option>';
    response.data.forEach((p) => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.nombre;
      select.appendChild(option);
    });
  } catch (error) {
    mostrarMensaje('Error al cargar participantes');
    console.error(error);
  }
}

// al cambiar el evento seleccionado
document.getElementById('select-evento-inscripcion').addEventListener('change', async (e) => {
  const eventoId = e.target.value;
  const formInscripcion = document.getElementById('form-inscripcion');

  if (!eventoId) {
    document.getElementById('lista-inscripciones').innerHTML = '';
    formInscripcion.style.display = 'none';
    return;
  }

  formInscripcion.style.display = 'block';
  await cargarSelectorParticipantes();
  await cargarInscripciones(eventoId);
});

// leer
async function cargarInscripciones(eventoId) {
  try {
    const response = await api.get(`/inscripciones?eventoId=${eventoId}`);
    renderizarInscripciones(response.data);
  } catch (error) {
    mostrarMensaje('Error al cargar inscripciones');
    console.error(error);
  }
}

async function renderizarInscripciones(inscripciones) {
  const contenedor = document.getElementById('lista-inscripciones');
  contenedor.innerHTML = '';

  if (inscripciones.length === 0) {
    contenedor.innerHTML = '<p>No hay participantes inscriptos en este evento.</p>';
    return;
  }

  for (const inscripcion of inscripciones) {
    const resP = await api.get(`/participantes/${inscripcion.participanteId}`);
    const participante = resP.data;

    const bloque = document.createElement('div');
    bloque.innerHTML = `
      <hr>
      <p><strong>${participante.nombre}</strong> [${inscripcion.estado}]</p>
      <p>Inscripto el: ${inscripcion.fecha} | Correo: ${participante.correo}</p>
      <label>Estado:
        <select id="estado-ins-${inscripcion.id}">
          <option value="Confirmado" ${inscripcion.estado === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
          <option value="Asistió"    ${inscripcion.estado === 'Asistió'    ? 'selected' : ''}>Asistió</option>
          <option value="Ausente"    ${inscripcion.estado === 'Ausente'    ? 'selected' : ''}>Ausente</option>
        </select>
      </label>
      <button class="btn-guardar">Guardar estado</button>
      <button class="btn-cancelar">Cancelar inscripción</button>
    `;

    bloque.querySelector('.btn-guardar').addEventListener('click', () => {
      actualizarEstadoInscripcion(inscripcion.id);
    });
    bloque.querySelector('.btn-cancelar').addEventListener('click', () => {
      confirmarAccion(
        `¿Cancelar la inscripción de "${participante.nombre}"?`,
        () => eliminarInscripcion(inscripcion.id)
      );
    });

    contenedor.appendChild(bloque);
  }
}

// crear
document.getElementById('form-inscripcion').addEventListener('submit', async (e) => {
  e.preventDefault();

  const eventoId       = document.getElementById('select-evento-inscripcion').value;
  const participanteId = document.getElementById('select-participante-inscripcion').value;

  if (!eventoId || !participanteId) {
    mostrarMensaje('Seleccioná un evento y un participante');
    return;
  }

  try {
    const resCheck = await api.get(`/inscripciones?eventoId=${eventoId}&participanteId=${participanteId}`);
    if (resCheck.data.length > 0) {
      mostrarMensaje('El participante ya está inscripto en este evento');
      return;
    }

    const resEvento = await api.get(`/eventos/${eventoId}`);
    const resIns    = await api.get(`/inscripciones?eventoId=${eventoId}`);
    if (resIns.data.length >= resEvento.data.capacidad) {
      mostrarMensaje('El evento ya alcanzó su capacidad máxima');
      return;
    }

    await api.post('/inscripciones', {
      eventoId:       parseInt(eventoId),
      participanteId: parseInt(participanteId),
      fecha:          new Date().toLocaleDateString(),
      estado:         'Confirmado',
    });

    mostrarMensaje('Participante inscripto correctamente');
    document.getElementById('select-participante-inscripcion').value = '';
    cargarInscripciones(eventoId);
  } catch (error) {
    mostrarMensaje('Error al inscribir participante');
    console.error(error);
  }
});

// actualizar estado
async function actualizarEstadoInscripcion(id) {
  const nuevoEstado = document.getElementById(`estado-ins-${id}`).value;
  try {
    await api.patch(`/inscripciones/${id}`, { estado: nuevoEstado });
    mostrarMensaje('Estado actualizado correctamente');
    const eventoId = document.getElementById('select-evento-inscripcion').value;
    cargarInscripciones(eventoId);
  } catch (error) {
    mostrarMensaje('Error al actualizar el estado');
    console.error(error);
  }
}

// eliminar
async function eliminarInscripcion(id) {
  try {
    await api.delete(`/inscripciones/${id}`);
    mostrarMensaje('Inscripción cancelada correctamente');
    const eventoId = document.getElementById('select-evento-inscripcion').value;
    cargarInscripciones(eventoId);
  } catch (error) {
    mostrarMensaje('Error al cancelar la inscripción');
    console.error(error);
  }
}
