import { createClient } from '@supabase/supabase-js'

// TODO: Reemplaza estas variables con tus credenciales de Supabase
// Puedes obtenerlas en: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configuración del bucket de storage
export const STORAGE_BUCKET = 'overlays-images'

// Tipos de animación disponibles
export const ANIMATION_TYPES = [
  { value: 'shake', label: 'Shake (Agitar)' },
  { value: 'bounce', label: 'Bounce (Rebotar)' },
  { value: 'rotate', label: 'Rotate (Girar)' },
  { value: 'zoom', label: 'Zoom (Pulsar)' },
  { value: 'slide-in', label: 'Slide-in (Deslizar)' },
  { value: 'pulse', label: 'Pulse (Respirar)' },
  { value: 'tilt', label: 'Tilt (Balanceo 3D)' }
]
