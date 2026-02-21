import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2'

const supabaseUrl = 'https://exeeqykieytuvlzdbsnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZWVxeWtpZXl0dXZsemRic25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ1MjMsImV4cCI6MjA4NzE4MDUyM30.874QQz_xUpJW7tT_iHWyiaeKELmK4reYYOzzlieMJq4'
const supabase = createClient(supabaseUrl, supabaseKey)

let adminSesion = false

// SuperUser login
window.adminLogin = async () => {
  const email = document.getElementById('adminEmail').value
  const pass = document.getElementById('adminPass').value
  
  if (email !== 'samirignaciosb@gmail.com' || pass !== 'Admin123') {
    return alert('❌ Solo superuser autorizado')
  }
  
  adminSesion = true
  document.getElementById('loginAdmin').style.display = 'none'
  document.getElementById('adminDash').style.display = 'block'
  await cargarClientes()
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
  
  try {
    // Crear usuario Supabase
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: pass,
      email_confirm: true
    })
    
    if (error) throw error
    
    // WhatsApp AUTO al cliente
    const mensaje = `✅ ¡Tu placa Ubipet lista!\n\nLogin:\n${email}\n${pass}\n\nhttps://samirignaciosb-art.github.io/UbiPet/`
    window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`)
    
    alert('✅ CLIENTE CREADO + WhatsApp enviado!')
    document.getElementById('newEmail').value = ''
    await cargarClientes()
    
  } catch(error) {
    alert('❌ ' + error.message)
  }
}

window.cargarClientes = async () => {
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, user_id, nombre_mascota, nombre_dueno, esta_perdida, created_at')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    document.getElementById('clientesLista').innerHTML = data.map(cliente => `
      <div class="cliente-row">
        <strong>${cliente.nombre_mascota || 'Sin nombre'}</strong> 
        (${cliente.nombre_dueno || 'Sin dueño'})
        ${cliente.esta_perdida ? '🚨 PERDIDA' : '🟢 OK'}
        <br><small>ID: ${cliente.user_id.slice(0,8)}... | ${new Date(cliente.created_at).toLocaleDateString()}</small>
      </div>
    `).join('')
    
  } catch(error) {
    document.getElementById('clientesLista').innerHTML = 'Error cargando...'
  }
}
