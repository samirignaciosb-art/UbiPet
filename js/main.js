import { login, registrar } from "./login.js";
import { guardarPerfil, cargarPerfil } from "./perfil.js";
import { contactarDueno, enviarCorreo } from "./rescate.js";
import { generarQR } from "./qr.js";
import supabaseClient from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btnLogin");
  if (btnLogin) btnLogin.addEventListener("click", login);

  const btnRegistrar = document.getElementById("btnRegistrar");
  if (btnRegistrar) btnRegistrar.addEventListener("click", registrar);

  const btnGuardar = document.getElementById("btnGuardarPerfil");
  if (btnGuardar) btnGuardar.addEventListener("click", guardarPerfil);

  const btnQR = document.getElementById("btnQR");
  if (btnQR) btnQR.addEventListener("click", generarQR);

  // ✅ Si existe un botón o lógica para cargar el perfil
  cargarPerfil();
});

export async function cerrarSesion() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) alert("Error al cerrar sesión: " + error.message);
  else {
    alert("Sesión cerrada correctamente 👋");
    window.location.href = "index.html";
  }
}
