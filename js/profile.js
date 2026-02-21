// js/profile.js ← MULTI-MASCOTA $15/placa x N
import { supabase } from './supabase.js'

// ⭐ VARIABLE GLOBAL - Mascota actual
let mascotaActual = null

export function togglePerdida() {
  const toggle = document.getElementById('togglePerdida')
  const inputHidden = document.getElementById('estaPerdida')
  
  inputHidden.value = inputHidden.value === 'true' ? 'false' : 'true'
  toggle.classList.toggle('active')
}

export async function copiarURL() {
  const url = document.getElementById('urlPerfil').textContent
  navigator.clipboard.writeText(url).then(() => {
    mostrarMensaje('📋 URL copiada - ¡Imprime tu placa!', 'success')
  })
}

export async function descargarQR() {
  const qrImg = document.getElementById('qrImg')
  const link = document.createElement('a')
  link.download = `Ubipet-${mascotaActual?.nombre_mascota || 'mascota'}.png`
  link.href = qrImg.src
  link.click()
  mostrarMensaje('⬇️ QR descargado para placa física', 'success')
}

// ⭐ NUEVA MASCOTA - Campos vacíos
export async function nuevaMascota() {
  mascotaActual = {
    id: null,
    user_id: (await supabase.auth.getUser()).data.user.id,
    nombre_mascota: '',
    peso: 0,
    edad: 0,
    raza: '',
    vacunas: false,
    descripcion: '',
    nombre_dueno: '',
    email_dueno: '',
    telefono: '',
    esta_perdida: false
  }
  
  // Limpiar formulario
  document.querySelectorAll('input, textarea').forEach(el => {
    if (el.type === 'checkbox') el.checked = false
    else el.value = ''
  })
  document.getElementById('togglePerdida').classList.remove('active')
  document.getElementById('estaPerdida').value = 'false'
  document.getElementById('perfilId').value = ''
  
  document.getElementById('formPerfil').style.display = 'block'
  document.getElementById('btnGuardar').textContent = '💾 Crear Mascota'
  document.getElementById('btnQR').disabled = true
  document.getElementById('qrSection').classList.add('hidden')
  
  mostrarMensaje('➕ ¡Nueva mascota! Llena los datos y guarda.', 'info')
}

// ⭐ CAMBIAR MASCOTA del dropdown
export async function cambiarMascota() {
  const select = document.getElementById('selectorMascotas')
  const index = parseInt(select.value)
  
  if (index >= 0 && window.mascotasUsuario[index]) {
    mascotaActual = window.mascotasUsuario[index]
    cargarCampos(mascotaActual)
    document.getElementById('btnGuardar').textContent = '💾 Actualizar'
    document.getElementById('btnQR').disabled = false
  }
}

// ⭐ CARGAR TODAS las mascotas del usuario
export async function cargarMascotasUsuario() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: perfiles, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('user_id', user.id)
      .order('nombre_mascota')

    if (error) {
      console.error('Error cargando mascotas:', error)
      mostrarMensaje('No hay mascotas aún. ¡Crea la primera!', 'info')
      return
    }

    window.mascotasUsuario = perfiles
    const selector = document.getElementById('selectorMascotas')
    
    if (perfiles.length === 0) {
      selector.innerHTML = '<option value="-1">No hay mascotas</option>'
      document.getElementById('mascotas-section').style.display = 'block'
      document.getElementById('formPerfil').style.display = 'none'
      return
    }

    // Llenar dropdown
    selector.innerHTML = perfiles.map((p, i) => 
      `<option value="${i}">${p.nombre_mascota} ${p.esta_perdida ? '🚨PERDIDA' : '🟢OK'}</option>`
    ).join('') + '<option value="-1">➕ Nueva mascota</option>'

    document.getElementById('mascotas-section').style.display = 'block'
    
    // Cargar primera mascota automáticamente
    if (perfiles[0]) {
      mascotaActual = perfiles[0]
      cargarCampos(perfiles[0])
      document.getElementById('formPerfil').style.display = 'block'
      document.getElementById('btnGuardar').textContent = '💾 Actualizar'
      document.getElementById('btnQR').disabled = false
    }
  } catch(error) {
    console.error('Error:', error)
  }
}

