// Configuración de PeerJS basada en variables de entorno

// Determinar si usar servidor local o en la nube
const useLocal = import.meta.env.VITE_PEER_USE_LOCAL === 'true'

// Configuración del servidor local
const localConfig = {
  host: import.meta.env.VITE_PEER_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_PEER_PORT || '3000'),
  path: import.meta.env.VITE_PEER_PATH || '/peerjs',
  debug: 1
}

// Configuración del servidor en la nube (servidor público de PeerJS)
const cloudConfig = {
  debug: 1
  // No especificamos host, port ni path para usar el servidor por defecto
}

/**
 * Obtiene la configuración de PeerJS según las variables de entorno
 * @returns {Object} Configuración de PeerJS
 */
export const getPeerConfig = () => {
  const config = useLocal ? localConfig : cloudConfig
  
  console.log('🔧 PeerJS Configuration:')
  console.log('  Mode:', useLocal ? '🏠 LOCAL' : '☁️ CLOUD')
  
  if (useLocal) {
    console.log(`  Host: ${config.host}`)
    console.log(`  Port: ${config.port}`)
    console.log(`  Path: ${config.path}`)
  } else {
    console.log('  Using default PeerJS cloud server')
  }
  
  return config
}

/**
 * Indica si se está usando el servidor local
 * @returns {boolean}
 */
export const isUsingLocalServer = () => useLocal

/**
 * Obtiene el nombre descriptivo del modo actual
 * @returns {string}
 */
export const getServerMode = () => useLocal ? 'Local Server' : 'Cloud Server'
