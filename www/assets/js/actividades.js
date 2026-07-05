//Script para manejar calendario y actividades diarias
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let currentDay = today.getDate();

let actividades = {}; // Mapeo: 'YYYY-MM-DD' -> [{id, nombre, hora}]
const token = localStorage.getItem('token');
const API_URL = 'https://salud-api-rzk9.onrender.com';

let diaSeleccionado = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

const calendarioHeader = document.querySelector('h2');
const calendarioTbody = document.querySelector('tbody');
const formActividad = document.querySelector('form');
const inputActividad = document.querySelector('input[type="text"]');
const inputHora = document.querySelector('input[type="time"]');
const btnAgregar = document.getElementById('btn_agregar');
const listaActividades = document.querySelector('ul');
const tituloDia = document.querySelector('h3');

// Botones de navegación (el primer nav dentro del section del calendario)
const navButtons = document.querySelectorAll('section > header nav button');
const btnPrev = navButtons[0];
const btnNext = navButtons[1];

// --- Ubicación GPS ---
const btnUbicacion = document.getElementById('btn_ubicacion');
const btnUbicacionTexto = document.getElementById('btn_ubicacion_texto');
const chipUbicacion = document.getElementById('chip_ubicacion');
const chipUbicacionTexto = document.getElementById('chip_ubicacion_texto');
const btnQuitarUbicacion = document.getElementById('btn_quitar_ubicacion');
const errorUbicacion = document.getElementById('error_ubicacion');

let ubicacionCapturada = null; // {lat, lng} para la próxima actividad

function obtenerPosicion() {
    const opciones = { enableHighAccuracy: true, timeout: 10000 };
    const geoCapacitor = window.Capacitor?.Plugins?.Geolocation;
    if (geoCapacitor) {
        return geoCapacitor.getCurrentPosition(opciones);
    }
    // Fallback para navegador de escritorio (pruebas en Chrome)
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('La geolocalización no está disponible en este dispositivo'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, opciones);
    });
}

function mostrarChipUbicacion() {
    chipUbicacionTexto.textContent = `${ubicacionCapturada.lat.toFixed(4)}, ${ubicacionCapturada.lng.toFixed(4)}`;
    chipUbicacion.hidden = false;
    // Doble rAF: asegura que el estado inicial (opacity-0 scale-95) se pinte antes de transicionar
    requestAnimationFrame(() => requestAnimationFrame(() => {
        chipUbicacion.classList.remove('opacity-0', 'scale-95');
    }));
}

function ocultarChipUbicacion() {
    chipUbicacion.classList.add('opacity-0', 'scale-95');
    chipUbicacion.hidden = true;
}

function setEstadoUbicacion(estado) {
    errorUbicacion.hidden = true;
    switch (estado) {
        case 'idle':
            btnUbicacion.disabled = false;
            btnUbicacionTexto.textContent = 'Agregar mi ubicación';
            ocultarChipUbicacion();
            break;
        case 'loading':
            btnUbicacion.disabled = true;
            btnUbicacionTexto.textContent = 'Obteniendo ubicación…';
            break;
        case 'success':
            btnUbicacion.disabled = false;
            btnUbicacionTexto.textContent = 'Ubicación lista ✓';
            mostrarChipUbicacion();
            break;
    }
}

btnUbicacion.addEventListener('click', async () => {
    setEstadoUbicacion('loading');
    try {
        const posicion = await obtenerPosicion();
        ubicacionCapturada = {
            lat: posicion.coords.latitude,
            lng: posicion.coords.longitude
        };
        setEstadoUbicacion('success');
    } catch (err) {
        ubicacionCapturada = null;
        setEstadoUbicacion('idle');
        const denegado = err?.code === 1 || /denied|denegad/i.test(err?.message || '');
        errorUbicacion.textContent = denegado
            ? 'Permiso de ubicación denegado. Puedes activarlo en los ajustes del teléfono.'
            : 'No se pudo obtener tu ubicación. Intenta de nuevo.';
        errorUbicacion.hidden = false;
    }
});

btnQuitarUbicacion.addEventListener('click', () => {
    ubicacionCapturada = null;
    setEstadoUbicacion('idle');
});