// ⭐ CARGAR CAMPOS de una mascota específica
function cargarCampos(perfil) {
  document.getElementById('perfilId').value = perfil.id || ''
  document.getElementById('nombreMascota').value = perfil.nombre_mascota || ''
  document.getElementById('peso').value = perfil.peso || ''
  document.getElementById('edad').value = perfil.edad || ''
  document.getElementById('raza').value = perfil.raza || ''
  document.getElementById('descripcion').value = perfil.descripcion || ''
  document.getElementById('nombreDueno').value = perfil.nombre_dueno || ''
  document.getElementById('emailDueno').value = perfil.email_dueno || ''
  document.getElementById('telefono').value = perfil.telefono || ''
  document.getElementById('vacunas').checked = perfil.vacunas || false
  
  // Toggle pérdida
  const estaPerdida = perfil.esta_perdida || false
  document.getElementById('estaPerdida').value = estaPerdida ? 'true' : 'false'
  const toggle = document.getElementById('togglePerdida')
  if (estaPerdida) toggle.classList.add('active')
  else toggle.classList.remove('active')
}

// ⭐ GUARDAR (CREATE o UPDATE)
export async function guardarPerfil() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Debes iniciar sesión')

    // Validación básica
    const nombreMascota = document.getElementById('nombreMascota').value.trim()
    const nombreDueno = document.getElementById('nombreDueno').value.trim()
    const telefono = document.getElementById('telefono').value.trim()
    
    if (!nombreMascota) throw new Error('Nombre de mascota requerido')
    if (!nombreDueno) throw new Error('Tu nombre requerido')
    if (!telefono.match(/\+56[9][0-9]{8}/)) throw new Error('Teléfono +56912345678')

    const perfil = {
      id: document.getElementById('perfilId').value || undefined,
      user_id: user.id,
      nombre_mascota: nombreMascota,
      peso: parseFloat(document.getElementById('peso').value) || 0,
      edad: parseInt(document.getElementById('edad').value) || 0,
      raza: document.getElementById('raza').value,
      vacunas: document.getElementById('vacunas').checked,
      descripcion: document.getElementById('descripcion').value,
      nombre_dueno: nombreDueno,
      email_dueno: document.getElementById('emailDueno').value,
      telefono: telefono,
      esta_perdida: document.getElementById('estaPerdida').value === 'true'
    }

    const { error } = await supabase.from('perfiles').upsert(perfil)
    if (error) throw new Error(error.message)

    mascotaActual = perfil
    document.getElementById('btnGuardar').textContent = '💾 Actualizar'
    document.getElementById('btnQR').disabled = false
    
    // Recargar lista
    await cargarMascotasUsuario()
    mostrarMensaje(`✅ ${perfil.nombre_mascota} guardada correctamente`, 'success')
    
  } catch(error) {
    console.error('Error guardar:', error)
    mostrarMensaje(`❌ Error: ${error.message}`, 'error')
  }
}

// ⭐ GENERAR QR ÚNICO por MASCOTA (PLACA FÍSICA)
export async function generarQR() {
  try {
    if (!mascotaActual) throw new Error('Guarda tu perfil primero')

    // URL con ID específico de esta mascota
    const urlRescate = `rescate.html?id=${mascotaActual.id}`
    const fullUrl = `https://samirignaciosb-art.github.io/UbiPet/${urlRescate}`
    
    document.getElementById('qrImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fullUrl)}`
    document.getElementById('urlPerfil').textContent = fullUrl
    document.getElementById('qrSection').classList.remove('hidden')
    
    mostrarMensaje(`🎯 QR de ${mascotaActual.nombre_mascota} listo para placa`, 'success')
    
  } catch(error) {
    mostrarMensaje(`❌ Error: ${error.message}`, 'error')
  }
}

// ⭐ UTILIDAD - Mensajes
function mostrarMensaje(texto, tipo = 'info') {
  const mensaje = document.getElementById('mensaje')
  mensaje.textContent = texto
  mensaje.className = tipo
  mensaje.style.display = 'block'
  
  setTimeout(() => {
    mensaje.style.display = 'none'
  }, 4000)
}

// ⭐ EXPOSE funciones globales para HTML onclick
window.togglePerdida = togglePerdida
window.guardarPerfil = guardarPerfil
window.generarQR = generarQR
window.copiarURL = copiarURL
window.descargarQR = descargarQR
window.nuevaMascota = nuevaMascota
window.cambiarMascota = cambiarMascota
window.cargarMascotasUsuario = cargarMascotasUsuario
