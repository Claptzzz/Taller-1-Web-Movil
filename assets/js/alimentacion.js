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

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('foodDescription');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addFood();
        }
    });

    if (localStorage.getItem('tipoSesion') === 'login') {
        fetch('../data/alimentacion.json')
            .then(res => res.json())
            .then(data => {
                const inputs = document.querySelectorAll('aside input[type="text"]');
                if (inputs[0]) inputs[0].value = data.agua.recomendado;
                if (inputs[1]) inputs[1].value = data.agua.actual;

                const checkboxes = document.querySelectorAll('aside input[type="checkbox"]');
                const habitos = [data.habitos.vegetales, data.habitos.azucar, data.habitos.proteina, data.habitos.fruta];
                checkboxes.forEach((cb, i) => { cb.checked = habitos[i]; });

                for (const tipo in data.comidas) {
                    data.comidas[tipo].forEach(c => agregarComidaDOM(tipo, c));
                }
            });
    }
});

document.getElementById('mealModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});
