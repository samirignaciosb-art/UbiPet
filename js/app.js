// =======================
// Ubipet - app.js con Supabase
// =======================

// -----------------------
// Configuración Supabase
// -----------------------
const SUPABASE_URL = "https://exeeqykieytuvlzdbsnn.supabase.co"; // tu URL del proyecto
const SUPABASE_ANON_KEY = "sb_publishable_ffBzZEwygXXuyMDNDWVVoA_qxExK9bl"; // tu API key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------
// Función principal al cargar la página
// -----------------------
window.onload = function() {
    const path = window.location.pathname.split("/").pop();

    if(path === "index.html") return; // login
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
async function verificarSesion() {
    const { data: user } = await supabase.auth.getUser();
    if(!user) {
        alert("Debes iniciar sesión primero");
        window.location.href = "index.html";
    }
}

// -----------------------
// LOGIN
// -----------------------
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password){
        alert("Completa todos los campos");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){
        alert("Error en login: " + error.message);
    } else {
        window.location.href = "perfil.html";
    }
}

// -----------------------
// SIGNUP
// -----------------------
async function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(!email || !password){
        alert("Completa todos los campos");
        return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if(error){
        alert("Error al registrarse: " + error.message);
    } else {
        alert("Usuario creado correctamente. Ya puedes iniciar sesión.");
    }
}

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
// Guardar perfil en Supabase
// -----------------------
async function guardarPerfil() {
    const perfil = {
        nombre: document.getElementById('nombreMascota').value,
        peso: document.getElementById('peso').value,
        edad: document.getElementById('edad').value,
        raza: document.getElementById('raza').value,
        vacunas: document.getElementById('vacunas').checked,
        descripcion: document.getElementById('descripcion').value,
        fotos: [], // guardaremos las URLs después
        estaPerdida: document.getElementById('estaPerdida').value,
        dueno: {
            nombre: document.getElementById('nombreDueno').value,
            email: document.getElementById('emailDueno').value,
            telefono: document.getElementById('telefono').value
        }
    };

    // Subir fotos a Supabase Storage
    for(let i=1; i<=5; i++){
        const fileInput = document.getElementById(`foto${i}`);
        if(fileInput && fileInput.files[0]){
            const file = fileInput.files[0];
            const fileName = `perfil_${Date.now()}_${i}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('fotos-mascotas')
                .upload(fileName, file);
            if(data) {
                const url = supabase.storage.from('fotos-mascotas').getPublicUrl(fileName).data.publicUrl;
                perfil.fotos.push(url);
            }
        }
    }

    // Guardar perfil en tabla "perfiles"
    const { error } = await supabase.from('perfiles').upsert({
        email_dueno: perfil.dueno.email,
        perfil_json: perfil
    });
    if(error) {
        alert("Error guardando perfil: " + error.message);
    } else {
        alert("✅ Perfil guardado en Supabase");
    }
}

// -----------------------
// Cargar perfil desde Supabase
// -----------------------
async function cargarPerfil() {
    const email = (await supabase.auth.getUser()).data.user?.email;
    if(!email) return;

    const { data, error } = await supabase.from('perfiles').select('perfil_json').eq('email_dueno', email).single();
    if(data){
        const perfil = data.perfil_json;

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
}

// -----------------------
// Generar QR de rescate
// -----------------------
function generarQR() {
    // Igual que antes, pero usando perfil cargado
    const perfil = JSON.parse(localStorage.getItem('perfilMascota'));
    if(!perfil){ alert("Primero guarda el perfil"); return; }

    const data = btoa(JSON.stringify(perfil));
    const base = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const url = `${window.location.origin}${base}rescate.html?data=${encodeURIComponent(data)}`;

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
            <p>📞 Tel: <a href="tel:${perfil.dueno?.telefono || ''}">${perfil.dueno?.telefono || 'Sin número'}</a></p>
            <p>📧 Email: <a href="mailto:${perfil.dueno?.email || ''}">${perfil.dueno?.email || 'Sin email'}</a></p>
            <p>📝 Descripción: ${perfil.descripcion || 'Ninguna'}</p>
        `;

    } catch(e){
        alert("Error leyendo los datos de la mascota. Contacta al dueño.");
    }
}
