let currentMeal = null;

function openModal(mealType) {
    currentMeal = mealType;
    const modal = document.getElementById('mealModal');
    const input = document.getElementById('foodDescription');
    
    input.value = '';
    modal.showModal(); // Esto centra el modal y activa el backdrop oscuro
    input.focus();
}

function closeModal() {
    const modal = document.getElementById('mealModal');
    modal.close(); // Cierra el modal
    currentMeal = null;
}

function addFood() {
    const input = document.getElementById('foodDescription');
    const description = input.value.trim();

    if (description === '') {
        alert('Por favor ingresa una descripción de la comida');
        return;
    }

    if (!currentMeal) return;

    // Encontrar la columna de comida correspondiente
    const mealArticle = document.querySelector(`article[data-meal="${currentMeal}"]`);
    if (!mealArticle) return;

    const foodsContainer = mealArticle.querySelector('.foods');

    // Crear elemento de comida
    const foodItem = document.createElement('li');
    foodItem.className = 'bg-OatmilkFoam text-DeepSlate p-3 rounded-lg font-medium text-sm text-center break-words';
    foodItem.textContent = description;

    foodsContainer.appendChild(foodItem);

    closeModal();
}

// Permitir envío con Enter
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('foodDescription');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // IMPORTANTE: Evita que el form cierre el modal antes de tiempo
            addFood();
        }
    });
});

// Cerrar modal al hacer clic fuera del mismo
document.getElementById('mealModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});