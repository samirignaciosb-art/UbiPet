export function generarQR() {
  const url = window.location.href.replace("perfil.html", "rescate.html");
  const qrImg = document.getElementById("qrImg");
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}
