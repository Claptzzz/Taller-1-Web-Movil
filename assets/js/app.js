const modal = document.getElementById('auth_modal');
const loginBtn = document.getElementById('button_log');
const registerBtn = document.getElementById('button_reg');
const closeBtn = document.getElementById('cerrar_pop');
const modalTitle = document.getElementById('titulo_pop');
const submitModalBtn = document.getElementById('button_enviar');

const rep_pass = document.getElementById('rep_pass');
const auth_login = document.getElementById('auth_login');
const tabs_perfil = document.getElementById('tabs_perfil');


//funcion para abrir el pop de login
function open_pop(type){
    modal.classList.remove('hidden');

    if(type === 'login'){
        modalTitle.textContent = 'Iniciar Sesion';
        submitModalBtn.textContent = 'ENTRAR';
        rep_pass.classList.add('hidden');
    } else if (type === 'register') {
        modalTitle.textContent = 'Crear Cuenta';
        submitModalBtn.textContent = 'REGISTRARSE';
        rep_pass.classList.remove('hidden');
    }
} 

//funcion paracerrar el pop
function close_pop() {
    modal.classList.add('hidden');
}

function submit_pop() {
    auth_login.classList.add('hidden')
    tabs_perfil.classList.remove('hidden')
    close_pop();
}

loginBtn.addEventListener('click', () => {open_pop('login')});
registerBtn.addEventListener('click', () => {open_pop('register')});
closeBtn.addEventListener('click', () => {close_pop()});

submitModalBtn.addEventListener('click', () => {submit_pop()});