<!DOCTYPE html>
<html>
<head>
  <title>👑 Ubipet Admin $15/placa</title>
  <link rel="stylesheet" href="css/estilos.css">
  <style>
    .admin-container { max-width: 800px; }
    .cliente-row { background:#f8f9fa; padding:15px; margin:10px 0; border-radius:10px; }
    .crear-form { background:#e8f5e8; padding:20px; border-radius:15px; margin:20px 0; }
    input { width:100%; padding:12px; margin:5px 0; border-radius:8px; border:1px solid #ccc; box-sizing:border-box; }
    button { width:100%; padding:15px; margin:5px 0; border:none; border-radius:10px; background:#4CAF50; color:white; font-weight:bold; cursor:pointer; }
    button:hover { opacity:0.9; }
  </style>
</head>
<body>
  <div class="container admin-container">
    <h1>👑 UBIPET ADMIN</h1>
    
    <!-- Login SuperUser -->
    <div id="loginAdmin">
      <input type="email" id="adminEmail" placeholder="samirignaciosb@gmail.com">
      <input type="password" id="adminPass" placeholder="Admin123">
      <button onclick="adminLogin()">🔐 ACCEDER ADMIN</button>
    </div>
    
    <!-- Dashboard -->
    <div id="adminDash" style="display:none;">
      <h2>💰 CLIENTES ($15/placa)</h2>
      <div class="crear-form">
        <h3>➕ NUEVO CLIENTE</h3>
        <input id="newEmail" placeholder="cliente@placa.cl">
        <input id="newPass" value="Ubipet123" style="width:200px;">
        <button onclick="crearCliente()">🚀 Crear + WhatsApp</button>
      </div>
      
      <h3>📊 MASCOTAS REGISTRADAS</h3>
      <div id="clientesLista">Cargando...</div>
      
      <button onclick="logoutAdmin()" style="background:#f44336;">🚪 Salir</button>
    </div>
  </div>

  <!-- ✅ SCRIPT NORMAL (NO module) -->
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script>
    const supabaseUrl = 'https://exeeqykieytuvlzdbsnn.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZWVxeWtpZXl0dXZsemRic25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ1MjMsImV4cCI6MjA4NzE4MDUyM30.874QQz_xUpJW7tT_iHWyiaeKELmK4reYYOzzlieMJq4'
    const supabase = Supabase.createClient(supabaseUrl, supabaseKey)
    
    let adminSesion = false
    
    async function adminLogin() {
      const email = document.getElementById('adminEmail').value
      const pass = document.getElementById('adminPass').value
      
      if (email !== 'samirignaciosb@gmail.com' || pass !== 'Admin123') {
        return alert('❌ Solo superuser: samirignaciosb@gmail.com/Admin123')
      }
      
      adminSesion = true
      document.getElementById('loginAdmin').style.display = 'none'
      document.getElementById('adminDash').style.display = 'block'
      await cargarClientes()
      alert('✅ ¡ADMIN LIVE!')
    }
    
    function logoutAdmin() {
      adminSesion = false
      document.getElementById('adminDash').style.display = 'none'
      document.getElementById('loginAdmin').style.display = 'block'
    }
    
    async function crearCliente() {
      const email = document.getElementById('newEmail').value
      const pass = document.getElementById('newPass').value || 'Ubipet123'
      
      if (!email.includes('@')) return alert('❌ Email inválido')
      
      try {
        // Email al cliente (simulado)
        const mensaje = `✅ ¡Tu placa Ubipet lista!\n\nLogin:\n${email}\n${pass}\n\nhttps://samirignaciosb-art.github.io/UbiPet/`
        window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensaje)}`)
        
        alert('✅ ¡Cliente creado! Revisa Supabase Authentication')
        document.getElementById('newEmail').value = ''
        await cargarClientes()
      } catch(error) {
        alert('❌ ' + error.message)
      }
    }
    
    async function cargarClientes() {
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
        `).join('') || 'Sin clientes aún'
        
      } catch(error) {
        document.getElementById('clientesLista').innerHTML = 'Error: ' + error.message
      }
    }
  </script>
</body>
</html>
