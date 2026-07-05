// Módulo de notificaciones locales para recordatorios de actividades.
// En navegador de escritorio (sin Capacitor) todas las funciones son no-op
// silenciosas, para poder seguir probando en Chrome.

const CANAL_RECORDATORIOS = 'recordatorios';

function obtenerLocalNotifications() {
    return window.Capacitor?.Plugins?.LocalNotifications || null;
}

// Canal Android: importance 4 = IMPORTANCE_HIGH (suena y aparece heads-up).
// Idempotente: crear un canal existente no tiene efecto.
async function inicializarCanalNotificaciones() {
    const ln = obtenerLocalNotifications();
    if (!ln || !window.Capacitor?.isNativePlatform?.()) return;
    try {
        await ln.createChannel({
            id: CANAL_RECORDATORIOS,
            name: 'Recordatorios de actividades',
            description: 'Avisos a la hora de tus actividades planificadas',
            importance: 4
        });
    } catch (err) {
        console.info('No se pudo crear el canal de notificaciones:', err);
    }
}

// Devuelve true si tenemos permiso para notificar (pidiéndolo si aún no se resolvió).
async function pedirPermisoNotificaciones() {
    const ln = obtenerLocalNotifications();
    if (!ln) {
        console.info('Notificaciones locales no disponibles fuera de la app');
        return false;
    }
    try {
        let estado = await ln.checkPermissions();
        if (estado.display === 'prompt') {
            estado = await ln.requestPermissions();
        }
        return estado.display === 'granted';
    } catch (err) {
        console.info('No se pudo verificar el permiso de notificaciones:', err);
        return false;
    }
}

// Programa un recordatorio para {id, descripcion, fecha 'YYYY-MM-DD', hora 'HH:MM'}.
// Devuelve true solo si quedó programado (instante futuro y schedule exitoso).
async function programarRecordatorioActividad(actividad) {
    const ln = obtenerLocalNotifications();
    if (!ln) {
        console.info('Notificaciones locales no disponibles fuera de la app');
        return false;
    }

    // Date local: 'YYYY-MM-DDTHH:MM:00' sin zona se interpreta en hora local
    const fechaHora = new Date(`${actividad.fecha}T${actividad.hora}:00`);
    if (isNaN(fechaHora.getTime()) || fechaHora.getTime() <= Date.now()) {
        return false;
    }

    try {
        await ln.schedule({
            notifications: [{
                id: actividad.id,
                title: 'Es hora de tu actividad',
                body: actividad.descripcion,
                channelId: CANAL_RECORDATORIOS,
                schedule: { at: fechaHora, allowWhileIdle: true }
            }]
        });
        return true;
    } catch (err) {
        console.info('No se pudo programar el recordatorio:', err);
        return false;
    }
}

// Cancela el recordatorio de una actividad (para edición/eliminación futura).
async function cancelarRecordatorio(id) {
    const ln = obtenerLocalNotifications();
    if (!ln) return;
    try {
        await ln.cancel({ notifications: [{ id }] });
    } catch (err) {
        console.info('No se pudo cancelar el recordatorio:', err);
    }
}

inicializarCanalNotificaciones();
