// ============================================
// 🐾 UBIPET - APP.JS COMPLETO
// ============================================

// 🔗 CONEXIÓN SUPABASE
const supabaseClient = window.supabase.createClient(
    "https://exeeqykieytuvlzdbsnn.supabase.co",
    "sb_publishable_ffBzZEwygXXuyMDNDWVVoA_qxExK9bl"
);

// ============================================
// 👤 REGISTRO
// ============================================
async function registrar() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Completa todos los campos");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: "https://samirignaciosb-art.github.io/UbiPet"
        }
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Revisa tu correo para confirmar la cuenta 📩");
    }
}

// ============================================
// 🔑 LOGIN
// ============================================
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Completa todos los campos");
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Inicio de sesión correcto ✅");
        window.location.href = "perfil.html";
    }
}

// ============================================
// 🔄 DETECTAR CONFIRMACIÓN Y SESIÓN ACTIVA
// ============================================
window.addEventListener("load", async () => {
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        console.log("Sesión activa:", data.session.user.email);

        if (window.location.hash.includes("access_token")) {
            alert("Email confirmado correctamente ✅");
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (window.location.pathname.includes("index.html")) {
            window.location.href = "perfil.html";
        }
    }
});

// ============================================
// 💾 GUARDAR PERFIL DE MASCOTA
// ============================================
async function guardarPerfil() {
    const nombreMascota = document.getElementById("nombreMascota").value;
    const peso = document.getElementById("peso").value;
    const edad = document.getElementById("edad").value;
    const raza = document.getElementById("raza").value;
    const vacunas = document.getElementById("vacunas").checked;
    const descripcion = document.getElementById("descripcion").value;
    const nombreDueno = document.getElementById("nombreDueno").value;
    const emailDueno = document.getElementById("emailDueno").value;
    const telefono = document.getElementById("telefono").value;
    const estaPerdida = document.getElementById("estaPerdida").value === "true";

    const { data: sessionData } = await supabaseClient.auth.getSession();
    const userId = sessionData.session?.user?.id;

    const { error } = await supabaseClient
        .from("perfiles")
        .insert([{
            user_id: userId,
            nombre_mascota: nombreMascota,
            peso,
            edad,
            raza,
            vacunas,
            descripcion,
            nombre_dueno: nombreDueno,
            telefono,
            esta_perdida: estaPerdida
        }]);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("Perfil guardado correctamente ✅");
    }
}

// ============================================
// 🔄 TOGGLE PERDIDA
// ============================================
function togglePerdida() {
    const toggle = document.getElementById("togglePerdida");
    const hiddenInput = document.getElementById("estaPerdida");

    toggle.classList.toggle("active");
    hiddenInput.value = toggle.classList.contains("active") ? "true" : "false";
}

// ============================================
// 🖼️ GENERAR QR
// ============================================
function generarQR() {
    const url = window.location.href.replace("perfil.html", "rescate.html");
    const qrImg = document.getElementById("qrImg");
    const urlPerfil = document.getElementById("urlPerfil");
    const qrSection = document.getElementById("qrSection");

    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    urlPerfil.textContent = url;
    qrSection.classList.remove("hidden");
}

function copiarURL() {
    const url = document.getElementById("urlPerfil").textContent;
    navigator.clipboard.writeText(url);
    alert("URL copiada al portapapeles 📋");
}

// ============================================
// 🚨 RESCATE - MOSTRAR DATOS
// ============================================
window.addEventListener("load", async () => {
    if (window.location.pathname.includes("rescate.html")) {
        const { data, error } = await supabaseClient
            .from("perfiles")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) {
            document.getElementById("datosRescate").innerHTML = "Error al cargar datos";
            return;
        }

        if (data.length > 0) {
            const mascota = data[0];
            document.getElementById("datosRescate").innerHTML = `
                <div class="alerta-roja">
                    <strong>${mascota.nombre_mascota}</strong> (${mascota.raza}, ${mascota.edad} años)<br>
                    Descripción: ${mascota.descripcion}<br>
                    Dueño: ${mascota.nombre_dueno}<br>
                    Teléfono: ${mascota.telefono}
                </div>
            `;

            document.getElementById("btnLlamar").href = `tel:${mascota.telefono}`;
            document.getElementById("btnWhatsApp").href = `https://wa.me/${mascota.telefono}`;
            document.getElementById("btnSMS").href = `sms:${mascota.telefono}`;
        }
    }
});
