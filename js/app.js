// ============================================
// 🐾 UBIPET - APP.JS COMPLETO Y ESTABLE
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
        email: email,
        password: password
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

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Inicio de sesión correcto ✅");
        window.location.href = "perfil.html";
    }
}


// ============================================
// 🔄 DETECTAR CONFIRMACIÓN DE EMAIL
// ============================================

window.addEventListener("load", async () => {

    // Detectar si hay sesión activa
    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        console.log("Sesión activa detectada");

        // Limpiar hash de la URL (#access_token...)
        if (window.location.hash.includes("access_token")) {
            window.history.replaceState({}, document.title, window.location.pathname);
            alert("Email confirmado correctamente ✅");
        }
    }
});
