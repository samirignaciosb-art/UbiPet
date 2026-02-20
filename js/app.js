// ============================================
// 🐾 UBIPET - APP.JS COMPLETO
// ============================================

// 🔗 CONEXIÓN SUPABASE
const supabaseClient = supabase.createClient(
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

    // Si estamos en perfil.html, cargar datos guardados
    if (window.location.pathname.includes("perfil.html")) {
        await cargarPerfil();
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
    const emailDueno = document.getElementById("emailDueno").value; // ✅ capturado
    const telefono = document.getElementById("telefono").value;
    const estaPerdida = document.getElementById("estaPerdida").value === "true";

    const { data: sessionData } = await supabaseClient.auth.getSession();
    const userId = sessionData.session?.user?.id;

    const { error } = await supabaseClient
        .from("perfiles")
        .upsert([{
            user_id: userId,
            nombre_mascota: nombreMascota,
            peso,
            edad,
            raza,
            vacunas,
            descripcion,
            nombre_dueno: nombreDueno,
            email_dueno: emailDueno,   // ✅ agregado aquí
            telefono,
            esta_perdida: estaPerdida
        }], { onConflict: "user_id" });

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("Perfil guardado correctamente ✅");
    }
}

// ============================================
// 📥 CARGAR PERFIL EXISTENTE
// ============================================
async function cargarPerfil() {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) return;

    const { data, error } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("user_id", userId)
        .single();

    if (error || !data) return;

    document.getElementById("nombreMascota").value = data.nombre_mascota || "";
    document.getElementById("peso").value = data.peso || "";
    document.getElementById("edad").value = data.edad || "";
    document.getElementById("raza").value = data.raza || "";
    document.getElementById("vacunas").checked = data.vacunas || false;
    document.getElementById("descripcion").value = data.descripcion || "";
    document.getElementById("nombreDueno").value = data.nombre_dueno || "";
    document.getElementById("emailDueno").value = data.email_dueno || ""; // ✅ agregado aquí
    document.getElementById("telefono").value = data.telefono || "";
    document.getElementById("estaPerdida").value = data.esta_perdida ? "true" : "false";
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
