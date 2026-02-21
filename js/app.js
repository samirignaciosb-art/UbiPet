// Importar TODOS los módulos
import { login, registrar, cerrarSesion } from './auth.js'
import { togglePerdida, guardarPerfil, generarQR, copiarURL } from './profile.js'
import { cargarRescate, contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescue.js'

// ✅ Exponer funciones GLOBALES para onclick en HTML
window.login = login
window.registrar = registrar
window.cerrarSesion = cerrarSesion
window.togglePerdida = togglePerdida
window.guardarPerfil = guardarPerfil
window.generarQR = generarQR
window.copiarURL = copiarURL
window.contactarDueno = contactarDueno
window.enviarCorreo = enviarCorreo
window.copiarTelefono = copiarTelefono
window.enviarUbicacion = enviarUbicacion

// Auto-detectar página y ejecutar lógica específica
if (window.location.pathname.includes('perfil.html')) {
  // Cargar perfil del usuario actual
  console.log('🆔 Perfil page loaded')
} else if (window.location.pathname.includes('rescate.html')) {
  // Cargar datos del QR automáticamente
  cargarRescate()
  console.log('🚨 Rescate page loaded')
}
