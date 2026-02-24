import { supabase } from './supabase.js'

// ⭐ FUNCIONES ORIGINALES (SIN CAMBIOS)
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  })
  
  if (error) throw new Error(error.message)
  return data
}

export async function registrar(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password
  })
  
  if (error) throw new Error(error.message)
  return data
}

export async function cerrarSesion() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  return data
}

// ⭐ NUEVAS FUNCIONES WHATSAPP + DEMO (PASO 2)
window.loginDemo = async () => {
  try {
    document.getElementById('email').value = 'samirignaciosb@gmail.com'
    document.getElementById('password').value = 'Gapo1342.'
    await window.login('samirignaciosb@gmail.com', 'Gapo1342.')
    window.location.href = 'perfil.html'
  } catch(error) {
    alert('❌ Error demo: ' + error.message)
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
    
    const mensaje = `🚀 *NUEVO CLIENTE UBIPET* 🐕💰\n\n` +
      `👤 *${nombre}*\n` +
      `📧 ${email}\n` +
      `📱 ${telefono || 'No proporcionó'}\n\n` +
      `*PEDIDO:* 1ª PLACA GRATIS + USUARIO\n` +
      `Crea en Supabase:\n` +
      `${email} / Ubipet123\n\n` +
      `🚀 https://samirignaciosb-art.github.io/UbiPet/`
    
    // WhatsApp directo a TU número
    window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`, '_blank')
    
    alert('✅ ¡Listo! Te contactaré en 2min con tu acceso + 1ª placa GRATIS 🐕💰')
  }
}
