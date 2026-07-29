<template>
  <div class="overlay">
    <transition name="image-transition">
      <div
        v-if="displayingImage"
        :key="displayingImage.id"
        class="image-container"
        :class="animationClass"
        :style="animationStyles"
      >
        <img
          :src="displayingImage.url"
          :alt="displayingImage.name"
          @load="onImageLoaded"
          class="overlay-image"
        />
      </div>
    </transition>

    <!-- Indicador de conexión (solo visible en desarrollo) -->
    <div v-if="showDebug" class="debug-indicator">
      <div class="debug-status" :class="connectionStatusClass">
        {{ connectionStatusText }}
      </div>
      <div v-if="queue.length > 0" class="debug-queue">
        Cola: {{ queue.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Peer from 'peerjs'
import { getPeerConfig, getServerMode } from '@/lib/peerConfig'

const displayingImage = ref(null)
const imageLoaded = ref(false)
const queue = ref([])
const processing = ref(false)
const currentTimeout = ref(null)
const peer = ref(null)
const connection = ref(null)
const connectionStatus = ref('disconnected')
const showDebug = ref(false) // Cambiar a true para ver indicadores de debug

const PANEL_PEER_ID = 'artistas-panel'

const animationClass = computed(() => {
  if (!displayingImage.value || !imageLoaded.value) return ''
  return `anim-${displayingImage.value.animationType}`
})

const animationStyles = computed(() => {
  if (!displayingImage.value) return {}
  return {
    '--duration': `${displayingImage.value.duration}s`,
    '--total-duration': `${displayingImage.value.duration + 0.8}s`
  }
})

const connectionStatusClass = computed(() => {
  return {
    'status-disconnected': connectionStatus.value === 'disconnected',
    'status-connecting': connectionStatus.value === 'connecting',
    'status-connected': connectionStatus.value === 'connected'
  }
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'disconnected':
      return '🔴 Desconectado del Panel'
    case 'connecting':
      return '🟡 Conectando al Panel...'
    case 'connected':
      return '🟢 Conectado - Listo para recibir'
    default:
      return '⚪ Estado Desconocido'
  }
})

const onImageLoaded = () => {
  imageLoaded.value = true
}

const processQueue = async () => {
  if (processing.value || queue.value.length === 0) {
    if (processing.value) {
      console.log('⏸️ Already processing an image')
    }
    return
  }

  processing.value = true
  const nextImage = queue.value.shift()
  console.log('🎨 Processing image from queue:', nextImage)

  try {
    await preloadImage(nextImage)
  } catch (err) {
    console.error('❌ Error processing image:', err)
    processing.value = false
    processQueue() // Intentar procesar la siguiente
  }
}

const preloadImage = (imageData) => {
  return new Promise((resolve, reject) => {
    console.log('🖼️ Preloading image:', imageData.url)
    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Image loaded successfully!')
      displayingImage.value = {
        id: imageData.imageId,
        url: imageData.url,
        duration: imageData.duration,
        animationType: imageData.animationType
      }
      imageLoaded.value = false
      
      const totalDuration = (imageData.duration + 0.8) * 1000
      console.log(`⏱️ Image will display for ${totalDuration}ms`)
      
      currentTimeout.value = setTimeout(() => {
        console.log('⏰ Timer finished, hiding image')
        hideImage()
      }, totalDuration)
      
      resolve()
    }
    
    img.onerror = () => {
      console.error('❌ Error loading image:', imageData.url)
      processing.value = false
      processQueue()
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageData.url
  })
}

const hideImage = () => {
  console.log('👋 Hiding image')
  displayingImage.value = null
  imageLoaded.value = false
  processing.value = false
  
  setTimeout(() => {
    if (queue.value.length > 0) {
      console.log('📋 Processing next image in queue')
    }
    processQueue()
  }, 100)
}

const handleDisplayEvent = (data) => {
  console.log('📥 Display event received:', data)
  
  if (data.type === 'display' && data.payload) {
    console.log('✅ Valid display event, adding to queue:', data.payload)
    queue.value.push(data.payload)
    console.log('📋 Current queue length:', queue.value.length)
    
    if (!processing.value) {
      console.log('🎬 Starting to process queue...')
      processQueue()
    } else {
      console.log('⏳ Already processing, image added to queue')
    }
  } else {
    console.warn('⚠️ Invalid display event format:', data)
  }
}

const connectToPeer = () => {
  try {
    connectionStatus.value = 'connecting'
    console.log('🔍 Attempting to connect to panel:', PANEL_PEER_ID)
    console.log('🎮 Server Mode:', getServerMode())

    // Limpiar cualquier peer existente
    if (peer.value) {
      console.log('🧹 Cleaning up existing peer...')
      peer.value.destroy()
      peer.value = null
    }

    // Obtener configuración desde variables de entorno
    const peerConfig = getPeerConfig()
    peer.value = new Peer(peerConfig)

    peer.value.on('open', (id) => {
      console.log('✅ Overlay peer initialized with ID:', id)
      console.log('🔗 Connecting to panel:', PANEL_PEER_ID)
      
      // Conectarse al panel inmediatamente
      connection.value = peer.value.connect(PANEL_PEER_ID, {
        reliable: true,
        serialization: 'json'
      })

      if (!connection.value) {
        console.error('❌ Failed to create connection object')
        connectionStatus.value = 'disconnected'
        return
      }

      connection.value.on('open', () => {
        console.log('✅ Connected to panel successfully!')
        console.log('🎬 Ready to receive images')
        connectionStatus.value = 'connected'
      })

      connection.value.on('data', (data) => {
        console.log('📥 Received data from panel:', data)
        handleDisplayEvent(data)
      })

      connection.value.on('close', () => {
        console.log('❌ Connection to panel closed')
        connectionStatus.value = 'disconnected'
        connection.value = null
        // Intentar reconectar después de 3 segundos
        setTimeout(() => {
          if (peer.value && !peer.value.destroyed) {
            console.log('🔄 Attempting to reconnect...')
            connectToPeer()
          }
        }, 3000)
      })

      connection.value.on('error', (err) => {
        console.error('⚠️ Connection error:', err)
        connectionStatus.value = 'disconnected'
        connection.value = null
      })
    })

    peer.value.on('error', (err) => {
      console.error('⚠️ Peer error:', err.type, err.message)
      connectionStatus.value = 'disconnected'
      
      if (err.type === 'peer-unavailable') {
        console.log('❌ Panel not found!')
        console.log('💡 Make sure the Panel is open in another tab FIRST')
        console.log('🔄 Will retry in 5 seconds...')
        setTimeout(() => {
          connectToPeer()
        }, 5000)
      } else if (err.type === 'network') {
        console.error('❌ Network error - cannot connect to PeerJS server')
        console.log('🔄 Will retry in 5 seconds...')
        setTimeout(() => {
          connectToPeer()
        }, 5000)
      } else if (err.type === 'server-error') {
        console.error('❌ PeerJS server error')
        console.log('🔄 Will retry in 5 seconds...')
        setTimeout(() => {
          connectToPeer()
        }, 5000)
      }
    })

    peer.value.on('disconnected', () => {
      console.log('⚠️ Peer disconnected')
      connectionStatus.value = 'disconnected'
      console.log('🔄 Attempting to reconnect...')
      setTimeout(() => {
        if (peer.value && !peer.value.destroyed) {
          peer.value.reconnect()
        } else {
          connectToPeer()
        }
      }, 1000)
    })

  } catch (err) {
    console.error('Error connecting to peer:', err)
    connectionStatus.value = 'disconnected'
  }
}

onMounted(() => {
  connectToPeer()
})

onUnmounted(() => {
  if (currentTimeout.value) {
    clearTimeout(currentTimeout.value)
  }
  if (connection.value) {
    connection.value.close()
  }
  if (peer.value) {
    peer.value.destroy()
  }
})
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
  z-index: 9999;
}

