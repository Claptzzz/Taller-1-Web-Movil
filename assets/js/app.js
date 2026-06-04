const modal = document.getElementById('auth_modal');
const loginBtn = document.getElementById('button_log');
const registerBtn = document.getElementById('button_reg');
const closeBtn = document.getElementById('cerrar_pop');
const modalTitle = document.getElementById('titulo_pop');
const submitModalBtn = document.getElementById('button_enviar');
const logoutBtn = document.getElementById('button_logout');

const rep_pass = document.getElementById('rep_pass');
const mock_credentials = document.getElementById('mock_credentials');
const auth_login = document.getElementById('auth_login');
const tabs_content = document.getElementById('content_tabs');

let usuario = null;
let modoActual = 'login';

// Al iniciar verificamos si hay sesión
if (localStorage.getItem('sesionIniciada') === 'true' && localStorage.getItem('token')) {
    auth_login.classList.add('hidden');
    tabs_content.classList.remove('hidden');

    usuario = {
        nombre: localStorage.getItem('usuarioNombre') || 'Usuario',
        peso: '',
        altura: '',
        grasa: '',
        cintura: ''
    };

    cargarDatosUsuario();
} else {
    usuario = {
        nombre: '', peso: '', altura: '', grasa: '', cintura: ''
    };
}

//funcion para abrir el pop de login
function open_pop(type){
    modal.classList.remove('hidden');
    modoActual = type;

    if(type === 'login'){
        modalTitle.textContent = 'Iniciar Sesion';
        submitModalBtn.textContent = 'ENTRAR';
        rep_pass.classList.add('hidden');
        mock_credentials.classList.remove('hidden');
    } else if (type === 'register') {
        modalTitle.textContent = 'Crear Cuenta';
        submitModalBtn.textContent = 'REGISTRARSE';
        rep_pass.classList.remove('hidden');
        mock_credentials.classList.add('hidden');
    }
}

//funcion paracerrar el pop
function close_pop() {
    modal.classList.add('hidden');
}

function cargarDatosUsuario() {
    if (!usuario) return;

    const titulo = document.querySelector('#content_tabs h2');
    if (titulo) {
        titulo.textContent = `Bienvenido, ${usuario.nombre}`;
    }

    const token = localStorage.getItem('token');
    if(token) {
        fetch('http://localhost:3000/metrics', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.text())
        .then(text => {
            if(text) {
                const data = JSON.parse(text);
                document.getElementById('in-peso').value = data.peso || '';
                document.getElementById('in-altura').value = data.altura || '';
                document.getElementById('in-grasa').value = data.grasa || '';
                document.getElementById('in-cintura').value = data.cintura || '';
                
                calcularDatosIdeales();
            }
        }).catch(err => console.log('Sin metricas previas o error'));
    }
}

function calcularDatosIdeales() {
    const p = parseFloat(document.getElementById('in-peso').value) || 0;
    let a = parseFloat(document.getElementById('in-altura').value) || 0;
    const c = parseFloat(document.getElementById('in-cintura').value) || 0;
    
    // Si el usuario pone altura en metros (ej. 1.78) en vez de cm
    if (a > 0 && a < 3) {
        a = a * 100;
    }
    
    if(p > 0 && a > 0) {
        const m = a / 100;
        // Calculo ideal (basado en altura)
        document.getElementById('res-peso').innerText = (22 * (m * m)).toFixed(1) + ' kg';
        document.getElementById('res-cintura').innerText = Math.round(a * 0.47) + ' cm';
        
        if (c > 0) {
            // Calculo RFM (Relative Fat Mass). La fórmula oficial es altura / cintura
            const rfmReal = 64 - (20 * (a / c));
            document.getElementById('res-imc').innerText = rfmReal.toFixed(1) + '%';
            
            let estado = 'NORMAL';
            if (rfmReal < 15) estado = 'BAJO PESO';
            else if (rfmReal >= 25 && rfmReal < 35) estado = 'SOBREPESO';
            else if (rfmReal >= 35) estado = 'OBESIDAD';
            
            document.getElementById('res-estado').innerText = estado;
        }
    }
}

