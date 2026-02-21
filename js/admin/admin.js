<!DOCTYPE html>
<html>
<head>
  <title>👑 Ubipet Admin $15/placa</title>
  <style>
    body { 
      background: #f7ede3; font-family: sans-serif; 
      display: flex; justify-content: center; align-items: center; 
      min-height: 100vh; margin: 0; 
    }
    .container { 
      background: white; padding: 30px; border-radius: 15px; 
      box-shadow: 0 8px 20px rgba(0,0,0,0.1); 
      width: 100%; max-width: 800px; text-align: center; 
    }
    input { 
      width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; 
      border: 1px solid #ccc; font-size: 16px; box-sizing: border-box; 
    }
    button { 
      width: 100%; padding: 15px; margin: 10px 0; border: none; 
      border-radius: 10px; background: #4CAF50; color: white; 
      font-weight: bold; font-size: 16px; cursor: pointer; 
    }
    button:hover { opacity: 0.85; }
    .crear-form { background:#e8f5e8; padding:20px; border-radius:15px; margin:20px 0; }
    .cliente-row { background:#f8f9fa; padding:15px; margin:10px 0; border-radius:10px; text-align:left; }
    #clientesLista { max-height: 400px; overflow-y: auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>👑 UBIPET ADMIN</h1>
    
    <!-- Login SuperUser -->
    <div id="loginAdmin">
      <input type="email" id="adminEmail" placeholder="samirignaciosb@gmail.com">
      <input type="password" id="adminPass" placeholder="Admin123">
      <button onclick="adminLogin()">🔐 ACCEDER ADMIN</button>
    </div>
    
    <!-- Dashboard -->
    <div id="adminDash" style="display:none;">
      <h2>💰 CLIENTES ACTIVOS ($15/placa)</h2>
      
      <div class="crear-form">
        <h3>➕ NUEVO CLIENTE (1 clic)</h3>
        <input id="newEmail" placeholder="cliente@placa.cl">
        <input id="newPass" value="Ubipet123" style="width:200px;">
        <button onclick="crearCliente()">🚀 Crear Cliente + WhatsApp</button>
      </div>
      
      <h3>📊 MASCOTAS REGISTRADAS</h3>
      <div id="clientesLista">Cargando clientes...</div>
      
      <button onclick="logoutAdmin()" style="background:#f44336;">🚪 Salir Admin</button>
    </div>
  </div>

  <!-- ✅ SUPABASE + LÓGICA INLINE -->
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script>
    const supabaseUrl = 'https://exeeqykieytuvlzdbsnn.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZWVxeWtpZXl0dXZsemRic25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ1MjMsImV4cCI6MjA4NzE4MDUyM30.874QQz_xUpJW7tT_iHWyiaeKELmK4reYYOzzlieMJq4';
    const supabase = Supabase.createClient(supabaseUrl, supabaseKey);
    
    let adminSesion = false;
    
    async function adminLogin() {
      const email = document.getElementById('adminEmail').value;
      const pass = document.getElementById('adminPass').value;
      
      if (email !== 'samirignaciosb@gmail.com' || pass !== 'Admin123') {
        return alert('❌ Solo superuser: samirignaciosb@gmail.com / Admin123');
      }
      
      adminSesion = true;
      document.getElementById('loginAdmin').style.display = 'none';
      document.getElementById('adminDash').style.display = 'block';
      await cargarClientes();
      alert('✅ ¡ADMIN LIVE! Lista de clientes cargada.');
    }
    
    function logoutAdmin() {
      adminSesion = false;
      document.getElementById('adminDash').style.display = 'none';
      document.getElementById('loginAdmin').style.display = 'block';
      document.getElementById('adminEmail').value = '';
      document.getElementById('adminPass').value = '';
    }
    
    async function crearCliente() {
      const email = document.getElementById('newEmail').value;
      const pass = document.getElementById('newPass').value || 'Ubipet123';
      
      if (!email.includes('@')) {
        return alert('❌ Email inválido');
      }
      
      // Email directo a TU Gmail
      const subject = `🚀 NUEVO CLIENTE UBIPET: ${email}`;
      const body = `CREAR EN SUPABASE Authentication:\n\nEmail: ${email}\nPassword: ${pass}\n\nLuego WhatsApp al cliente:\n"✅ Listo! Login: ${email}/${pass}"`;
      window.location.href = `mailto:samirignaciosb@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // WhatsApp backup al cliente
      const mensajeCliente = `✅ ¡Tu placa Ubipet está lista!\n\nLogin:\n${email}\n${pass}\n\nhttps://samirignaciosb-art.github.io/UbiPet/`;
      window.open(`https://wa.me/56979928352?text=${encodeURIComponent(mensajeCliente)}`, '_blank');
      
      alert('✅ ¡Gmail TU + WhatsApp cliente enviados!\nCrea usuario en Supabase Authentication.');
      document.getElementById('newEmail').value = '';
      await cargarClientes();
    }
    
    async function cargarClientes() {
      try {
        document.getElementById('clientesLista').innerHTML = 'Cargando...';
        
        const { data, error } = await supabase
          .from('perfiles')
          .select('id, user_id, nombre_mascota, nombre_dueno, esta_perdida, created_at')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          document.getElementById('clientesLista').innerHTML = '<div style="text-align:center;color:#666;">Aún sin clientes 🐕<br>¡Crea el primero arriba!</div>';
          return;
        }
        
        document.getElementById('clientesLista').innerHTML = data.map(cliente => `
          <div class="cliente-row">
            <strong>🐕 ${cliente.nombre_mascota || 'Sin nombre'}</strong><br>
            👤 ${cliente.nombre_dueno || 'Sin dueño'}<br>
            <span style="color:${cliente.esta_perdida ? '#f44336' : '#4CAF50'}; font-weight:bold;">
              ${cliente.esta_perdida ? '🚨 PERDIDA' : '🟢 ACTIVA'}
            </span><br>
            <small>ID: ${cliente.user_id ? cliente.user_id.slice(0,8) + '...' : 'N/A'} | 
            ${cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-CL') : 'Sin fecha'}
            </small>
          </div>
        `).join('');
        
      } catch(error) {
        console.error('Error admin:', error);
        document.getElementById('clientesLista').innerHTML = `<div style="color:#f44336;">Error: ${error.message}</div>`;
      }
    }
  </script>
</body>
</html>