/* IMPORTANTE: El overlay solo debe abrirse en /artistas/overlay */
/* NO abrir en la misma pestaña que el panel */
.overlay * {
  pointer-events: none;
}

.image-container {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

/* Entrada y salida base para todas las animaciones */
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Animación: Shake (Agitar lateral) */
@keyframes shake-main {
  0%, 100% { transform: translateX(0) scale(1); }
  10% { transform: translateX(-15px) scale(1); }
  20% { transform: translateX(15px) scale(1); }
  30% { transform: translateX(-12px) scale(1); }
  40% { transform: translateX(12px) scale(1); }
  50% { transform: translateX(-10px) scale(1); }
  60% { transform: translateX(10px) scale(1); }
  70% { transform: translateX(-8px) scale(1); }
  80% { transform: translateX(8px) scale(1); }
  90% { transform: translateX(0) scale(1); }
}

.anim-shake .overlay-image {
  animation: 
    fadeInScale 0.3s ease-out,
    shake-main var(--duration) ease-in-out 0.3s,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Bounce (Rebotar) */
@keyframes bounce-main {
  0%, 100% { transform: translateY(0) scale(1); }
  10% { transform: translateY(-50px) scale(1, 0.95); }
  20% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-40px) scale(1, 0.95); }
  40% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1, 0.95); }
  60% { transform: translateY(0) scale(1); }
  70% { transform: translateY(-20px) scale(1, 0.98); }
  80% { transform: translateY(0) scale(1); }
  90% { transform: translateY(-10px) scale(1, 0.99); }
  95% { transform: translateY(0) scale(1); }
}

