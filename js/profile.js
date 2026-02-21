import { supabase } from './supabase.js'

export function togglePerdida() {
  const toggle = document.getElementById('togglePerdida')
  const inputHidden = document.getElementById('estaPerdida')
  
  inputHidden.value = inputHidden.value === 'true' ? 'false' : 'true'
  toggle.classList.toggle('active')
}

export async function guardarPerfil() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Debes iniciar sesión')

  const perfil = {
    user_id: user.id,
    nombre_mascota: document.getElementById('nombreMascota').value,
    peso: parseFloat(document.getElementById('peso').value) || 0,
    edad: parseInt(document.getElementById('edad').value) || 0,
    raza: document.getElementById('raza').value,
    vacunas: document.getElementById('vacunas').checked,
    descripcion: document.getElementById('descripcion').value,
    nombre_dueno: document.getElementById('nombreDueno').value,
    email_dueno: document.getElementById('emailDueno').value,
    telefono: document.getElementById('telefono').value,
    esta_perdida: document.getElementById('estaPerdida').value === 'true'
  }

  const { error } = await supabase.from('perfiles').upsert(perfil)
  if (error) throw new Error(error.message)
}

export async function generarQR() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!perfil) throw new Error('Guarda tu perfil primero')

  const qrData = { ...perfil, timestamp: Date.now() }
  const url = `rescate.html?data=${btoa(JSON.stringify(qrData))}`
  
  document.getElementById('qrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`
  document.getElementById('urlPerfil').textContent = url
  document.getElementById('qrSection').classList.remove('hidden')
}

export function copiarURL() {
  const url = document.getElementById('urlPerfil').textContent
  navigator.clipboard.writeText(url)
}
// CARGAR perfil al iniciar sesión
export async function cargarPerfil() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (perfil) {
      // Llenar TODOS los campos
      document.getElementById('nombreMascota').value = perfil.nombre_mascota || ''
      document.getElementById('peso').value = perfil.peso || ''
      document.getElementById('edad').value = perfil.edad || ''
      document.getElementById('raza').value = perfil.raza || ''
      document.getElementById('descripcion').value = perfil.descripcion || ''
      document.getElementById('nombreDueno').value = perfil.nombre_dueno || ''
      document.getElementById('emailDueno').value = perfil.email_dueno || ''
      document.getElementById('telefono').value = perfil.telefono || ''
      document.getElementById('vacunas').checked = perfil.vacunas || false
      
      // Toggle perdida
      const estaPerdida = perfil.esta_perdida || false
      document.getElementById('estaPerdida').value = estaPerdida
      if (estaPerdida) {
        document.getElementById('togglePerdida').classList.add('active')
      }
      
      // Habilitar QR
      document.querySelector('button[onclick="generarQR()"]').disabled = false
    }
  } catch(error) {
    console.log('No hay perfil guardado aún')
  }
}
