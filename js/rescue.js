export function cargarRescate() {
  const urlParams = new URLSearchParams(window.location.search)
  const dataParam = urlParams.get('data')
  
  if (!dataParam) return

  try {
    const datos = JSON.parse(atob(dataParam))
    
    document.getElementById('tituloRescate').textContent = 
      datos.esta_perdida ? '🚨 MASCOTA PERDIDA 🚨' : '🐕 Mascota Encontrada'
    
    document.getElementById('datosRescate').innerHTML = `
      <div class="${datos.esta_perdida ? 'alerta-roja' : ''}" style="background: ${datos.esta_perdida ? '#ff6b6b' : '#06d6a0'}; color: white; padding: 20px; border-radius: 15px; margin: 20px 0;">
        <h3>🐕 ${datos.nombre_mascota}</h3>
        <p><strong>👤 Dueño:</strong> ${datos.nombre_dueno}</p>
        <p><strong>📱 Teléfono:</strong> ${datos.telefono}</p>
        <p><strong>✉️ Email:</strong> ${datos.email_dueno}</p>
        <p><strong>🐾 Raza:</strong> ${datos.raza} | <strong>Edad:</strong> ${datos.edad} años | <strong>Peso:</strong> ${datos.peso}kg</p>
        ${datos.descripcion ? `<p><em>"${datos.descripcion}"</em></p>` : ''}
        ${datos.vacunas ? '<p>✅ Vacunas al día</p>' : '<p>⚠️ Verificar vacunas</p>'}
      </div>
      
      ${datos.fotos && datos.fotos.length ? 
        `<div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
          ${datos.fotos.slice(0,5).map(url => 
            `<img src="${url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">`
          ).join('')}
        </div>`
      : ''}
      
      <div style="background: #f0f4f8; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p><strong>📍 Ubicación actual del rescatador:</strong></p>
        <small>Abre "Enviar mi ubicación" para compartir GPS exacto</small>
      </div>
    `
    
    // Guardar datos para botones
    window.datosRescate = datos
    
  } catch(e) {
    document.getElementById('datosRescate').innerHTML = '<p style="color: red;">❌ Error leyendo QR</p>'
  }
}

export function contactarDueno() {
  const tel = window.datosRescate?.telefono?.replace(/\D/g, '')
  window.open(`https://wa.me/${tel}`, '_blank')
}

export function enviarCorreo() {
  window.location.href = `mailto:${window.datosRescate?.email_dueno}?subject=¡Encontré tu mascota ${window.datosRescate?.nombre_mascota}!`
}

export function copiarTelefono() {
  navigator.clipboard.writeText(window.datosRescate.telefono)
  alert('📋 Teléfono copiado')
}

export function enviarUbicacion() {
  if (!navigator.geolocation) return alert('GPS no disponible')
  navigator.geolocation.getCurrentPosition(pos => {
    const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
    window.open(url, '_blank')
  }, () => alert('Activa GPS'), { enableHighAccuracy: true })
}
