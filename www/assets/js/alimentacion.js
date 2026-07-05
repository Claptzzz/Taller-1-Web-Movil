let currentMeal = null;

function checkAuth(response) {
    if (response.status === 401) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        localStorage.clear();
        window.location.href = '../index.html#login';
        return false;
    }
    return true;
}

function mostrarErrorComida(mensaje) {
    const errorEl = document.getElementById('mealError');
    errorEl.textContent = mensaje;
    errorEl.hidden = false;
}

function ocultarErrorComida() {
    const errorEl = document.getElementById('mealError');
    errorEl.hidden = true;
    errorEl.textContent = '';
}

function openModal(mealType) {
    currentMeal = mealType;
    const modal = document.getElementById('mealModal');
    const input = document.getElementById('foodDescription');

    input.value = '';
    ocultarErrorComida();
    modal.showModal();
    input.focus();
}

function closeModal() {
    const modal = document.getElementById('mealModal');
    modal.close();
    currentMeal = null;
    currentPhotoBase64 = null;
    const imgEl = document.getElementById('foodImagePreview');
    if (imgEl) {
        imgEl.classList.add('hidden');
        imgEl.src = '';
    }
}

function agregarComidaDOM(mealType, comida) {
    const mealArticle = document.querySelector(`article[data-meal="${mealType}"]`);
    if (!mealArticle) return;

    const id = typeof comida === 'object' ? comida.id : Date.now();
    const descripcion = typeof comida === 'object' ? comida.nombre : comida;
    const imagen = typeof comida === 'object' ? comida.imagen : null;

    const foodsContainer = mealArticle.querySelector('.foods');
    const foodItem = document.createElement('li');
    foodItem.className = 'bg-OatmilkFoam text-DeepSlate p-3 rounded-lg font-medium text-sm flex justify-between items-center break-words';
    foodItem.id = `meal-${id}`;
    
    let imgHtml = '';
    if (imagen) {
        imgHtml = `<img src="${imagen}" class="w-12 h-12 object-cover rounded-md mr-3 shadow-sm border border-gray-200">`;
    }

    foodItem.innerHTML = `
        <div class="flex items-center flex-1 overflow-hidden">
            ${imgHtml}
            <span class="flex-1 text-left truncate">${descripcion}</span>
        </div>
        <button class="text-red-500 hover:text-red-700 font-bold ml-2 text-lg cursor-pointer transition-colors" onclick="borrarComida(${id}, this)">×</button>
    `;

    foodsContainer.appendChild(foodItem);
}

async function borrarComida(id, btnElement) {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('¿Seguro que deseas eliminar esta comida?')) return;

    try {
        const response = await fetch(`https://salud-api-rzk9.onrender.com/nutrition/meals/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!checkAuth(response)) return;

        if (response.ok) {
            const li = btnElement.closest('li');
            if (li) li.remove();
        } else {
            alert('Error al borrar la comida');
        }
    } catch(e) {
        alert('Error de conexión');
    }
}

let currentPhotoBase64 = null;

async function takePhoto() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera) {
            const image = await window.Capacitor.Plugins.Camera.getPhoto({
                quality: 60,
                allowEditing: false,
                resultType: 'base64',
                source: 'CAMERA',
                width: 1024,
                height: 1024
            });
            currentPhotoBase64 = "data:image/jpeg;base64," + image.base64String;
            const imgEl = document.getElementById('foodImagePreview');
            imgEl.src = currentPhotoBase64;
            imgEl.classList.remove('hidden');
        } else {
            alert("La cámara solo está disponible en la app nativa instalada (Capacitor).");
        }
    } catch (e) {
        console.error("Error tomando foto", e);
    }
}

async function addFood() {
    const input = document.getElementById('foodDescription');
    const description = input.value.trim();

    if (description === '') {
        mostrarErrorComida('Ingresa una descripción de la comida.');
        return;
    }
    ocultarErrorComida();

    if (!currentMeal) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const payload = {
            nombre: description,
            categoria: currentMeal,
            fecha: getHoy()
        };

        if (currentPhotoBase64) {
            payload.imagen = currentPhotoBase64;
        }

        const response = await fetch('https://salud-api-rzk9.onrender.com/nutrition/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!checkAuth(response)) return;

        if (response.ok) {
            const data = await response.json();
            agregarComidaDOM(currentMeal, { id: data.id, nombre: description, imagen: currentPhotoBase64 });
            closeModal();
        } else {
            // Leer el mensaje real del backend para diagnosticar (ej: body demasiado grande, validación)
            let detalle = '';
            try {
                const errorBody = await response.json();
                detalle = errorBody.message || errorBody.error || '';
                if (Array.isArray(detalle)) detalle = detalle.join(', ');
            } catch (_) {
                // el body de error no era JSON; seguimos solo con el status
            }
            mostrarErrorComida(
                detalle
                    ? `Error del servidor (${response.status}): ${detalle}`
                    : `Error del servidor (${response.status}) al guardar la comida.`
            );
        }
    } catch(e) {
        mostrarErrorComida('Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.');
    }
}

function getHoy() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return (new Date(today.getTime() - offset)).toISOString().split('T')[0];
}

async function guardarHabitos() {
    const inputs = document.querySelectorAll('main input[type="text"]');
    const checkboxes = document.querySelectorAll('main input[type="checkbox"]');
    
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
        const response = await fetch('https://salud-api-rzk9.onrender.com/nutrition/daily-habits', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!checkAuth(response)) return;

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
        
        // Conectar Hábitos, Agua y Comidas al Backend Real
        const fechaHoy = getHoy();
        fetch(`https://salud-api-rzk9.onrender.com/nutrition/dashboard?fecha=${fechaHoy}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!checkAuth(res)) throw new Error('Unauthorized');
            return res.json();
        })
        .then(data => {
            const inputs = document.querySelectorAll('main input[type="text"]');
            const checkboxes = document.querySelectorAll('main input[type="checkbox"]');
            
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
                fetch(`https://salud-api-rzk9.onrender.com/nutrition/daily-habits`, {
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

            // Pintar comidas en pantalla si el backend nos envió alguna
            if (data && data.comidas) {
                for (const tipo in data.comidas) {
                    data.comidas[tipo].forEach(c => agregarComidaDOM(tipo, c));
                }
            }

            // Detectar cuando el usuario cambia algo y guardar al instante
            if (inputs[1]) inputs[1].addEventListener('change', guardarHabitos);
            checkboxes.forEach(cb => cb.addEventListener('change', guardarHabitos));
        })
        .catch(err => console.error("Error cargando dashboard nutricional", err));
    }
});

document.getElementById('mealModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closeModal();
    }
});
