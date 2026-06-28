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
const btnAgregar = document.querySelector('button[type="button"]');
const listaActividades = document.querySelector('ul');
const tituloDia = document.querySelector('h3');

// Botones de navegación (el primer nav dentro del section del calendario)
const navButtons = document.querySelectorAll('section > header nav button');
const btnPrev = navButtons[0];
const btnNext = navButtons[1];

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
        li.innerHTML = `
            <span class="font-bold text-DeepSlate text-sm">${act.nombre}</span>
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
                const nuevaActividad = { id: result.actividad.id, nombre: result.actividad.descripcion, hora: result.actividad.hora };
                
                if (!actividades[diaSeleccionado]) actividades[diaSeleccionado] = [];
                actividades[diaSeleccionado].push(nuevaActividad);
                // Ordenar por hora
                actividades[diaSeleccionado].sort((a, b) => a.hora.localeCompare(b.hora));
                
                inputActividad.value = '';
                inputHora.value = '';
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
                hora: item.hora
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
