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
// Toggle perdida
function togglePerdida() {
    const toggle = document.getElementById('togglePerdida');
    const estaPerdida = document.getElementById('estaPerdida');
    toggle.classList.toggle('active');
    estaPerdida.value = toggle.classList.contains('active');
}

// Guardar perfil
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

    // Guardar fotos en base64
    for(let i=1; i<=5; i++){
        const fileInput = document.getElementById(`foto${i}`);
        if(fileInput.files[0]){
            const reader = new FileReader();
            reader.onload = function(e){
                perfil.fotos.push(e.target.result);
                localStorage.setItem('perfilMascota', JSON.stringify(perfil));
            }
            reader.readAsDataURL(fileInput.files[0]);
        }
    }

    localStorage.setItem('perfilMascota', JSON.stringify(perfil));
    alert("✅ Perfil guardado");
}

// Cargar perfil al abrir la página
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

window.onload = cargarPerfil;
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
