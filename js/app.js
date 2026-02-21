// js/app.js - FIXED 100% - UBIPET VENTAS $15/PLACA
import { supabase } from './supabase.js'
import { login, cerrarSesion, getUser } from './auth.js'
import { togglePerdida, guardarPerfil, generarQR, copiarURL, cargarMascotasUsuario, nuevaMascota, cambiarMascota } from './profile.js'
import { cargarRescate, contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescue.js'

// ⭐ FUNCIONES WHATSAPP + DEMO (EMBEDDED en app.js)
window.loginDemo = async () => {
  try {
    document.getElementById('email').value = 'samirignaciosb@gmail.com'
    document.getElementById('password').value = 'Gapo1342.'
    await login('samirignaciosb@gmail.com', 'Gapo1342.')
    window.location.href = 'perfil.html'
  } catch(error) {
    alert('❌ Demo Sofía: ' + error.message)
  }
}

window.pedirInvitacion = () => {
  let email = prompt('📧 Email para tu 1ª placa Ubipet:')
  let nombre = prompt('👤 Tu nombre completo:')
  let telefono = prompt('📱 WhatsApp (+56912345678):')
  
  if (email && nombre) {
    email = email.trim()
    if (!email.includes('@')) {
      alert('❌ Email inválido')
      return
    }
    
    const mensaje = `🚀 *NUEVO CLIENTE UBIPET* 🐕💰\n\n👤 *${nombre}*\n📧 ${email}\n📱 ${telefono || 'No dio'}\n\n*CREAR:*\n${email} / Ubipet123\n\nhttps://samirignaciosb-art.github.io/UbiPet/`
    
    window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`, '_blank')
    alert('✅ ¡Te contacto en 2min con acceso + 1ª PLACA GRATIS! 🐕💰')
  }
}

// ⭐ EXPONER TODAS FUNCIONES (ORDEN CRÍTICO)
window.login = async () => {
  const email = document.getElementById('email')?.value
  const password = document.getElementById('password')?.value
  if (!email || !password) return alert('⚠️ Email y contraseña requeridos')
  
  try {
    await login(email, password)
    window.location.href = 'perfil.html'
  } catch(error) {
    alert('❌ Login: ' + error.message)
  }
}

window.cerrarSesion = async () => {
  try {
    await cerrarSesion()
    window.location.href = 'index.html'
  } catch(error) {
    alert('❌ Error: ' + error.message)
  }
}

// Profile functions
window.togglePerdida = togglePerdida
window.guardarPerfil = async () => {
  try {
    await guardarPerfil()
    alert('✅ Perfil guardado')
  } catch(error) {
    alert('❌ Error: ' + error.message)
  }
}
window.generarQR = async () => {
  try {
    await generarQR()
  } catch(error) {
    alert('❌ QR: ' + error.message)
  }
}
window.copiarURL = copiarURL
window.nuevaMascota = nuevaMascota
window.cambiarMascota = cambiarMascota

// Rescue functions  
window.cargarRescate = cargarRescate
window.contactarDueno = contactarDueno
window.enviarCorreo = enviarCorreo
window.copiarTelefono = copiarTelefono
window.enviarUbicacion = enviarUbicacion

// ⭐ AUTO-EJECUTAR SEGÚN PÁGINA (FIXED)
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ UBIPET LIVE - Todos botones ACTIVOS')
  
  // Perfil.html - Multi-mascota
  if (window.location.pathname.includes('perfil.html')) {
    setTimeout(async () => {
      if (typeof window.cargarMascotasUsuario === 'function') {
        await window.cargarMascotasUsuario()
      }
    }, 500)
  }
  
  // Rescate.html - QR auto
  if (window.location.pathname.includes('rescate.html')) {
    setTimeout(() => {
      if (typeof window.cargarRescate === 'function') {
        window.cargarRescate()
      }
    }, 200)
  }
  
  console.log('✅ Botones listos:', {
    loginDemo: typeof window.loginDemo,
    pedirInvitacion: typeof window.pedirInvitacion,
    login: typeof window.login
  })
})
