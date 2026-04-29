const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const sleepHours = [0, 0, 0, 0, 0, 0, 0];

const ctx = document.getElementById('sleepChart').getContext('2d');
const sleepChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: days,
        datasets: [{
            label: 'Horas dormidas',
            data: sleepHours,
            backgroundColor: '#F8F4EF',
            borderRadius: 8,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 12,
                ticks: { color: '#F8F4EF', stepSize: 2 },
                grid: { color: 'rgba(248,244,239,0.1)' },
                title: { display: true, text: 'Horas', color: '#F8F4EF' }
            },
            x: {
                ticks: { color: '#F8F4EF' },
                grid: { color: 'rgba(248,244,239,0.05)' },
                title: { display: true, text: 'Día de la semana', color: '#F8F4EF' }
            }
        },
        plugins: {
            legend: { labels: { color: '#F8F4EF' } }
        }
    }
});

function calcularHorasDormidas(horaInicio, horaFin) {
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFinal, minFinal] = horaFin.split(':').map(Number);

    const minutosInicio = horaIni * 60 + minIni;
    const minutosFin = horaFinal * 60 + minFinal;

    let totalMinutos = minutosFin - minutosInicio;
    if (totalMinutos < 0) {
        totalMinutos += 24 * 60;
    }

    const totalHoras = totalMinutos / 60;
    return Math.round(totalHoras * 10) / 10;
}

function obtenerDiaActual() {
    const diaSemana = new Date().getDay();
    return (diaSemana + 6) % 7;
}

function registerSleep() {
    const horaInicio = document.getElementById('sleepStart').value;
    const horaFin = document.getElementById('sleepEnd').value;

    if (!horaInicio || !horaFin) {
        alert('Ingresa la hora de inicio y fin del sueño');
        return;
    }

    const horasDormidas = calcularHorasDormidas(horaInicio, horaFin);
    const indiceDia = obtenerDiaActual();

    sleepChart.data.datasets[0].data[indiceDia] = horasDormidas;
    sleepChart.update();
}
