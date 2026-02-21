const PROFILE_KEY = "ubipet_perfil";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function cargarRescate() {
  const perfil = readJson(PROFILE_KEY, null);
  const box = document.getElementById("datosRescate");
  if (!box) return;

  if (!perfil) {
    box.innerHTML = "<p>No hay datos de perfil aún.</p>";
    return;
  }

  box.innerHTML = `
    <h3>${perfil.nombreMascota || "Mascota"}</h3>
    <p><strong>Raza:</strong> ${perfil.raza || "No informada"}</p>
    <p><strong>Edad:</strong> ${perfil.edad || "No informada"}</p>
    <p><strong>Descripción:</strong> ${perfil.descripcion || "Sin descripción"}</p>
  `;

  const telefono = document.getElementById("telefono");
  const email = document.getElementById("emailDueno");
  if (telefono) telefono.value = perfil.telefono || "";
  if (email) email.value = perfil.emailDueno || "";
}

function contactarDueno() {
  const telefono = document.getElementById("telefono")?.value?.trim();
  if (!telefono) return alert("No hay teléfono disponible.");
  window.open(`https://wa.me/${telefono}`, "_blank");
}

function enviarCorreo() {
  const email = document.getElementById("emailDueno")?.value?.trim();
  if (!email) return alert("No hay correo disponible.");
  window.location.href = `mailto:${email}`;
}

async function copiarTelefono() {
  const telefono = document.getElementById("telefono")?.value?.trim();
  if (!telefono) return alert("No hay teléfono para copiar.");

  try {
    await navigator.clipboard.writeText(telefono);
    alert("Teléfono copiado 📋");
  } catch {
    alert("No se pudo copiar el teléfono.");
  }
}

function enviarUbicacion() {
  if (!navigator.geolocation) return alert("Geolocalización no disponible.");

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => window.open(`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`, "_blank"),
    () => alert("No se pudo obtener la ubicación.")
  );
}

export function initRescatePage() {
  cargarRescate();
  document.getElementById("btnContactarDueno")?.addEventListener("click", contactarDueno);
  document.getElementById("btnEnviarCorreo")?.addEventListener("click", enviarCorreo);
  document.getElementById("btnCopiarTelefono")?.addEventListener("click", copiarTelefono);
  document.getElementById("btnEnviarUbicacion")?.addEventListener("click", enviarUbicacion);
}
