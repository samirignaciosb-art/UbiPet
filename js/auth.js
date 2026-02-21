import { supabase } from './supabase.js'

export async function login() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  })

  if (error) {
    alert('❌ Error: ' + error.message)
    return false
  }
  
  window.location.href = 'perfil.html'
  return true
}

export async function registrar() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password
  })

  if (error) {
    alert('❌ Error: ' + error.message)
  } else {
    alert('✅ Revisa tu email para confirmar cuenta')
  }
  return true
}

export async function cerrarSesion() {
  await supabase.auth.signOut()
  window.location.href = 'index.html'
}
