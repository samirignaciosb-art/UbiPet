
import { supabase } from './supabase.js'
import { login, cerrarSesion, getUser } from './auth.js'
import { togglePerdida, guardarPerfil, generarQR, copiarURL, cargarMascotasUsuario, nuevaMascota, cambiarMascota } from './profile.js'
import { cargarRescate, contactarDueno, enviarCorreo, copiarTelefono, enviarUbicacion } from './rescue.js'

window.pedirInvitacion = () => {
  let email = prompt('📧 Email para tu 1ª placa:')
  let nombre = prompt('👤 Tu nombre:')
  
  if (email && nombre) {
    const mensaje = `🚀 NUEVO UBIPET ${nombre} ${email} CREAR: ${email}/Ubipet123`
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
// ⭐ DIA 1: Generador UBP RLS ENABLED (TheDogSpot modelo)
window.generarPlacaIndividual = async () => {
  const clienteEmail = document.getElementById('cliente-email-preset')?.value.trim();
  if(!clienteEmail || !clienteEmail.includes('@')) {
    return alert('❌ Email cliente requerido (@ejemplo.com)');
  }
  
  const id = 'UBP' + String(Math.floor(Math.random() * 99999) + 10000).padStart(5, '0');
  
  try {
    const { error } = await supabase
      .from('perfiles_preset')
      .insert([{ 
        id, 
        status: 'lista_venta', 
        cliente_email: clienteEmail 
      }]);
    
    if(error) throw error;
    
    alert(`✅ Placa ${id} lista!\n📱 QR: ubipet.cl/qr/${id}\n🏭 Imprimir + entrega 24h`);
    window.listarPlacasPreset();  // Refresh lista
    document.getElementById('cliente-email-preset').value = '';
    
  } catch(error) {
    alert('❌ Error: ' + error.message);
  }
}

window.listarPlacasPreset = async () => {
  try {
    const { data } = await supabase
      .from('perfiles_preset')
      .select('id, status, cliente_email, created_at')
      .order('created_at', { ascending: false });
    
    const lista = document.getElementById('placas-preset-lista');
    if(!lista) return;
    
    lista.innerHTML = data?.map(p => `
      <div style="padding:10px; border-bottom:1px solid #eee; background:#f8f9fa; margin:4px 0; border-radius:6px;">
        🆕 <strong>${p.id}</strong> → ${p.cliente_email || 'Sin asignar'} 
        <span style="float:right; color:${p.status === 'lista_venta' ? '#28a745' : '#6c757d'}">${p.status}</span>
      </div>
    `).join('') || '<div style="color:#999;">Sin placas</div>';
    
  } catch(error) {
    console.error('Error placas:', error);
    document.getElementById('placas-preset-lista').innerHTML = '❌ Error cargando';
  }
}

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
