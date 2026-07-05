const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
let sleepHours = [0, 0, 0, 0, 0, 0, 0];
let sleepColors = ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb']; // Gris claro por defecto

const colorText = '#5E6373'; // DeepSlateLight
const colorGrid = 'rgba(64, 67, 78, 0.1)';

const ctx = document.getElementById('sleepChart').getContext('2d');
const sleepChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: days,
        datasets: [{
            label: 'Horas dormidas',
            data: sleepHours,
            backgroundColor: sleepColors,
            borderRadius: 8,
            borderSkipped: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 12,
                ticks: { color: colorText, stepSize: 2 },
                grid: { color: colorGrid },
                title: { display: true, text: 'Horas', color: colorText }
            },
            x: {
                ticks: { color: colorText },
                grid: { display: false },
                title: { display: true, text: 'Día de la semana', color: colorText }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.raw + ' horas';
                    }
                }
            }
        }
    }
});

// --- Modo análisis en landscape ---
// Al rotar, el CSS (.pagina-sueno) expande el contenedor; aquí forzamos el
// reflow del canvas y subimos la legibilidad de ticks y títulos de ejes.
const mqLandscape = window.matchMedia('(orientation: landscape)');

function ajustarGraficoOrientacion(esLandscape) {
    const tamanoTicks = esLandscape ? 16 : 12;
    const tamanoTitulos = esLandscape ? 14 : 12;
    sleepChart.options.scales.x.ticks.font = { size: tamanoTicks };
    sleepChart.options.scales.y.ticks.font = { size: tamanoTicks };
    sleepChart.options.scales.x.title.font = { size: tamanoTitulos };
    sleepChart.options.scales.y.title.font = { size: tamanoTitulos };

    // rAF: espera a que el layout del nuevo modo esté aplicado antes de medir
    requestAnimationFrame(() => {
        sleepChart.resize();
        sleepChart.update();
    });
}

mqLandscape.addEventListener('change', (e) => ajustarGraficoOrientacion(e.matches));
ajustarGraficoOrientacion(mqLandscape.matches); // estado inicial (ej: abrir ya rotado)

const token = localStorage.getItem('token');
const API_URL = 'https://salud-api-rzk9.onrender.com';

function getHoy() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today.getTime() - offset)).toISOString().split('T')[0];
}

function getColorForQuality(calidad) {
    switch (calidad) {
        case 'BAJA': return '#ef4444'; // red-500
        case 'MEDIA': return '#ca8a04'; // yellow-600
        case 'ALTA': return '#22c55e'; // green-500
        default: return '#e5e7eb'; // default grey
    }
}

// Obtener datos de la semana actual
if (token) {
    fetch(`${API_URL}/sueno/semana`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.horas && data.calidades) {
            sleepChart.data.datasets[0].data = data.horas;
            const newColors = data.calidades.map(q => getColorForQuality(q));
            // Actualizar solo los colores donde hay horas registradas (si no, gris)
            for(let i=0; i<7; i++) {
                if (data.horas[i] > 0) sleepChart.data.datasets[0].backgroundColor[i] = newColors[i];
            }
        }
        sleepChart.update();
    })
    .catch(err => console.error("Error al cargar sueño", err));
} else {
    // Fallback
    if (localStorage.getItem('tipoSesion') === 'login') {
        fetch('../data/sueno.json').then(res => res.json()).then(data => {
            sleepChart.data.datasets[0].data = data.horas;
            for(let i=0; i<7; i++) {
                 if(data.horas[i] > 0) sleepChart.data.datasets[0].backgroundColor[i] = '#0ea5e9'; // Azul genérico
            }
            sleepChart.update();
        });
    }
}

function calcularHorasDormidas(horaInicio, horaFin) {
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFinal, minFinal] = horaFin.split(':').map(Number);

    const minutosInicio = horaIni * 60 + minIni;
    const minutosFin = horaFinal * 60 + minFinal;

    let totalMinutos = minutosFin - minutosInicio;
    if (totalMinutos < 0) {
        totalMinutos += 24 * 60; // Cruzó la medianoche
    }

    const totalHoras = totalMinutos / 60;
    return Math.round(totalHoras * 10) / 10;
}

function obtenerDiaActual() {
    const diaSemana = new Date().getDay();
    // getDay() retorna 0 (Dom) a 6 (Sab). Queremos que Lun sea 0 y Dom 6.
    return (diaSemana + 6) % 7;
}

async function registerSleep() {
    const horaInicio = document.getElementById('sleepStart').value;
    const horaFin = document.getElementById('sleepEnd').value;
    
    // Obtener la calidad de sueño del selector
    const calidadInput = document.querySelector('input[name="calidadSueno"]:checked');
    const calidadSueno = calidadInput ? calidadInput.value : 'MEDIA';

    if (!horaInicio || !horaFin) {
        alert('Ingresa la hora de inicio y fin del sueño');
        return;
    }

    const horasDormidas = calcularHorasDormidas(horaInicio, horaFin);
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/sueno`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    horasDormidas: horasDormidas,
                    calidadSueno: calidadSueno,
                    fechaSueno: getHoy()
                })
            });

            if (response.ok) {
                // Actualizar grafico localmente
                const indiceDia = obtenerDiaActual();
                sleepChart.data.datasets[0].data[indiceDia] = horasDormidas;
                sleepChart.data.datasets[0].backgroundColor[indiceDia] = getColorForQuality(calidadSueno);
                sleepChart.update();
                alert(`¡Se registraron ${horasDormidas} horas de sueño con calidad ${calidadSueno}!`);
            } else {
                alert("Hubo un problema guardando tu registro.");
            }
        } catch (e) {
            alert("Fallo de conexión al servidor.");
        }
    } else {
        // Fallback local
        const indiceDia = obtenerDiaActual();
        sleepChart.data.datasets[0].data[indiceDia] = horasDormidas;
        sleepChart.data.datasets[0].backgroundColor[indiceDia] = getColorForQuality(calidadSueno);
        sleepChart.update();
    }
}
