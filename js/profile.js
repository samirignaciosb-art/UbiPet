import { supabase, subirFotos } from './supabase.js'

let fotosUrls = []

export function togglePerdida() {
  const toggle = document.getElementById('togglePerdida')
  const inputHidden = document.getElementById('estaPerdida')
  
  inputHidden.value = inputHidden.value === 'true' ? 'false' : 'true'
  toggle.classList.toggle('active')
}

export async function guardarPerfil() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    alert('❌ Debes iniciar sesión')
    return
  }

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
    esta_perdida: document.getElementById('estaPerdida').value === 'true',
    fotos: fotosUrls
  }

  const { error } = await supabase
    .from('perfiles')
    .upsert(perfil)

  if (error) {
    alert('❌ Error: ' + error.message)
  } else {
    // Subir fotos si hay nuevas
    const files = ['foto1','foto2','foto3','foto4','foto5'].map(id => 
      document.getElementById(id).files[0]
    )
    
    if (files.some(f => f)) {
      fotosUrls = await subirFotos(files)
      perfil.fotos = fotosUrls
      await supabase.from('perfiles').update({ fotos: fotosUrls }).eq('user_id', user.id)
    }
    
    alert('✅ ¡Perfil guardado!')
    document.querySelector('button[onclick="generarQR()"]').disabled = false
  }
}

export async function generarQR() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!perfil) return alert('❌ Guarda tu perfil primero')

  const qrData = { ...perfil, fotos: fotosUrls, timestamp: Date.now() }
  const url = `rescate.html?data=${btoa(JSON.stringify(qrData))}`
  
  document.getElementById('qrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`
  document.getElementById('urlPerfil').textContent = url
  document.getElementById('qrSection').classList.remove('hidden')
}

export function copiarURL() {
  const url = document.getElementById('urlPerfil').textContent
  navigator.clipboard.writeText(url).then(() => alert('📋 ¡URL copiada!'))
}
