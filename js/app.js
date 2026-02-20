// LOGIN
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(email && password) {
        localStorage.setItem('usuario', email);
        window.location.href = "perfil.html";
    } else {
        alert("Completa los campos");
    }
}

// GUARDAR PERFIL
function guardarPerfil() {
    const perfil = {
        nombre: document.getElementById('nombreMascota').value,
        telefono: document.getElementById('telefono').value
    };

    localStorage.setItem('perfilMascota', JSON.stringify(perfil));
    alert("Perfil guardado");
}

// GENERAR QR
function generarQR() {
    const perfil = JSON.parse(localStorage.getItem('perfilMascota'));
    if (!perfil) {
        alert("Primero guarda el perfil");
        return;
    }

    // URL relativa dentro del repositorio
    const repo = window.location.pathname.split('/')[1]; // obtiene "UbiPet"
    const url = `${window.location.origin}/${repo}/rescate.html?data=${btoa(JSON.stringify(perfil))}`;

    document.getElementById('qrImg').src =
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

    document.getElementById('urlPerfil').textContent = url;
    document.getElementById('qrSection').classList.remove('hidden');

    alert("✅ QR generado! Copia URL e imprime");
}

// RESCATE
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');

    if(data) {
        const perfil = JSON.parse(atob(data));
        document.getElementById('datosRescate').innerHTML =
            `<h3>${perfil.nombre}</h3>
             <p>📞 ${perfil.telefono}</p>`;

        document.getElementById('btnLlamar').href = `tel:${perfil.telefono}`;
    }
};
