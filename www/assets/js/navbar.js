(function () {
    const enCarpetaPages = window.location.pathname.includes('/pages/');
    const rutaInicio = enCarpetaPages ? '../index.html' : 'index.html';
    const prefijoPages = enCarpetaPages ? '' : 'pages/';

    function obtenerEnlacesInvitado() {
        return `
            <a href="${rutaInicio}#hero" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#logo-icon" /></svg>
                <span class="text-[10px] font-bold">INICIO</span>
            </a>
            <a href="${rutaInicio}#how_to_use" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#documento-icon" /></svg>
                <span class="text-[10px] font-bold">MÉTODO</span>
            </a>
            <a href="${rutaInicio}#about" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#spark-icon" /></svg>
                <span class="text-[10px] font-bold">NOSOTROS</span>
            </a>
        `;
    }

    function obtenerEnlacesUsuario() {
        return `
            <a href="${prefijoPages}perfil.html" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#user-icon" /></svg>
                <span class="text-[10px] font-bold">PERFIL</span>
            </a>
            <a href="${prefijoPages}actividades.html" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#spark-icon" /></svg>
                <span class="text-[10px] font-bold">ACTIVIDAD</span>
            </a>
            <a href="${prefijoPages}alimentacion.html" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#documento-icon" /></svg>
                <span class="text-[10px] font-bold">COMIDA</span>
            </a>
            <a href="${prefijoPages}sueño.html" class="flex flex-col items-center p-2 text-OatmilkFoam/60 hover:text-sky-300 transition-colors">
                <svg class="h-6 w-6 mb-1"><use xlink:href="${rutaInicio.replace('index.html','')}assets/img/sprites.svg#graph-icon" /></svg>
                <span class="text-[10px] font-bold">SUEÑO</span>
            </a>
        `;
    }

    function actualizarNavbar() {
        const enlaceLogo = document.getElementById('logo_link');
        if (enlaceLogo) {
            enlaceLogo.setAttribute('href', rutaInicio);
        }

        const enlacePerfil = document.getElementById('perfil_link');
        if (enlacePerfil) {
            enlacePerfil.setAttribute('href', prefijoPages + 'perfil.html');
        }

        const nav = document.getElementById('main_nav');
        if (!nav) return;

        const sesionIniciada = localStorage.getItem('sesionIniciada') === 'true';
        nav.innerHTML = sesionIniciada ? obtenerEnlacesUsuario() : obtenerEnlacesInvitado();
    }

    function iniciarSesion() {
        localStorage.setItem('sesionIniciada', 'true');
        actualizarNavbar();
    }

    function cerrarSesion() {
        localStorage.removeItem('sesionIniciada');
        actualizarNavbar();
    }

    window.iniciarSesion = iniciarSesion;
    window.cerrarSesion = cerrarSesion;

    document.addEventListener('DOMContentLoaded', actualizarNavbar);
})();
