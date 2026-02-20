// ============================================
// 🐾 UBIPET - APP.JS CORREGIDO
// ============================================

// 🔗 CONEXIÓN SUPABASE
const { createClient } = supabase;

const supabaseClient = createClient(
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
        email,
        password
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
        email,
        password
    });

    if (error) {
        alert("Error: " + error.message);
    } else {
        window.location.href = "perfil.html";
    }
}


// ============================================
// 🚪 LOGOUT
// ============================================
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
}


// ============================================
// 🔐 VERIFICAR SESIÓN
// ============================================
async function verificarSesion() {
    const { data } = await supabaseClient.auth.getUser();
    if (!data.user) {
        window.location.href = "index.html";
    }
}


// ============================================
// 💾 GUARDAR PERFIL
// ============================================
async function guardarPerfil() {

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    if (!user) {
        alert("Debes iniciar sesión");
        return;
    }

    const perfil = {
        user_id: user.id,
        nombre_mascota: document.getElementById("nombreMascota").value,
        raza: document.getElementById("raza").value,
        peso: document.getElementById("peso").value,
        edad: document.getElementById("edad").value,
        vacunas: document.getElementById("vacunas").checked,
        descripcion: document.getElementById("descripcion").value,
        telefono: document.getElementById("telefono").value,
        nombre_dueno: document.getElementById("nombreDueno").value,
        esta_perdida: document.getElementById("estaPerdida").checked
    };

    const { error } = await supabaseClient
        .from("perfiles")
        .upsert(perfil, { onConflict: "user_id" });

    if (error) {
        alert("Error guardando perfil: " + error.message);
    } else {
        alert("Perfil guardado correctamente ✅");
    }
}


// ============================================
// 📥 CARGAR PERFIL
// ============================================
async function cargarPerfil() {

    const { data } = await supabaseClient.auth.getUser();
    const user = data.user;

    if (!user) return;

    const { data: perfil } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (perfil) {
        document.getElementById("nombreMascota").value = perfil.nombre_mascota || "";
        document.getElementById("raza").value = perfil.raza || "";
        document.getElementById("peso").value = perfil.peso || "";
        document.getElementById("edad").value = perfil.edad || "";
        document.getElementById("vacunas").checked = perfil.vacunas || false;
        document.getElementById("descripcion").value = perfil.descripcion || "";
        document.getElementById("telefono").value = perfil.telefono || "";
        document.getElementById("nombreDueno").value = perfil.nombre_dueno || "";
        document.getElementById("estaPerdida").checked = perfil.esta_perdida || false;
    }
}


// ============================================
// 🚨 LISTAR MASCOTAS PERDIDAS
// ============================================
async function cargarMascotasPerdidas() {

    const { data } = await supabaseClient
        .from("perfiles")
        .select("*")
        .eq("esta_perdida", true);

    const contenedor = document.getElementById("listaRescate");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    data?.forEach(pet => {
        contenedor.innerHTML += `
            <div class="alerta-roja">
                <h4>${pet.nombre_mascota}</h4>
                <p><b>Raza:</b> ${pet.raza || "No especificada"}</p>
                <p><b>Edad:</b> ${pet.edad || "No especificada"}</p>
                <p><b>Descripción:</b> ${pet.descripcion || "Sin descripción"}</p>
                <p><b>Contacto:</b> ${pet.telefono || "Sin teléfono"}</p>
            </div>
        `;
    });
}
