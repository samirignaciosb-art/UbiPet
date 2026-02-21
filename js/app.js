import { guardarPerfil, generarQR, cerrarSesion, copiarURL } from './perfil.js';
import { login, registrar } from './login.js';
import './main.js';
import './qr.js';
import './rescate.js';
import './supabase.js';

// ✅ Exponer funciones al navegador
window.login = login;
window.registrar = registrar;
window.guardarPerfil = guardarPerfil;
window.generarQR = generarQR;
window.cerrarSesion = cerrarSesion;
window.copiarURL = copiarURL;
