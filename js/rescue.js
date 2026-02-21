export function cargarRescate() {
  const urlParams = new URLSearchParams(window.location.search)
  const dataParam = urlParams.get('data')
  
  if (!dataParam) return

  try {
    const datos = JSON.parse(atob(dataParam))
    
    document.getElementById('tituloRescate').textContent = 
      datos.esta_perdida ? '🚨 MASCOTA PERDIDA 🚨' : '🐕 Mascota Encontrada'
    
    document.getElementById('datosRescate').innerHTML = `
      <div style="background: ${datos.esta_perdida ? '#ff6b6b' : '#06d6a0'}; color: white; padding: 20px; border-radius: 15px; margin: 20px 0;">
        <h3>🐕 ${datos.nombre_mascota}</h3>
        <p><strong>👤 Dueño:</strong> ${datos.nombre_dueno}</p>
        <p><strong>📱 Teléfono:</strong> ${datos.telefono}</p>
        <p><strong>✉️ Email:</strong> ${datos.email_dueno}</p>
        <p><strong>🐾 Raza:</strong> ${datos.raza} | <strong>Edad:</strong> ${datos.edad} años | <strong>Peso:</strong> ${datos.peso}kg</p>
        ${datos.descripcion ? `<p><em>"${datos.descripcion}"</em></p>` : ''}
        ${datos.vacunas ? '<p>✅ Vacunas al día</p>' : ''}
      </div>
    `
    
    window.datosRescate = datos
  } catch(e) {
    document.getElementById('datosRescate').innerHTML = '<p style="color: red;">❌ Error QR</p>'
  }
}

export function contactarDueno() {
  const tel = window.datosRescate?.telefono?.replace(/\D/g, '')  // ← FIXED: UN SOLO \
  window.open(`https://wa.me/${tel}`)
}

export function enviarCorreo() {
  window.location.href = `mailto:${window.datosRescate?.email_dueno}?subject=¡Encontré tu mascota!`
}

export function copiarTelefono() {
  navigator.clipboard.writeText(window.datosRescate.telefono)
}

export function enviarUbicacion() {
  if (!navigator.geolocation) {
    alert('❌ Tu navegador no soporta GPS')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(6)
      const lng = pos.coords.longitude.toFixed(6)
      
      const numeroDueno = window.datosRescate?.telefono?.replace(/\D/g, '')  // ← FIXED
      const mensaje = `🐕 ¡ENCONTRÉ ${window.datosRescate?.nombre_mascota?.toUpperCase()}!\n📍 GPS ACTUAL:\nhttps://www.google.com/maps?q=${lat},${lng}\n\n👤 Rescatador te espera aquí`
      
      const whatsappUrl = `https://wa.me/${numeroDueno}?text=${encodeURIComponent(mensaje)}`
      window.open(whatsappUrl, '_blank')
    }, 
    error => {
      console.log('GPS Error:', error)
      alert('❌ Activa ubicación. Ve a Configuración → Ubicación → Permitir')
    }, 
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}
