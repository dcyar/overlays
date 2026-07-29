<template>
  <div class="image-upload">
    <h2>Subir Nueva Imagen</h2>
    
    <form @submit.prevent="handleSubmit" class="upload-form">
      <!-- Input de archivo -->
      <div class="form-group">
        <label for="file-input">Seleccionar Imagen</label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          @change="handleFileChange"
          required
        />
        <small v-if="fileSizeError" class="error">{{ fileSizeError }}</small>
      </div>

      <!-- Preview -->
      <div v-if="previewUrl" class="preview">
        <img :src="previewUrl" alt="Preview" />
      </div>

      <!-- Nombre -->
      <div class="form-group">
        <label for="name-input">Nombre</label>
        <input
          id="name-input"
          v-model="name"
          type="text"
          placeholder="Nombre de la imagen"
          required
        />
      </div>

      <!-- Duración -->
      <div class="form-group">
        <label for="duration-input">Duración (segundos)</label>
        <input
          id="duration-input"
          v-model.number="duration"
          type="number"
          min="1"
          max="15"
          step="1"
          required
        />
        <small>Entre 1 y 15 segundos (tiempo de animación)</small>
      </div>

      <!-- Tipo de animación -->
      <div class="form-group">
        <label for="animation-input">Tipo de Animación</label>
        <select id="animation-input" v-model="animationType" required>
          <option v-for="type in animationTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button type="submit" :disabled="uploading || !selectedFile">
          {{ uploading ? 'Subiendo...' : 'Subir Imagen' }}
        </button>
        <button type="button" @click="resetForm" :disabled="uploading">
          Cancelar
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">¡Imagen subida exitosamente!</div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useImagesStore } from '@/stores/images'
import { ANIMATION_TYPES } from '@/lib/supabase'

const store = useImagesStore()

const selectedFile = ref(null)
const previewUrl = ref('')
const name = ref('')
const duration = ref(5)
const animationType = ref('shake')
const uploading = ref(false)
const error = ref('')
const success = ref(false)
const fileSizeError = ref('')

const animationTypes = ANIMATION_TYPES

const MAX_FILE_SIZE = 5000 * 1024 // 500KB

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    fileSizeError.value = `La imagen debe ser menor a 500KB. Tamaño actual: ${(file.size / 1024).toFixed(0)}KB`
    selectedFile.value = null
    previewUrl.value = ''
    return
  }

  fileSizeError.value = ''
  selectedFile.value = file

  // Generar preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Auto-llenar nombre si está vacío
  if (!name.value) {
    name.value = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleSubmit = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  error.value = ''
  success.value = false

  try {
    await store.addImage(
      selectedFile.value,
      name.value,
      duration.value,
      animationType.value
    )
    success.value = true
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Error al subir la imagen'
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  selectedFile.value = null
  previewUrl.value = ''
  name.value = ''
  duration.value = 5
  animationType.value = 'shake'
  error.value = ''
  success.value = false
  fileSizeError.value = ''
  document.getElementById('file-input').value = ''
}
</script>

<style scoped>
.image-upload {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
  pointer-events: auto;
}

.image-upload * {
  pointer-events: auto;
}

h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: #333;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #555;
}

input[type="text"],
input[type="number"],
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  outline: none;
  border-color: #4CAF50;
}

input[type="file"] {
  padding: 8px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.preview {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 200px;
  overflow: hidden;
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background: #f9f9f9;
}

.preview img {
  max-width: 100%;
  max-height: 180px;
  object-fit: contain;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button[type="submit"] {
  background: #4CAF50;
  color: white;
  flex: 1;
}

button[type="submit"]:hover:not(:disabled) {
  background: #45a049;
}

button[type="button"] {
  background: #f0f0f0;
  color: #666;
}

button[type="button"]:hover:not(:disabled) {
  background: #e0e0e0;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

small {
  font-size: 12px;
  color: #999;
}

.error {
  color: #f44336;
  font-size: 14px;
  padding: 8px;
  background: #ffebee;
  border-radius: 4px;
}

.success {
  color: #4CAF50;
  font-size: 14px;
  padding: 8px;
  background: #e8f5e9;
  border-radius: 4px;
}
</style>
