import { login, registrar } from './login.js';
import { guardarPerfil, generarQR, cerrarSesion, copiarURL, togglePerdida } from './perfil.js';
import { contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescate.js';
import './main.js';
import './qr.js';
import './supabase.js';

// ✅ Exponer funciones al navegador
window.login = login;
window.registrar = registrar;

window.guardarPerfil = guardarPerfil;
window.generarQR = generarQR;
window.cerrarSesion = cerrarSesion;
window.copiarURL = copiarURL;
window.togglePerdida = togglePerdida;

window.contactarDueno = contactarDueno;
window.enviarCorreo = enviarCorreo;
window.copiarTelefono = copiarTelefono;
window.enviarUbicacion = enviarUbicacion;
