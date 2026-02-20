// ============================================
// 🐾 UBIPET - APP.JS COMPLETO Y DEFINITIVO
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

    // 🔥 AQUÍ FORZAMOS EL REDIRECT CORRECTO
    const { error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
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
// 🔄 DETECTAR CONFIRMACIÓN Y SESIÓN ACTIVA
// ============================================
window.addEventListener("load", async () => {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {

        console.log("Sesión activa detectada:", data.session.user.email);

        // Si viene de confirmación
        if (window.location.hash.includes("access_token")) {
            alert("Email confirmado correctamente ✅");

            // Limpiar el hash
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Redirigir al perfil
        window.location.href = "perfil.html";
    }
});
