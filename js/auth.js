import { supabase } from './supabase.js'

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
