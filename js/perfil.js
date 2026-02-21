import supabaseClient from "./supabase.js";

export async function guardarPerfil() {
  alert("Perfil guardado (ejemplo). Aquí iría la lógica con Supabase.");
}

export function generarQR() {
  alert("QR generado (ejemplo). Aquí iría la lógica para mostrar el QR.");
}

export async function cerrarSesion() {
  await supabaseClient.auth.signOut();
  alert("Sesión cerrada ✅");
  window.location.href = "index.html";
}

export function copiarURL() {
  const url = document.getElementById("urlPerfil").innerText;
  navigator.clipboard.writeText(url);
  alert("URL copiada al portapapeles 📋");
}

export function togglePerdida() {
  const input = document.getElementById("estaPerdida");
  input.value = input.value === "true" ? "false" : "true";
  alert("Estado cambiado a: " + input.value);
}

export function cargarPerfil() {
  // Ejemplo básico: aquí podrías traer datos desde Supabase
  // y rellenar los campos del formulario en perfil.html
  console.log("Cargando perfil...");
  alert("Aquí se cargaría el perfil desde Supabase.");
}
