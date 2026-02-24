import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://exeeqykieytuvlzdbsnn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZWVxeWtpZXl0dXZsemRic25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDQ1MjMsImV4cCI6MjA4NzE4MDUyM30.874QQz_xUpJW7tT_iHWyiaeKELmK4reYYOzzlieMJq4'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function subirFotos(files) {
  const urls = []
  for (let file of files) {
    if (!file) continue
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('fotos-mascotas')
      .upload(fileName, file)
    
    if (data) {
      urls.push(`${supabaseUrl}/storage/v1/object/public/fotos-mascotas/${fileName}`)
    }
  }
  return urls
}