.anim-bounce .overlay-image {
  animation: 
    fadeInScale 0.3s ease-out,
    bounce-main var(--duration) ease-in-out 0.3s,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Rotate (Girar) */
@keyframes rotate-main {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.05); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
}

.anim-rotate .overlay-image {
  animation: 
    fadeInScale 0.3s ease-out,
    rotate-main var(--duration) linear 0.3s,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Zoom (Pulsar) */
@keyframes zoom-main {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
  75% { transform: scale(1.15); }
  90% { transform: scale(1); }
}

.anim-zoom .overlay-image {
  animation: 
    fadeInScale 0.3s ease-out,
    zoom-main var(--duration) ease-in-out 0.3s,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Slide-in (Deslizar desde lateral) */
@keyframes slide-main {
  0% { transform: translateX(-100vw) scale(1); }
  15% { transform: translateX(0) scale(1); }
  85% { transform: translateX(0) scale(1); }
  100% { transform: translateX(100vw) scale(1); }
}

.anim-slide-in .overlay-image {
  animation: 
    slide-main calc(var(--duration) + 0.3s) ease-in-out,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Pulse (Respirar con opacity y scale) */
@keyframes pulse-main {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  25% { 
    transform: scale(1.08);
    opacity: 0.9;
  }
  50% { 
    transform: scale(1);
    opacity: 1;
  }
  75% { 
    transform: scale(1.08);
    opacity: 0.9;
  }
}

.anim-pulse .overlay-image {
  animation: 
    fadeInScale 0.3s ease-out,
    pulse-main var(--duration) ease-in-out 0.3s,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
}

/* Animación: Tilt (Inclinación 3D en eje Y con zoom in inicial) */
@keyframes tilt-zoom-in {
  0% { 
    transform: perspective(1200px) rotateY(-25deg) scale(0.3);
    opacity: 0;
  }
  100% { 
    transform: perspective(1200px) rotateY(-20deg) scale(1);
    opacity: 1;
  }
}

@keyframes tilt-rotate {
  0% { transform: perspective(1200px) rotateY(-25deg) scale(1); }
  25% { transform: perspective(1200px) rotateY(-10deg) scale(1); }
  50% { transform: perspective(1200px) rotateY(25deg) scale(1); }
  75% { transform: perspective(1200px) rotateY(-10deg) scale(1); }
  100% { transform: perspective(1200px) rotateY(-25deg) scale(1); }
}

.anim-tilt .overlay-image {
  animation: 
    tilt-zoom-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    tilt-rotate 2.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) 0.4s infinite,
    fadeOut 0.5s ease-in var(--duration);
  animation-fill-mode: forwards;
  transform-style: preserve-3d;
}

/* Transición de Vue (opcional) */
.image-transition-enter-active,
.image-transition-leave-active {
  transition: opacity 0.1s;
}

.image-transition-enter-from,
.image-transition-leave-to {
  opacity: 0;
}

/* Indicadores de debug */
.debug-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto !important;
  z-index: 10000;
}

.debug-indicator * {
  pointer-events: auto !important;
}

.debug-status {
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.debug-status.status-disconnected {
  background: rgba(244, 67, 54, 0.9);
  color: white;
}

.debug-status.status-connecting {
  background: rgba(255, 152, 0, 0.9);
  color: white;
}

.debug-status.status-connected {
  background: rgba(76, 175, 80, 0.9);
  color: white;
}

.debug-queue {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
</style>
