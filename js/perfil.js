import { closeSession, getSession } from "./login.js";
import { generarQRDesdeURL } from "./qr.js";

const PROFILE_KEY = "ubipet_perfil";

function keyByUser() {
  const email = getSession()?.email;
  return email ? `${PROFILE_KEY}:${email}` : PROFILE_KEY;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function togglePerdida() {
  const hidden = document.getElementById("estaPerdida");
  const toggle = document.getElementById("togglePerdida");
  if (!hidden) return;
  hidden.value = hidden.value === "true" ? "false" : "true";
  toggle?.classList.toggle("active", hidden.value === "true");
}

function cargarPerfil() {
  const perfil = readJson(keyByUser(), null) ?? readJson(PROFILE_KEY, null);
  if (!perfil) return;

  const assign = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = Boolean(value);
    else el.value = value ?? "";
  };

  assign("nombreMascota", perfil.nombreMascota);
  assign("raza", perfil.raza);
  assign("edad", perfil.edad);
  assign("descripcion", perfil.descripcion);
  assign("vacunas", perfil.vacunas);
  assign("nombreDueno", perfil.nombreDueno);
  assign("emailDueno", perfil.emailDueno);
  assign("telefono", perfil.telefono);

  const hidden = document.getElementById("estaPerdida");
  const toggle = document.getElementById("togglePerdida");
  const perdida = Boolean(perfil.estaPerdida);
  if (hidden) hidden.value = perdida ? "true" : "false";
  toggle?.classList.toggle("active", perdida);
}

function guardarPerfil() {
  const perfil = {
    nombreMascota: document.getElementById("nombreMascota")?.value?.trim() ?? "",
    raza: document.getElementById("raza")?.value?.trim() ?? "",
    edad: document.getElementById("edad")?.value?.trim() ?? "",
    descripcion: document.getElementById("descripcion")?.value?.trim() ?? "",
    vacunas: document.getElementById("vacunas")?.checked ?? false,
    nombreDueno: document.getElementById("nombreDueno")?.value?.trim() ?? "",
    emailDueno: document.getElementById("emailDueno")?.value?.trim() ?? "",
    telefono: document.getElementById("telefono")?.value?.trim() ?? "",
    estaPerdida: (document.getElementById("estaPerdida")?.value ?? "false") === "true"
  };

  if (!perfil.nombreMascota || !perfil.nombreDueno || !perfil.telefono) {
    return alert("Completa nombre de mascota, dueño y teléfono.");
  }

  writeJson(PROFILE_KEY, perfil);
  writeJson(keyByUser(), perfil);
  alert("Perfil guardado ✅");
}

function generarQR() {
  const url = window.location.href.replace("perfil.html", "rescate.html");
  const qr = document.getElementById("qrImg");
  const urlBox = document.getElementById("urlPerfil");
  const section = document.getElementById("qrSection");

  if (qr) qr.src = generarQRDesdeURL(url);
  if (urlBox) urlBox.textContent = url;
  section?.classList.remove("hidden");
}

async function copiarURL() {
  const url = document.getElementById("urlPerfil")?.textContent?.trim();
  if (!url) return alert("Genera primero el QR.");

  try {
    await navigator.clipboard.writeText(url);
    alert("URL copiada 📋");
  } catch {
    alert("No se pudo copiar la URL.");
  }
}

function cerrarSesion() {
  closeSession();
  window.location.href = "index.html";
}

export function initPerfilPage() {
  if (!getSession()?.email) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("togglePerdida")?.addEventListener("click", togglePerdida);
  document.getElementById("btnGuardarPerfil")?.addEventListener("click", guardarPerfil);
  document.getElementById("btnQR")?.addEventListener("click", generarQR);
  document.getElementById("btnCopiarURL")?.addEventListener("click", copiarURL);
  document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);

  cargarPerfil();
}
