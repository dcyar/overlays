<template>
  <div class="image-list">
    <div class="header">
      <h2>Imágenes Subidas</h2>
      <button @click="refreshImages" :disabled="loading" class="refresh-btn">
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="loading && images.length === 0" class="loading">
      Cargando imágenes...
    </div>

    <div v-else-if="images.length === 0" class="empty">
      No hay imágenes subidas aún. ¡Sube tu primera imagen!
    </div>

    <div v-else class="grid">
      <div
        v-for="image in images"
        :key="image.id"
        class="image-card"
        :class="{ displaying: image.id === currentDisplaying }"
      >
        <div class="thumbnail">
          <img :src="image.url" :alt="image.name" />
          <span v-if="image.id === currentDisplaying" class="displaying-badge">
            Mostrando...
          </span>
        </div>

        <div class="info">
          <h3>{{ image.name }}</h3>
          <div class="meta">
            <span class="badge" :class="`badge-${image.animation_type}`">
              {{ getAnimationLabel(image.animation_type) }}
            </span>
            <span class="duration">{{ image.duration }}s</span>
          </div>
        </div>

        <div class="actions">
          <button
            @click="handleDisplay(image.id)"
            :disabled="loading"
            class="btn-display"
            title="Mostrar en overlay"
          >
            ▶ Mostrar
          </button>
          <button
            @click="handleEdit(image)"
            :disabled="loading"
            class="btn-edit"
            title="Editar"
          >
            ✎ Editar
          </button>
          <button
            @click="handleDelete(image.id)"
            :disabled="loading"
            class="btn-delete"
            title="Eliminar"
          >
            🗑 Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="editingImage" class="modal" @click.self="closeEditModal">
      <div class="modal-content">
        <h3>Editar Imagen</h3>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="editForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Duración (segundos)</label>
            <input
              v-model.number="editForm.duration"
              type="number"
              min="1"
              max="15"
              required
            />
          </div>
          <div class="form-group">
            <label>Tipo de Animación</label>
            <select v-model="editForm.animation_type" required>
              <option v-for="type in animationTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-save">Guardar</button>
            <button type="button" @click="closeEditModal" class="btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useImagesStore } from '@/stores/images'
import { ANIMATION_TYPES } from '@/lib/supabase'

const store = useImagesStore()

const editingImage = ref(null)
const editForm = ref({
  name: '',
  duration: 5,
  animation_type: 'shake'
})

// Props para recibir la conexión PeerJS
const props = defineProps({
  peerConnection: {
    type: Object,
    default: null
  }
})

const animationTypes = ANIMATION_TYPES

const images = computed(() => store.images)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const currentDisplaying = computed(() => store.currentDisplaying)

onMounted(() => {
  refreshImages()
})

const refreshImages = async () => {
  await store.fetchImages()
}

const getAnimationLabel = (value) => {
  const type = animationTypes.find(t => t.value === value)
  return type ? type.label : value
}

const handleDisplay = async (imageId) => {
  try {
    await store.displayImage(imageId, props.peerConnection)
  } catch (err) {
    alert('Error al mostrar la imagen: ' + err.message)
  }
}

const handleEdit = (image) => {
  editingImage.value = image
  editForm.value = {
    name: image.name,
    duration: image.duration,
    animation_type: image.animation_type
  }
}

const closeEditModal = () => {
  editingImage.value = null
}

const saveEdit = async () => {
  if (!editingImage.value) return

  try {
    await store.updateImage(editingImage.value.id, editForm.value)
    closeEditModal()
  } catch (err) {
    alert('Error al actualizar la imagen: ' + err.message)
  }
}

const handleDelete = async (imageId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
    return
  }

  try {
    await store.deleteImage(imageId)
  } catch (err) {
    alert('Error al eliminar la imagen: ' + err.message)
  }
}
</script>

<style scoped>
.image-list {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.image-list * {
  pointer-events: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

h2 {
  margin: 0;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #1976D2;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  padding: 12px;
  background: #ffebee;
  border-radius: 4px;
  margin-bottom: 16px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  border: 2px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fafafa;
}

.image-card.displaying {
  border-color: #4CAF50;
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.3);
}

.image-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.displaying-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.info {
  padding: 12px 16px;
}

.info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-shake { background: #FFE0B2; color: #E65100; }
.badge-bounce { background: #F8BBD0; color: #C2185B; }
.badge-rotate { background: #C5CAE9; color: #303F9F; }
.badge-zoom { background: #C8E6C9; color: #2E7D32; }
.badge-slide-in { background: #D1C4E9; color: #512DA8; }
.badge-pulse { background: #B2DFDB; color: #00796B; }

.duration {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-display {
  background: #4CAF50;
  color: white;
}

.btn-display:hover:not(:disabled) {
  background: #45a049;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-edit:hover:not(:disabled) {
  background: #1976D2;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #d32f2f;
}

.actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:hover {
  background: #45a049;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-cancel:hover {
  background: #e0e0e0;
}
</style>
