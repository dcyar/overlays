<template>
  <div class="panel-view">
    <div class="container">
      <header class="panel-header">
        <h1>Panel de Control - Imágenes Artistas</h1>
        <p>Gestiona las imágenes que se mostrarán en el overlay</p>
        
        <!-- Estado de conexión PeerJS -->
        <div class="connection-status" :class="connectionStatusClass">
          <span class="status-indicator"></span>
          <div class="status-info">
            <strong>{{ connectionStatusText }}</strong>
            <small v-if="peerId">ID: {{ peerId }}</small>
          </div>
        </div>

        <!-- Instrucciones de conexión -->
        <div v-if="connectionStatus !== 'connected'" class="connection-help">
          <h3>📡 ¿El overlay no se conecta?</h3>
          <ol>
            <li>Asegúrate de que <strong>esta pestaña (Panel) esté abierta primero</strong></li>
            <li>Abre el overlay en <strong>OTRA pestaña/ventana</strong>: <code>{{ overlayUrl }}</code></li>
            <li>Espera 3-5 segundos para que se establezca la conexión</li>
            <li>Abre la consola del navegador (F12) en ambas pestañas para ver logs</li>
          </ol>
          <div class="connection-tip">
            💡 <strong>Orden correcto:</strong> Primero Panel → Luego Overlay
          </div>
        </div>
      </header>

      <div class="panel-content">
        <!-- Componente de subida -->
        <div class="section">
          <ImageUpload />
        </div>

        <!-- Componente de lista -->
        <div class="section">
          <ImageList :peer-connection="overlayConnection" />
        </div>
      </div>

      <footer class="panel-footer">
        <p>
          <strong>Instrucciones:</strong> 
          1. Sube imágenes (máx 500KB), selecciona la animación y duración.<br>
          2. Abre el overlay en <strong>OTRA PESTAÑA</strong> del navegador: <code>{{ overlayUrl }}</code><br>
          3. Cuando el overlay esté conectado, presiona "Mostrar" para enviar la imagen.
        </p>
        <p v-if="!overlayConnection" class="warning">
          ⚠️ El overlay no está conectado. Ábrelo en otra pestaña para poder mostrar imágenes.
        </p>
        <div class="important-note">
          <strong>⚠️ IMPORTANTE:</strong> El panel y el overlay deben estar en pestañas SEPARADAS del navegador. 
          Si intentas abrir ambos en la misma vista, no podrás interactuar con los campos.
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useImagesStore } from '@/stores/images'
import ImageUpload from '@/components/ImageUpload.vue'
import ImageList from '@/components/ImageList.vue'
import Peer from 'peerjs'
import { getPeerConfig, getServerMode } from '@/lib/peerConfig'

const store = useImagesStore()

const peer = ref(null)
const peerId = ref(null)
const overlayConnection = ref(null)
const connectionStatus = ref('disconnected') // disconnected, waiting, connected

const PEER_ID = 'artistas-panel' // ID fijo para que el overlay sepa dónde conectarse

const overlayUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/artistas/overlay`
  }
  return '/artistas/overlay'
})

const connectionStatusClass = computed(() => {
  return {
    'status-disconnected': connectionStatus.value === 'disconnected',
    'status-waiting': connectionStatus.value === 'waiting',
    'status-connected': connectionStatus.value === 'connected'
  }
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'disconnected':
      return 'Inicializando...'
    case 'waiting':
      return 'Esperando overlay...'
    case 'connected':
      return 'Overlay conectado ✓'
    default:
      return 'Desconectado'
  }
})

onMounted(() => {
  // Cargar imágenes desde Supabase
  store.fetchImages()
  // Inicializar conexión PeerJS
  initializePeer()
})

const initializePeer = () => {
  try {
    console.log('🚀 Initializing Panel peer...')
    console.log('🎮 Server Mode:', getServerMode())
    
    // Limpiar cualquier peer existente
    if (peer.value) {
      console.log('🧹 Cleaning up existing peer...')
      peer.value.destroy()
      peer.value = null
    }

    // Obtener configuración desde variables de entorno
    const peerConfig = getPeerConfig()
    peer.value = new Peer(PEER_ID, peerConfig)

    peer.value.on('open', (id) => {
      peerId.value = id
      connectionStatus.value = 'waiting'
      console.log('✅ Panel peer initialized with ID:', id)
      console.log('📡 Waiting for overlay to connect...')
      store.setPeerConnection(peer.value)
    })

    peer.value.on('connection', (conn) => {
      console.log('🔗 Overlay connecting:', conn.peer)
      
      // Asignar la conexión INMEDIATAMENTE (no esperar al evento 'open')
      overlayConnection.value = conn
      
      // Registrar event listeners antes de que la conexión se abra
      conn.on('open', () => {
        connectionStatus.value = 'connected'
        console.log('✅ Connection with overlay is OPEN and ready!')
        console.log('📤 You can now send images to the overlay')
      })

      conn.on('data', (data) => {
        console.log('📥 Received data from overlay:', data)
      })

      conn.on('close', () => {
        console.log('❌ Overlay disconnected')
        overlayConnection.value = null
        connectionStatus.value = 'waiting'
      })

      conn.on('error', (err) => {
        console.error('⚠️ Connection error:', err)
        overlayConnection.value = null
        connectionStatus.value = 'waiting'
      })

      // Verificar si la conexión ya está abierta (puede ocurrir antes de registrar los listeners)
      if (conn.open) {
        connectionStatus.value = 'connected'
        console.log('✅ Connection was already open!')
        console.log('📤 You can now send images to the overlay')
      }
    })

    peer.value.on('error', (err) => {
      console.error('⚠️ Peer error:', err.type, err.message)
      
      if (err.type === 'unavailable-id') {
        console.error('❌ Panel ID already in use!')
        console.error('💡 Solution: Close ALL other Panel tabs and refresh this page')
        alert('ERROR: Ya hay otro Panel abierto. Cierra todas las otras pestañas del Panel y recarga esta página.')
        connectionStatus.value = 'disconnected'
      } else if (err.type === 'network') {
        console.error('❌ Network error - cannot connect to PeerJS server')
        console.log('🔄 Will retry in 5 seconds...')
        setTimeout(() => {
          console.log('🔄 Retrying connection...')
          initializePeer()
        }, 5000)
      } else if (err.type === 'server-error') {
        console.error('❌ PeerJS server error')
        console.log('🔄 Will retry in 5 seconds...')
        setTimeout(() => {
          initializePeer()
        }, 5000)
      }
    })

    peer.value.on('disconnected', () => {
      console.log('⚠️ Peer disconnected')
      connectionStatus.value = 'waiting'
      console.log('🔄 Attempting to reconnect...')
      setTimeout(() => {
        if (peer.value && !peer.value.destroyed) {
          peer.value.reconnect()
        }
      }, 1000)
    })
  } catch (err) {
    console.error('Error initializing peer:', err)
  }
}

onUnmounted(() => {
  if (overlayConnection.value) {
    overlayConnection.value.close()
  }
  if (peer.value) {
    peer.value.destroy()
  }
  store.clearPeerConnection()
})
</script>

<style scoped>
.panel-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px 16px;
  position: relative;
  z-index: 1;
  overflow-y: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.panel-header {
  text-align: center;
  color: white;
  margin-bottom: 32px;
}

.panel-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.panel-header p {
  margin: 0 0 16px 0;
  font-size: 16px;
  opacity: 0.9;
}

/* Estado de conexión */
.connection-status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 12px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-disconnected .status-indicator {
  background: #f44336;
}

.status-waiting .status-indicator {
  background: #ff9800;
}

.status-connected .status-indicator {
  background: #4CAF50;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #333;
}

.status-info strong {
  font-size: 14px;
}

.status-info small {
  font-size: 11px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.connection-help {
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.connection-help h3 {
  margin: 0 0 12px 0;
  color: #ff9800;
  font-size: 16px;
}

.connection-help ol {
  margin: 0 0 12px 0;
  padding-left: 24px;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
}

.connection-help ol li {
  margin-bottom: 8px;
}

.connection-help code {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #d63384;
  font-size: 13px;
}

.connection-tip {
  padding: 10px;
  background: #fff3e0;
  border-radius: 4px;
  color: #e65100;
  font-size: 14px;
  margin-top: 8px;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-footer {
  margin-top: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-footer p {
  margin: 0 0 12px 0;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
}

.panel-footer p:last-child {
  margin-bottom: 0;
}

.panel-footer code {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #d63384;
  font-size: 13px;
}

.warning {
  color: #ff9800 !important;
  font-weight: 600;
  padding: 12px;
  background: #fff3e0;
  border-radius: 4px;
  border-left: 4px solid #ff9800;
}

.important-note {
  margin-top: 16px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196F3;
  color: #1565C0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .panel-view {
    padding: 16px 8px;
  }

  .panel-header h1 {
    font-size: 24px;
  }

  .panel-header p {
    font-size: 14px;
  }

  .connection-status {
    padding: 10px 16px;
  }
}
</style>
