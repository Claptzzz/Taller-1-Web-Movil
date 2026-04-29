//Script para manejar calendario y actividades diarias
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();

let actividades = {};

let diaSeleccionado = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

const calendarioHeader = document.querySelector('h2');
const calendarioTbody = document.querySelector('tbody');
const formActividad = document.querySelector('form');
const inputActividad = document.querySelector('input[placeholder="Ej: Running 5km"]');
const inputHora = document.querySelector('input[type="time"]');
const btnAgregar = document.querySelector('button[type="button"]');
const listaActividades = document.querySelector('ul');
const tituloDia = document.querySelector('h3');

function generarCalendario() {
    calendarioHeader.textContent = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());

    calendarioTbody.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

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

function formatearFecha(dia) {
    return `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
}

calendarioTbody.addEventListener('click', (e) => {
    if (e.target.tagName === 'TD' && !e.target.classList.contains('opacity-30')) {
        document.querySelectorAll('tbody td').forEach(cell => cell.classList.remove('bg-sky-200', 'text-DeepSlate', 'ring-2', 'ring-OatmilkFoam'));

        e.target.classList.add('bg-sky-200', 'text-DeepSlate', 'ring-2', 'ring-OatmilkFoam');
        const dia = parseInt(e.target.textContent.trim());
        diaSeleccionado = formatearFecha(dia);

        const fecha = new Date(diaSeleccionado);
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        tituloDia.textContent = `Hoy: ${diasSemana[fecha.getDay()]} ${dia}`;

        actualizarLista();
    }
});

btnAgregar.addEventListener('click', () => {
    const nombre = inputActividad.value.trim();
    const hora = inputHora.value;
    if (nombre && hora) {
        if (!actividades[diaSeleccionado]) actividades[diaSeleccionado] = [];
        actividades[diaSeleccionado].push({ nombre, hora });
        inputActividad.value = '';
        inputHora.value = '';
        actualizarLista();
    }
});

generarCalendario();

if (localStorage.getItem('tipoSesion') === 'login') {
    fetch('../data/actividades.json').then(res => res.json()).then(data => {
        actividades = data.actividades;
        actualizarLista();
    });
}
