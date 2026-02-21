// js/admin/admin.js - FIXED 100%
import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2'

const supabaseUrl = 'https://exeeqykieytuvlzdbsnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZWVxeWtpZXl0dXZsemRic25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ1MjMsImV4cCI6MjA4NzE4MDUyM30.874QQz_xUpJW7tT_iHWyiaeKELmK4reYYOzzlieMJq4'

// ✅ FIXED: Sintaxis correcta
const supabase = createClient(supabaseUrl, supabaseKey)

let adminSesion = false

// ✅ TODAS FUNCIONES EXPUESTAS COMO window.*
window.adminLogin = async () => {
  const email = document.getElementById('adminEmail').value
  const pass = document.getElementById('adminPass').value
  
  if (email !== 'samirignaciosb@gmail.com' || pass !== 'Admin123') {
    return alert('❌ Solo: samirignaciosb@gmail.com / Admin123')
  }
  
  adminSesion = true
  document.getElementById('loginAdmin').style.display = 'none'
  document.getElementById('adminDash').style.display = 'block'
  await window.cargarClientes()
  alert('✅ ¡ADMIN LIVE!')
}

window.logoutAdmin = () => {
  adminSesion = false
  document.getElementById('adminDash').style.display = 'none'
  document.getElementById('loginAdmin').style.display = 'block'
}

window.crearCliente = async () => {
  const email = document.getElementById('newEmail').value
  const pass = document.getElementById('newPass').value || 'Ubipet123'
  
  if (!email.includes('@')) return alert('❌ Email inválido')
  
  // ✅ Email TÚ + WhatsApp cliente
  const subject = `🚀 NUEVO CLIENTE: ${email}`
  const body = `CREAR SUPABASE:\n${email} / ${pass}`
  window.location.href = `mailto:samirignaciosb@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  const mensaje = `✅ ¡Placa lista!\n${email}/${pass}\nhttps://samirignaciosb-art.github.io/UbiPet/`
  window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`)
  
  alert('✅ ¡Gmail + WhatsApp enviados!')
  document.getElementById('newEmail').value = ''
  await window.cargarClientes()
}

window.cargarClientes = async () => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, user_id, nombre_mascota, nombre_dueno, esta_perdida, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    document.getElementById('clientesLista').innerHTML = 
      data?.map(cliente => `
        <div style="background:#f8f9fa;padding:15px;margin:10px 0;border-radius:10px;">
          <strong>${cliente.nombre_mascota || 'Sin mascota'}</strong> 
         
