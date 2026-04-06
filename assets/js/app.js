let logins = document.getElementById('logins');
let perfil = document.getElementById('perfil');

let buttons_log = document.querySelectorAll('button.button_log');

buttons_log.forEach((btn) => {
    btn.addEventListener('click', () => {
        logins.classList.add('hidden');
        perfil.classList.remove('hidden');
    })
});