// =======================
// PetFinder - app.js
// =======================

// -----------------------
// Función principal al cargar la página
// -----------------------
window.onload = function() {
    const path = window.location.pathname.split("/").pop();

    if(path === "index.html") return; // login, nada más
    if(path === "perfil.html") {
        verificarSesion();
        cargarPerfil();
    }
    if(path === "rescate.html") {
        mostrarRescatador();
    }
};

// -----------------------
// Verificación de sesión
// -----------------------
function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if(!usuario){
        alert("Debes iniciar sesión primero");
        window.location.href = "index.html";
    }
}

// -----------------------
// LOGIN / SIGNUP
// -----------------------
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(email && password){
        localStorage.setItem('usuario', JSON.stringify({email, password}));
        window.location.href = "perfil.html";
    } else {
        alert("Completa todos los campos");
    }
}

function signup() { login(); }

// -----------------------
// Toggle de mascota perdida
// -----------------------
function togglePerdida() {
    const toggle = document.getElementById('togglePerdida');
    const estaPerdida = document.getElementById('estaPerdida');
    toggle.classList.toggle('active');
    estaPerdida.value = toggle.classList.contains('active');
}

// -----------------------
// Guardar perfil
// -----------------------
function guardarPerfil() {
    const perfil = {
        nombre: document.getElementById('nombreMascota').value,
        peso: document.getElementById('peso').value,
        edad: document.getElementById('edad').value,
        raza: document.getElementById('raza').value,
        vacunas: document.getElementById('vacunas').checked,
        descripcion: document.getElementById('descripcion').value,
        fotos: [],
        estaPerdida: document.getElementById('estaPerdida').value,
        dueno: {
            nombre: document.getElementById('nombreDueno').value,
            email: document.getElementById('emailDueno').value,
            telefono: document.getElementById('telefono').value
        }
    };

    // Leer hasta 5 fotos en base64
    for(let i=1; i<=5; i++){
        const fileInput = document.getElementById(`foto${i}`);
        if(fileInput && fileInput.files[0]){
            const reader = new FileReader();
            reader.onload = function(e){
                perfil.fotos.push(e.target.result);
                localStorage.setItem('perfilMascota', JSON.stringify(perfil));
            }
            reader.readAsDataURL(fileInput.files[0]);
        }
    }

    // Guardar perfil sin fotos inmediatas (se llenan con reader)
    localStorage.setItem('perfilMascota', JSON.stringify(perfil));
    alert("✅ Perfil guardado");
}

// -----------------------
// Cargar perfil en formulario
// -----------------------
function cargarPerfil() {
    const perfil = JSON.parse(localStorage.getItem('perfilMascota'));
    if(!perfil) return;

    document.getElementById('nombreMascota').value = perfil.nombre || '';
    document.getElementById('peso').value = perfil.peso || '';
    document.getElementById('edad').value = perfil.edad || '';
    document.getElementById('raza').value = perfil.raza || '';
    document.getElementById('vacunas').checked = perfil.vacunas || false;
    document.getElementById('descripcion').value = perfil.descripcion || '';
    document.getElementById('estaPerdida').value = perfil.estaPerdida || 'false';
    if(perfil.estaPerdida === 'true') document.getElementById('togglePerdida').classList.add('active');

    document.getElementById('nombreDueno').value = perfil.dueno?.nombre || '';
    document.getElementById('emailDueno').value = perfil.dueno?.email || '';
    document.getElementById('telefono').value = perfil.dueno?.telefono || '';
}

// -----------------------
// Generar QR de rescate
// -----------------------
function generarQR() {
    const perfilCompleto = JSON.parse(localStorage.getItem('perfilMascota'));
    if(!perfilCompleto) { alert("Primero guarda el perfil"); return; }

    const perfilQR = {
        nombre: perfilCompleto.nombre,
        raza: perfilCompleto.raza,
        edad: perfilCompleto.edad,
        peso: perfilCompleto.peso,
        descripcion: perfilCompleto.descripcion,
        estaPerdida: perfilCompleto.estaPerdida,
        dueno: perfilCompleto.dueno
    };

    const data = btoa(JSON.stringify(perfilQR));
    const url = `${window.location.origin}/rescate.html?data=${encodeURIComponent(data)}`;

    document.getElementById('qrImg').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    document.getElementById('urlPerfil').textContent = url;
    document.getElementById('qrSection').classList.remove('hidden');
}

// -----------------------
// Mostrar rescate
// -----------------------
function mostrarRescatador() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if(!data) return;

    try {
        const perfil = JSON.parse(atob(data));

        if(perfil.estaPerdida === 'true'){
            document.getElementById('tituloRescate').textContent = '🚨 MASCOTA PERDIDA 🚨';
            document.getElementById('datosRescate').classList.add('alerta-roja');
        }

        document.getElementById('datosRescate').innerHTML = `
            <h3>${perfil.nombre}</h3>
            <p>🐕 Raza: ${perfil.raza || 'Desconocida'}</p>
            <p>⚖️ Peso: ${perfil.peso || 'Desconocido'}</p>
            <p>🧑 Dueño: ${perfil.dueno?.nombre || 'Sin datos'}</p>
            <p>📞 Tel: ${perfil.dueno?.telefono || 'Sin número'}</p>
            <p>📧 Email: ${perfil.dueno?.email || 'Sin email'}</p>
            <p>📝 Descripción: ${perfil.descripcion || 'Ninguna'}</p>
        `;

        // Botones funcionales
        document.getElementById('btnLlamar').href = `tel:${perfil.dueno?.telefono || ''}`;
        document.getElementById('btnWhatsApp').href = `https://wa.me/${perfil.dueno?.telefono || ''}`;
        document.getElementById('btnSMS').href = `sms:${perfil.dueno?.telefono || ''}?body=¡Encontré tu mascota!`;

        // GPS
        document.getElementById('btnUbicacion').onclick = function() {
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(pos => {
                    const mensaje = `¡Encontré tu mascota!\n📍 Ubicación: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
                    window.open(`https://wa.me/${perfil.dueno?.telefono || ''}?text=${encodeURIComponent(mensaje)}`);
                });
            } else { alert("GPS no disponible"); }
        };

    } catch(e){
        alert("Error leyendo los datos de la mascota. Contacta al dueño.");
    }
}
