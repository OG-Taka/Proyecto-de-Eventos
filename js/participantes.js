// participantes.js — crud de participantes

// leer
async function cargarParticipantes() {
  try {
    const response = await api.get('/participantes');
    renderizarParticipantes(response.data);
  } catch (error) {
    mostrarMensaje('Error al cargar participantes');
    console.error(error);
  }
}

function renderizarParticipantes(participantes) {
  const contenedor = document.getElementById('lista-participantes');
  contenedor.innerHTML = '';

  if (participantes.length === 0) {
    contenedor.innerHTML = '<p>No hay participantes registrados.</p>';
    return;
  }

  participantes.forEach((participante) => {
    const bloque = document.createElement('div');
    bloque.innerHTML = `
      <hr>
      <p><strong>${participante.nombre}</strong></p>
      <p>Correo: ${participante.correo} | Teléfono: ${participante.telefono}</p>
      <button class="btn-editar">Editar</button>
      <button class="btn-eliminar">Eliminar</button>
    `;

    bloque.querySelector('.btn-editar').addEventListener('click', () => {
      prepararEdicionParticipante(participante.id);
    });
    bloque.querySelector('.btn-eliminar').addEventListener('click', () => {
      confirmarAccion(
        `¿Eliminar a "${participante.nombre}"?`,
        () => eliminarParticipante(participante.id)
      );
    });

    contenedor.appendChild(bloque);
  });
}

// crear / actualizar
document.getElementById('form-participante').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id    = document.getElementById('participante-id').value;
  const datos = {
    nombre:   document.getElementById('participante-nombre').value.trim(),
    correo:   document.getElementById('participante-correo').value.trim(),
    telefono: document.getElementById('participante-telefono').value.trim(),
  };

  try {
    if (id) {
      await api.patch(`/participantes/${id}`, datos);
      mostrarMensaje('Participante actualizado correctamente');
    } else {
      await api.post('/participantes', datos);
      mostrarMensaje('Participante registrado correctamente');
    }
    resetFormParticipante();
    cargarParticipantes();
  } catch (error) {
    mostrarMensaje('Error al guardar el participante');
    console.error(error);
  }
});

// preparar edición
async function prepararEdicionParticipante(id) {
  try {
    const response = await api.get(`/participantes/${id}`);
    const p = response.data;

    document.getElementById('participante-id').value       = p.id;
    document.getElementById('participante-nombre').value   = p.nombre;
    document.getElementById('participante-correo').value   = p.correo;
    document.getElementById('participante-telefono').value = p.telefono;

    document.getElementById('titulo-form-participante').textContent     = 'Editar Participante';
    document.getElementById('btn-guardar-participante').textContent     = 'Actualizar Participante';
    document.getElementById('btn-cancelar-participante').style.display = 'inline';
  } catch (error) {
    mostrarMensaje('Error al cargar el participante');
    console.error(error);
  }
}

// cancelar edición
document.getElementById('btn-cancelar-participante').addEventListener('click', resetFormParticipante);

function resetFormParticipante() {
  document.getElementById('form-participante').reset();
  document.getElementById('participante-id').value                     = '';
  document.getElementById('titulo-form-participante').textContent      = 'Nuevo Participante';
  document.getElementById('btn-guardar-participante').textContent      = 'Guardar Participante';
  document.getElementById('btn-cancelar-participante').style.display  = 'none';
}

// eliminar
async function eliminarParticipante(id) {
  try {
    await api.delete(`/participantes/${id}`);
    mostrarMensaje('Participante eliminado correctamente');
    cargarParticipantes();
  } catch (error) {
    mostrarMensaje('Error al eliminar el participante');
    console.error(error);
  }
}
