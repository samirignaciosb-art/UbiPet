// js/app.js - MAIN que une TODO
import { login, registrar, cerrarSesion, getUser } from './auth.js'
import { togglePerdida, guardarPerfil, generarQR, copiarURL, cargarPerfil } from './profile.js'
import { cargarRescate, contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescue.js'

// Exponer TODAS las funciones globalmente para onclick HTML
window.login = async function() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  try {
    await login(email, password)
    window.location.href = 'perfil.html'
  } catch(error) {
    alert('❌ Login: ' + error.message)
  }
}

window.registrar = async function() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  try {
    await registrar(email, password)
    alert('✅ Revisa tu email para confirmar')
  } catch(error) {
    alert('❌ Registro: ' + error.message)
  }
}

window.cerrarSesion = async function() {
  try {
    await cerrarSesion()
    window.location.href = 'index.html'
  } catch(error) {
    alert('❌ Error: ' + error.message)
  }
}

window.togglePerdida = togglePerdida
window.guardarPerfil = async function() {
  try {
    await guardarPerfil()
    alert('✅ Perfil guardado')
  } catch(error) {
    alert('❌ Perfil: ' + error.message)
  }
}

window.generarQR = async function() {
  try {
    await generarQR()
  } catch(error) {
    alert('❌ QR: ' + error.message)
  }
}

window.copiarURL = copiarURL
window.cargarPerfil = cargarPerfil  // ← ¡ESTA LÍNEA ERA LA CLAVE!

// Rescate functions
window.cargarRescate = cargarRescate
window.contactarDueno = contactarDueno
window.enviarCorreo = enviarCorreo
window.copiarTelefono = copiarTelefono
window.enviarUbicacion = enviarUbicacion

// Auto-ejecutar según página - CARGAR PERFIL AUTOMÁTICO
document.addEventListener('DOMContentLoaded', async () => {
  if (window.location.pathname.includes('rescate.html')) {
    window.cargarRescate()
  } 
  else if (window.location.pathname.includes('perfil.html')) {
    // Esperar que modules carguen completamente
    setTimeout(() => {
      if (typeof window.cargarPerfil === 'function') {
        window.cargarPerfil()
      }
    }, 200)
  }
})
