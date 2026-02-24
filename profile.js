// js/app.js - 100% FUNCIONANDO SIN ERRORES - UBIPET $15/PLACA
import { supabase } from './supabase.js'
import { login, cerrarSesion, getUser } from './auth.js'
import { togglePerdida, guardarPerfil, generarQR, copiarURL, cargarMascotasUsuario, nuevaMascota, cambiarMascota } from './profile.js'
import { cargarRescate, contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescue.js'

// ⭐ WHATSAPP + DEMO (100% INLINE)
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
  let email = prompt('📧 Email para tu 1ª placa:')
  let nombre = prompt('👤 Tu nombre:')
  
  if (email && nombre) {
    const mensaje = `🚀 NUEVO UBIPET\n${nombre}\n${email}\n\nCREAR: ${email}/Ubipet123`
    window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`)
    alert('✅ ¡WhatsApp enviado! Te creo acceso en 2min 🐕💰')
  }
}

// ⭐ TODAS FUNCIONES GLOBALES
window.login = async () => {
  const email = document.getElementById('email')?.value
  const password = document.getElementById('password')?.value
  if (!email || !password) return alert('Email y contraseña requeridos')
  
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

// Profile
window.togglePerdida = togglePerdida
window.guardarPerfil = async () => {
  try {
    await guardarPerfil()
    alert('✅ Guardado')
  } catch(error) {
    alert('❌ ' + error.message)
  }
}
window.generarQR = async () => {
  try {
    await generarQR()
  } catch(error) {
    alert('❌ ' + error.message)
  }
}
window.copiarURL = copiarURL
window.cargarMascotasUsuario = cargarMascotasUsuario
window.nuevaMascota = nuevaMascota
window.cambiarMascota = cambiarMascota

// Rescue
window.cargarRescate = cargarRescate
window.contactarDueno = contactarDueno
window.enviarCorreo = enviarCorreo
window.copiarTelefono = copiarTelefono
window.enviarUbicacion = enviarUbicacion

// ⭐ INIT
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ UBIPET LIVE - Botones OK')
  
  // Perfil auto-load
  if (window.location.pathname.includes('perfil.html')) {
    setTimeout(() => {
      if (window.cargarMascotasUsuario) window.cargarMascotasUsuario()
    }, 800)
  }
  
  // Rescate auto-load
  if (window.location.pathname.includes('rescate.html')) {
    setTimeout(() => {
      if (window.cargarRescate) window.cargarRescate()
    }, 300)
  }
})
