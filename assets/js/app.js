const modal = document.getElementById('auth_modal');
const loginBtn = document.getElementById('button_log');
const registerBtn = document.getElementById('button_reg');
const closeBtn = document.getElementById('cerrar_pop');
const modalTitle = document.getElementById('titulo_pop');
const submitModalBtn = document.getElementById('button_enviar');

const profileImg = document.getElementById('perfil');

//funcion para abrir el pop de login
function open_pop(type){
    modal.classList.remove('hidden');

    if(type === 'login'){
        modalTitle.textContent = 'Iniciar Sesion';
        submitModalBtn.textContent = 'ENTRAR';
    } else if (type === 'register') {
        modalTitle.textContent = 'Crear Cuenta';
        submitModalBtn.textContent = 'REGISTRARSE';
    }
} 

//funcion paracerrar el pop
function close_pop() {
    modal.classList.add('hidden');
}

function submit_pop() {
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    profileImg.classList.remove('hidden');
    close_pop();
}

loginBtn.addEventListener('click', () => {open_pop('login')});
registerBtn.addEventListener('click', () => {open_pop('register')});
closeBtn.addEventListener('click', () => {close_pop()});

submitModalBtn.addEventListener('click', () => {submit_pop()});