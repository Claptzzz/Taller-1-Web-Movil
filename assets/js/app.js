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
const tabs_perfil = document.getElementById('tabs_perfil');
const tabs_content = document.getElementById('content_tabs');

let usuario = null;
let modoActual = 'login';

fetch('../data/usuario.json')
    .then(res => res.json())
    .then(data => {
        usuario = data;
        if (localStorage.getItem('sesionIniciada') === 'true') {
            auth_login.classList.add('hidden');
            tabs_perfil.classList.remove('hidden');
            tabs_content.classList.remove('hidden');

            if (localStorage.getItem('tipoSesion') === 'login') {
                cargarDatosUsuario();
            } else {
                const titulo = document.querySelector('#content_tabs h2');
                if (titulo) titulo.textContent = 'Bienvenido, nuevo usuario';
            }
        }
    });

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

    const peso = document.getElementById('in-peso');
    const altura = document.getElementById('in-altura');
    const grasa = document.getElementById('in-grasa');
    const cintura = document.getElementById('in-cintura');

    if (peso) peso.value = usuario.peso;
    if (altura) altura.value = usuario.altura;
    if (grasa) grasa.value = usuario.grasa;
    if (cintura) cintura.value = usuario.cintura;

    if (usuario.peso > 0 && usuario.altura > 100) {
        const m = usuario.altura / 100;
        document.getElementById('res-peso').innerText = (22 * (m * m)).toFixed(1) + ' kg';
        document.getElementById('res-cintura').innerText = Math.round(usuario.altura * 0.47) + ' cm';
    }
}

function submit_pop() {
    if (!usuario) {
        alert('Cargando datos, intenta de nuevo en un momento');
        return;
    }

    if (modoActual === 'login') {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email !== usuario.email || password !== usuario.password) {
            alert('Credenciales incorrectas');
            return;
        }
    }

    auth_login.classList.add('hidden');
    tabs_perfil.classList.remove('hidden');
    tabs_content.classList.remove('hidden');

    localStorage.setItem('tipoSesion', modoActual);

    if (modoActual === 'login') {
        cargarDatosUsuario();
    } else {
        const titulo = document.querySelector('#content_tabs h2');
        if (titulo) titulo.textContent = 'Bienvenido, nuevo usuario';
    }

    if (typeof iniciarSesion === 'function') {
        iniciarSesion();
    }
    close_pop();
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
    auth_login.classList.remove('hidden');
    tabs_perfil.classList.add('hidden');
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
            const p = parseFloat(document.getElementById('in-peso').value) || 0;
            const a = parseFloat(document.getElementById('in-altura').value) || 0;
            if(p > 0 && a > 100) {
                const m = a / 100;
                document.getElementById('res-peso').innerText = (22 * (m * m)).toFixed(1) + ' kg';
                document.getElementById('res-cintura').innerText = Math.round(a * 0.47) + ' cm';
            }
        });
    }
});
