// ============================================
// 🐾 UBIPET - CONEXIÓN CORRECTA
// ============================================

// NO usamos "supabase" como nombre de variable
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

    const { error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Cuenta creada correctamente ✅");
    }
}


// ============================================
// 🔑 LOGIN
// ============================================
async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
