(function () {
    const enCarpetaPages = window.location.pathname.includes('/pages/');
    const rutaInicio = enCarpetaPages ? '../index.html' : 'index.html';
    const prefijoPages = enCarpetaPages ? '' : 'pages/';

    function obtenerEnlacesInvitado() {
        return `
            <a href="${rutaInicio}#hero" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">INICIO</a>
            <a href="${rutaInicio}#how_to_use" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">MÉTODO</a>
            <a href="${rutaInicio}#about" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">NOSOTROS</a>
        `;
    }

    function obtenerEnlacesUsuario() {
        return `
            <a href="${prefijoPages}actividades.html" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">ACTIVIDADES</a>
            <a href="${prefijoPages}alimentacion.html" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">ALIMENTACIÓN</a>
            <a href="${prefijoPages}sueño.html" class="hover:bg-white/10 px-4 py-2 rounded-xl transition-all">SUEÑO</a>
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
