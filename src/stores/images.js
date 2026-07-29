import { defineStore } from 'pinia'
import { supabase, STORAGE_BUCKET } from '@/lib/supabase'

export const useImagesStore = defineStore('images', {
  state: () => ({
    images: [],
    currentDisplaying: null,
    loading: false,
    error: null,
    peerConnection: null,
    peerId: null
  }),

  actions: {
    // Cargar todas las imágenes desde Supabase
    async fetchImages() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('overlay_images')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.images = data || []
      } catch (err) {
        this.error = err.message
        console.error('Error fetching images:', err)
      } finally {
        this.loading = false
      }
    },

    // Agregar nueva imagen
    async addImage(file, name, duration, animationType) {
      this.loading = true
      this.error = null
      try {
        // 1. Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `artistas/${fileName}`

        // 2. Subir imagen a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // 3. Obtener URL pública de la imagen
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)

        // 4. Guardar metadata en la base de datos
        const { data, error: dbError } = await supabase
          .from('overlay_images')
          .insert({
            name,
            file_path: filePath,
            url: publicUrl,
            duration,
            animation_type: animationType
          })
          .select()
          .single()

        if (dbError) {
          // Si falla el insert en DB, eliminar la imagen subida
          await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
          throw dbError
        }

        // 5. Agregar a la lista local
        this.images.unshift(data)
        return data
      } catch (err) {
        this.error = err.message
        console.error('Error adding image:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Actualizar imagen existente
    async updateImage(id, updates) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('overlay_images')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        // Actualizar en la lista local
        const index = this.images.findIndex(img => img.id === id)
        if (index !== -1) {
          this.images[index] = data
        }

        return data
      } catch (err) {
        this.error = err.message
        console.error('Error updating image:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Eliminar imagen
    async deleteImage(id) {
      this.loading = true
      this.error = null
      try {
        // 1. Obtener información de la imagen
        const image = this.images.find(img => img.id === id)
        if (!image) throw new Error('Image not found')

        // 2. Eliminar de la base de datos
        const { error: dbError } = await supabase
          .from('overlay_images')
          .delete()
          .eq('id', id)

        if (dbError) throw dbError

        // 3. Eliminar archivo de Storage
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([image.file_path])

        if (storageError) {
          console.warn('Warning: Could not delete file from storage:', storageError)
        }

        // 4. Eliminar de la lista local
        const index = this.images.findIndex(img => img.id === id)
        if (index !== -1) {
          this.images.splice(index, 1)
        }
      } catch (err) {
        this.error = err.message
        console.error('Error deleting image:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Establecer conexión PeerJS (para el panel)
    setPeerConnection(peer) {
      this.peerConnection = peer
      this.peerId = peer.id
      console.log('Peer connection established:', peer.id)
    },

    // Mostrar imagen en el overlay (enviar comando via PeerJS)
    async displayImage(imageId, connection) {
      try {
        const image = this.images.find(img => img.id === imageId)
        if (!image) throw new Error('Image not found')

        console.log('🎬 Attempting to display image:', {
          id: imageId,
          name: image.name,
          hasConnection: !!connection,
          connectionOpen: connection?.open
        })

        this.currentDisplaying = imageId

        // Enviar datos via PeerJS
        if (connection && connection.open) {
          const payload = {
            type: 'display',
            payload: {
              imageId: image.id,
              url: image.url,
              duration: image.duration,
              animationType: image.animation_type
            }
          }
          
          connection.send(payload)
          console.log('✅ Display command sent via PeerJS:', payload)
        } else {
          const reason = !connection 
            ? 'No connection object provided' 
            : 'Connection exists but is not open (connection.open = false)'
          console.error('❌ Cannot send display command:', reason)
          console.error('💡 Make sure the Overlay is open and connected before trying to display images')
          throw new Error('Overlay is not connected. Open the overlay in another tab first.')
        }

        // Limpiar el estado después de la duración
        setTimeout(() => {
          if (this.currentDisplaying === imageId) {
            this.currentDisplaying = null
          }
        }, (image.duration + 1) * 1000)

      } catch (err) {
        this.error = err.message
        console.error('Error displaying image:', err)
        throw err
      }
    },

    // Limpiar conexión
    clearPeerConnection() {
      this.peerConnection = null
      this.peerId = null
    }
  }

  // NOTA: Removido persist para que no guarde en localStorage
  // Ahora todo se guarda en Supabase
})