async function submit_pop() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (modoActual === 'login') {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, contraseña: password })
            });

            if (!response.ok) {
                alert('Credenciales incorrectas');
                return;
            }

            const data = await response.json();
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuarioNombre', data.nombre);
            localStorage.setItem('usuarioId', data.idUsuario);
            localStorage.setItem('sesionIniciada', 'true');
            localStorage.setItem('tipoSesion', 'login');

            usuario = {
                nombre: data.nombre,
                peso: localStorage.getItem('peso') || '',
                altura: localStorage.getItem('altura') || '',
                grasa: localStorage.getItem('grasa') || '',
                cintura: localStorage.getItem('cintura') || ''
            };

            auth_login.classList.add('hidden');
            tabs_content.classList.remove('hidden');

            // Limpiamos el #login de la URL para que no vuelva a saltar si se recarga la página
            window.history.replaceState(null, null, window.location.pathname);

            cargarDatosUsuario();
            close_pop();
            
            if (typeof iniciarSesion === 'function') iniciarSesion();

        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar al servidor');
        }
    } else {
        const password_rep = document.getElementById('password_rep').value;
        if(password !== password_rep) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const nombre = email.split('@')[0];

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email, contraseña: password, nombre: nombre })
            });

            if (!response.ok) {
                const errData = await response.json();
                alert('Error al registrar: ' + (errData.message || 'Error desconocido'));
                return;
            }
            
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            open_pop('login');
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo conectar al servidor');
        }
    }
}

loginBtn.addEventListener('click', () => {open_pop('login')});
registerBtn.addEventListener('click', () => {open_pop('register')});
closeBtn.addEventListener('click', () => {close_pop()});

if (window.location.hash === '#login') {
    open_pop('login');
} else if (window.location.hash === '#register') {
    open_pop('register');
}

submitModalBtn.addEventListener('click', () => {submit_pop()});

function logout() {
    localStorage.removeItem('tipoSesion');
    localStorage.removeItem('sesionIniciada');
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioNombre');
    localStorage.removeItem('usuarioId');
    
    auth_login.classList.remove('hidden');
    tabs_content.classList.add('hidden');

    document.getElementById('email').value = '';
    document.getElementById('password').value = '';

    const peso = document.getElementById('in-peso');
    const altura = document.getElementById('in-altura');
    const grasa = document.getElementById('in-grasa');
    const cintura = document.getElementById('in-cintura');
    if (peso) peso.value = '';
    if (altura) altura.value = '';
    if (grasa) grasa.value = '';
    if (cintura) cintura.value = '';

    document.getElementById('res-peso').innerText = '-- kg';
    document.getElementById('res-cintura').innerText = '-- cm';

    usuario = null;

    if (typeof cerrarSesion === 'function') {
        cerrarSesion();
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {logout()});
}


//funcion para activar los tabs
const btn_tabs = document.querySelectorAll('.btn_tabs');
const contents = document.querySelectorAll('.tab_content');

btn_tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        contents.forEach(content => content.classList.add('hidden'));
        contents[index].classList.remove('hidden');
    })
})

// Logica para calculos en tiempo real
const healthIds = ['peso', 'altura', 'grasa', 'cintura'];
healthIds.forEach(id => {
    const input = document.getElementById(`in-${id}`);
    if(input) {
        input.addEventListener('input', () => {
            calcularDatosIdeales();
        });
    }
});

const btnSaveMetrics = document.getElementById('btn-save-metrics');
if(btnSaveMetrics) {
    btnSaveMetrics.addEventListener('click', async (e) => {
        if(e) e.preventDefault();
        
        const peso = document.getElementById('in-peso').value;
        const altura = document.getElementById('in-altura').value;
        const cintura = document.getElementById('in-cintura').value;
        const grasa = document.getElementById('in-grasa').value;
        const token = localStorage.getItem('token');

        if(!peso || !altura || !cintura) {
            alert('Por favor, llena los datos de peso, altura y cintura');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    peso: peso,
                    altura: altura,
                    cintura: cintura,
                    grasa: grasa
                })
            });

            if(response.ok) {
                const data = await response.json();
                alert(`✅ ${data.mensaje}\nTu RFM estimado es ${data.rfmCalculado}% (${data.estadoSalud.toUpperCase()})`);
                
                // Actualizar info desde backend
                document.getElementById('res-imc').innerText = data.rfmCalculado + '%';
                document.getElementById('res-estado').innerText = data.estadoSalud.toUpperCase();
                calcularDatosIdeales();
            } else {
                const err = await response.json();
                alert(`Error: ${err.message || 'Datos invalidos'}`);
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
        }
    });
}