function generarCalendario() {
    const renderDate = new Date(currentYear, currentMonth, 1);
    calendarioHeader.textContent = renderDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();

    calendarioTbody.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    let day = 1;
    for (let week = 0; week < 6; week++) {
        const tr = document.createElement('tr');
        for (let wd = 0; wd < 7; wd++) {
            const td = document.createElement('td');
            td.className = 'p-1';
            
            const div = document.createElement('div');
            
            // Check if this day corresponds to 'today'
            const isToday = (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
            
            if (week === 0 && wd < startDay) {
                div.className = 'h-9 w-9 mx-auto flex items-center justify-center text-gray-300';
                div.textContent = '';
            } else if (day > lastDay.getDate()) {
                div.className = 'h-9 w-9 mx-auto flex items-center justify-center text-gray-300';
                div.textContent = '';
            } else {
                div.textContent = day;
                
                // Formatear la fecha que esta celda representa
                const cellDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                div.dataset.date = cellDate;
                
                if (cellDate === diaSeleccionado) {
                    // Seleccionado
                    div.className = 'cell-day h-9 w-9 mx-auto flex items-center justify-center rounded-full bg-DeepSlate text-white shadow-md cursor-pointer';
                } else if (isToday) {
                    // Hoy pero no seleccionado
                    div.className = 'cell-day h-9 w-9 mx-auto flex items-center justify-center rounded-full border-2 border-sky-400 text-sky-500 hover:bg-sky-100 transition-colors cursor-pointer';
                } else {
                    // Normal
                    div.className = 'cell-day h-9 w-9 mx-auto flex items-center justify-center rounded-full hover:bg-sky-100 transition-colors cursor-pointer';
                }
                day++;
            }
            td.appendChild(div);
            tr.appendChild(td);
        }
        calendarioTbody.appendChild(tr);
        if (day > lastDay.getDate()) break;
    }
}

function actualizarLista() {
    listaActividades.innerHTML = '';
    const acts = actividades[diaSeleccionado] || [];
    
    if (acts.length === 0) {
        listaActividades.innerHTML = '<p class="text-center text-gray-400 italic text-sm mt-4 mb-4">No hay actividades planificadas.</p>';
        return;
    }

    acts.forEach(act => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-gray-50 p-4 rounded-2xl border-l-4 border-DeepSlate shadow-sm';
        const tieneUbicacion = act.lat != null && act.lng != null;
        const linkMapa = tieneUbicacion
            ? `<a href="https://www.google.com/maps?q=${act.lat},${act.lng}" target="_blank" rel="noopener"
                  class="text-[11px] font-medium text-sky-600 hover:text-sky-700 transition-colors duration-150">Ver en mapa</a>`
            : '';
        li.innerHTML = `
            <div class="flex flex-col gap-0.5">
                <span class="font-bold text-DeepSlate text-sm">${act.nombre}</span>
                ${linkMapa}
            </div>
            <span class="text-xs font-black text-gray-400 uppercase bg-white px-2 py-1 rounded-lg">${act.hora}</span>
        `;
        listaActividades.appendChild(li);
    });
}

// Navegación de meses
btnPrev.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generarCalendario();
});

btnNext.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generarCalendario();
});

calendarioTbody.addEventListener('click', (e) => {
    const div = e.target.closest('div.cell-day');
    if (div) {
        diaSeleccionado = div.dataset.date;
        generarCalendario(); // Volvemos a pintar el calendario para reflejar la selección
        
        const fecha = new Date(diaSeleccionado + 'T00:00:00'); // Evitar timezone issues
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        tituloDia.textContent = `Hoy: ${diasSemana[fecha.getDay()]} ${fecha.getDate()}`;

        actualizarLista();
    }
});

btnAgregar.addEventListener('click', async () => {
    const nombre = inputActividad.value.trim();
    const hora = inputHora.value;
    
    if (!nombre || !hora) {
        alert("Por favor, ingresa una actividad y una hora.");
        return;
    }

    const actividadData = {
        descripcion: nombre,
        hora: hora,
        fecha: diaSeleccionado
    };

    // Solo enviamos la ubicación si el usuario la capturó
    if (ubicacionCapturada) {
        actividadData.lat = ubicacionCapturada.lat;
        actividadData.lng = ubicacionCapturada.lng;
    }

    if (token) {
        // Guardar en el backend
        try {
            const response = await fetch(`${API_URL}/actividades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(actividadData)
            });

            if (response.ok) {
                const result = await response.json();
                const nuevaActividad = {
                    id: result.actividad.id,
                    nombre: result.actividad.descripcion,
                    hora: result.actividad.hora,
                    lat: result.actividad.lat,
                    lng: result.actividad.lng
                };

                if (!actividades[diaSeleccionado]) actividades[diaSeleccionado] = [];
                actividades[diaSeleccionado].push(nuevaActividad);
                // Ordenar por hora
                actividades[diaSeleccionado].sort((a, b) => a.hora.localeCompare(b.hora));

                inputActividad.value = '';
                inputHora.value = '';
                ubicacionCapturada = null;
                setEstadoUbicacion('idle');
                actualizarLista();
            } else {
                alert("Error al guardar la actividad en el servidor.");
            }
        } catch (error) {
            alert("Fallo la conexión con el servidor.");
        }
    } else {
        alert("Debes iniciar sesión para planificar actividades.");
    }
});

// Inicialización de la vista
const initFecha = new Date(diaSeleccionado + 'T00:00:00');
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
tituloDia.textContent = `Hoy: ${diasSemana[initFecha.getDay()]} ${initFecha.getDate()}`;

generarCalendario();

// Cargar actividades desde el backend
if (token) {
    fetch(`${API_URL}/actividades/calendario`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        // Transformar la respuesta del backend al formato que usa el frontend
        // Backend manda: { "2026-04-10": [{id: 1, descripcion: "Yoga", hora: "07:00"}], ... }
        actividades = {};
        for (let date in data) {
            actividades[date] = data[date].map(item => ({
                id: item.id,
                nombre: item.descripcion,
                hora: item.hora,
                lat: item.lat,
                lng: item.lng
            }));
        }
        actualizarLista();
    })
    .catch(() => {
        console.error("No se pudieron cargar las actividades del backend");
        actualizarLista();
    });
} else {
    actualizarLista();
}
