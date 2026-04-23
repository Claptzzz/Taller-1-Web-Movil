//Script para manejar calendario y actividades diarias, temporal
// Obtener fecha actual
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth(); // 0-based
const currentDay = today.getDate();

// Objeto para almacenar actividades por fecha (ej: '2026-04-10')
let actividades = JSON.parse(localStorage.getItem('actividades')) || {};

// Día seleccionado actualmente (por defecto, hoy)
let diaSeleccionado = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

// Elementos del DOM
const calendarioHeader = document.querySelector('h2'); // "Abril 2026"
const calendarioTbody = document.querySelector('tbody');
const formActividad = document.querySelector('form');
const inputActividad = document.querySelector('input[placeholder="Ej: Running 5km"]');
const inputHora = document.querySelector('input[type="time"]');
const btnAgregar = document.querySelector('button[type="button"]');
const listaActividades = document.querySelector('ul');
const tituloDia = document.querySelector('h3'); // "Hoy: Viernes 10"

// Función para generar el calendario
function generarCalendario() {
    calendarioHeader.textContent = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

    calendarioTbody.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lunes como primer día

    let day = 1;
    for (let week = 0; week < 6; week++) {
        const tr = document.createElement('tr');
        for (let wd = 0; wd < 7; wd++) {
            const td = document.createElement('td');
            td.className = 'p-3 bg-white/10 hover:bg-sky-200 hover:text-DeepSlate rounded-2xl transition-all cursor-pointer';
            if (week === 0 && wd < startDay) {
                td.classList.add('opacity-30', 'italic');
                td.textContent = '';
            } else if (day > lastDay.getDate()) {
                td.classList.add('opacity-30', 'italic');
                td.textContent = '';
            } else {
                td.textContent = day;
                if (day === currentDay) {
                    td.classList.add('bg-sky-200', 'text-DeepSlate', 'ring-2', 'ring-OatmilkFoam');
                }
                day++;
            }
            tr.appendChild(td);
        }
        calendarioTbody.appendChild(tr);
        if (day > lastDay.getDate()) break;
    }
}

// Función para actualizar la lista de actividades del día seleccionado
function actualizarLista() {
    listaActividades.innerHTML = '';
    const acts = actividades[diaSeleccionado] || [];
    acts.forEach(act => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-OatmilkFoam p-4 rounded-2xl border-l-4 border-DeepSlate';
        li.innerHTML = `
            <span class="font-bold text-DeepSlate text-sm uppercase italic">${act.nombre}</span>
            <span class="text-xs font-black opacity-50 uppercase tracking-tighter">${act.hora}</span>
        `;
        listaActividades.appendChild(li);
    });
}

// Función para formatear fecha
function formatearFecha(dia) {
    return `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
}

// Event listeners para días del calendario (delegación de eventos)
calendarioTbody.addEventListener('click', (e) => {
    if (e.target.tagName === 'TD' && !e.target.classList.contains('opacity-30')) {
        // Quitar selección anterior
        document.querySelectorAll('tbody td').forEach(cell => cell.classList.remove('bg-sky-200', 'text-DeepSlate', 'ring-2', 'ring-OatmilkFoam'));
        
        // Seleccionar nuevo día
        e.target.classList.add('bg-sky-200', 'text-DeepSlate', 'ring-2', 'ring-OatmilkFoam');
        const dia = parseInt(e.target.textContent.trim());
        diaSeleccionado = formatearFecha(dia);
        
        // Actualizar título del día
        const fecha = new Date(diaSeleccionado);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        tituloDia.textContent = `Hoy: ${diasSemana[fecha.getDay()]} ${dia}`;
        
        // Actualizar lista
        actualizarLista();
    }
});

// Event listener para agregar actividad
btnAgregar.addEventListener('click', () => {
    const nombre = inputActividad.value.trim();
    const hora = inputHora.value;
    if (nombre && hora) {
        if (!actividades[diaSeleccionado]) actividades[diaSeleccionado] = [];
        actividades[diaSeleccionado].push({ nombre, hora });
        localStorage.setItem('actividades', JSON.stringify(actividades));
        inputActividad.value = '';
        inputHora.value = '';
        actualizarLista();
    }
});

// Inicializar
generarCalendario();
actualizarLista();