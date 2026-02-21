export function contactarDueno() {
  const telefono = document.getElementById("telefono").value;
  if (telefono) window.open(`https://wa.me/${telefono}`, "_blank");
}

export function enviarCorreo() {
  const email = document.getElementById("emailDueno").value;
  if (email) window.location.href = `mailto:${email}`;
}
