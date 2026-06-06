let currentMeal = null;

function openModal(mealType) {
    currentMeal = mealType;
    const modal = document.getElementById('mealModal');
    const input = document.getElementById('foodDescription');

    input.value = '';
    modal.showModal();
    input.focus();
}

function closeModal() {
    const modal = document.getElementById('mealModal');
    modal.close();
    currentMeal = null;
}

function agregarComidaDOM(mealType, descripcion) {
    const mealArticle = document.querySelector(`article[data-meal="${mealType}"]`);
    if (!mealArticle) return;

    const foodsContainer = mealArticle.querySelector('.foods');
    const foodItem = document.createElement('li');
    foodItem.className = 'bg-OatmilkFoam text-DeepSlate p-3 rounded-lg font-medium text-sm text-center break-words';
    foodItem.textContent = descripcion;
    foodsContainer.appendChild(foodItem);
}

function addFood() {
    const input = document.getElementById('foodDescription');
    const description = input.value.trim();

    if (description === '') {
        alert('Por favor ingresa una descripción de la comida');
        return;
    }

    if (!currentMeal) return;

    agregarComidaDOM(currentMeal, description);
    closeModal();
}

function getHoy() {
    return new Date().toISOString().split('T')[0];
}

async function guardarHabitos() {
    const inputs = document.querySelectorAll('aside input[type="text"]');
    const checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
    
    // Limpiamos la "L" para mandar solo el numero
    let aguaConsumida = parseFloat(inputs[1].value.replace(/[a-zA-Z]/g, '').trim());
    if (isNaN(aguaConsumida)) aguaConsumida = 0;

    const payload = {
        fecha: getHoy(),
        aguaConsumida: aguaConsumida,
        vegetales: checkboxes[0].checked,
        azucar: checkboxes[1].checked,
        proteina: checkboxes[2].checked,
        fruta: checkboxes[3].checked
    };

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/nutrition/daily-habits', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.datosActualizados) {
                inputs[0].value = result.datosActualizados.aguaRecomendada + 'L';
            }
        }
    } catch(e) {
        console.error('Error guardando habitos', e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('foodDescription');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addFood();
        }
    });

    const token = localStorage.getItem('token');
    if (localStorage.getItem('sesionIniciada') === 'true' && token) {
        
        // 1. Cargar las comidas desde el JSON temporalmente (hasta que implementemos comidas backend)
        fetch('../data/alimentacion.json')
            .then(res => res.json())
            .then(data => {
                for (const tipo in data.comidas) {
                    data.comidas[tipo].forEach(c => agregarComidaDOM(tipo, c));
                }
            });

        // 2. Conectar Hábitos y Agua al Backend Real
        const fechaHoy = getHoy();
        fetch(`http://localhost:3000/nutrition/dashboard?fecha=${fechaHoy}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            const inputs = document.querySelectorAll('aside input[type="text"]');
            const checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
            
            // Hacer el input recomendado de solo lectura
            if (inputs[0]) inputs[0].readOnly = true;

            if (data && data.habitosYAgua) {
                const habitos = data.habitosYAgua;
                if (inputs[0]) inputs[0].value = habitos.aguaRecomendada ? habitos.aguaRecomendada + 'L' : '2.5L';
                if (inputs[1]) inputs[1].value = habitos.aguaConsumida ? habitos.aguaConsumida + 'L' : '0L';
                
                checkboxes[0].checked = habitos.vegetales || false;
                checkboxes[1].checked = habitos.azucar || false;
                checkboxes[2].checked = habitos.proteina || false;
                checkboxes[3].checked = habitos.fruta || false;
            } else {
                // Si hoy no hay registros, mandamos un PATCH vacío para que el backend calcule y cree el día
                fetch(`http://localhost:3000/nutrition/daily-habits`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ fecha: fechaHoy })
                })
                .then(r => r.json())
                .then(newData => {
                    if (newData.datosActualizados) {
                        const h = newData.datosActualizados;
                        if (inputs[0]) inputs[0].value = h.aguaRecomendada + 'L';
                        if (inputs[1]) inputs[1].value = h.aguaConsumida + 'L';
                    }
                });
            }

            // Detectar cuando el usuario cambia algo y guardar al instante
            if (inputs[1]) inputs[1].addEventListener('change', guardarHabitos);
            checkboxes.forEach(cb => cb.addEventListener('change', guardarHabitos));
        })
        .catch(err => console.error("Error cargando hábitos de agua", err));
    }
});

document.getElementById('mealModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});
