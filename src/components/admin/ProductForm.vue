<template>
  <Modal
    :show="show"
    :title="isEditing ? 'Editar Producto' : 'Crear Producto'"
    max-width="md"
    @update:show="$emit('update:show', $event)"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="product-form">
      <div class="form-group">
        <label class="form-label">Nombre del Producto *</label>
        <input 
          :value="productForm.name" 
          @input="updateField('name', $event.target.value)"
          type="text" 
          required 
          placeholder="Ej: iPhone 15 Pro"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Descripción *</label>
        <textarea 
          :value="productForm.description" 
          @input="updateField('description', $event.target.value)"
          required 
          placeholder="Descripción detallada del producto"
          class="form-input form-textarea"
          rows="4"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Precio *</label>
          <input 
            :value="productForm.price" 
            @input="updateField('price', parseFloat($event.target.value) || 0)"
            type="number" 
            step="0.01" 
            min="0" 
            required 
            placeholder="999.99"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Stock *</label>
          <input 
            :value="productForm.stock" 
            @input="updateField('stock', parseInt($event.target.value) || 0)"
            type="number" 
            min="0" 
            required 
            placeholder="10"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Categoría *</label>
        <div class="category-selector">
          <div class="category-select-row">
            <select 
              :value="productForm.category" 
              @change="updateField('category', $event.target.value)"
              required 
              class="form-input form-select"
            >
              <option value="">Seleccionar categoría</option>
              <option v-for="category in availableCategories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <button 
              v-if="productForm.category && canDeleteCategory(productForm.category)"
              type="button" 
              @click="handleDeleteCategory(productForm.category)" 
              class="btn btn-sm btn-error category-delete-inline"
              :title="'Eliminar categoría ' + productForm.category"
            >
              <font-awesome-icon icon="trash" class="action-icon" />
            </button>
          </div>
          
          <div class="new-category-input">
            <label class="form-label new-category-label">Crear nueva categoría</label>
            <div class="new-category-controls">
              <input 
                :value="newCategoryName" 
                @input="$emit('update:newCategoryName', $event.target.value)"
                type="text" 
                placeholder="Nombre de la nueva categoría"
                class="form-input"
                @keyup.enter="handleAddCategory"
              />
              <button 
                type="button" 
                @click="handleAddCategory" 
                class="btn btn-sm btn-primary"
                :disabled="!newCategoryName.trim()"
              >
                <font-awesome-icon icon="plus" class="btn-icon" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Imagen del Producto *</label>
        <div class="image-upload-container">
          <input 
            ref="fileInputRef"
            type="file" 
            @change="handleImageUpload" 
            accept="image/*"
            class="file-input"
            :id="uniqueId"
          />
          <label :for="uniqueId" @click="handleLabelClick" class="file-input-label">
            <font-awesome-icon icon="camera" class="upload-icon" />
            <span class="upload-text">
              {{ selectedImage ? selectedImage.name : 'Seleccionar imagen' }}
            </span>
          </label>
          
          <div v-if="selectedImage" class="image-preview">
            <img :src="imagePreviewUrl" alt="Preview" class="preview-image" />
            <button 
              type="button" 
              @click="removeImage" 
              class="remove-image-btn"
            >
              <font-awesome-icon icon="times" class="remove-icon" />
            </button>
          </div>
          
          <div v-if="productForm.image && !selectedImage" class="current-image">
            <img :src="productForm.image" alt="Current" class="preview-image" />
            <span class="current-image-label">Imagen actual</span>
          </div>
        </div>
        <small class="form-help">Selecciona una imagen para el producto (JPG, PNG, GIF)</small>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input 
            :checked="productForm.isFeatured" 
            @change="updateField('isFeatured', $event.target.checked)"
            type="checkbox" 
            class="form-checkbox"
          />
          <span>Producto Destacado</span>
        </label>
        <small class="form-help">Los productos destacados aparecerán en la página de inicio</small>
      </div>
    </form>

    <template #footer>
      <button type="button" @click="handleClose" class="btn btn-secondary">
        Cancelar
      </button>
      <button type="button" @click="handleSubmit" :disabled="submitting" class="btn btn-primary">
        {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Producto') }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import Modal from '../Modal.vue'

const uniqueId = ref(`product-image-${Math.random().toString(36).substr(2, 9)}`)

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  productForm: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  availableCategories: {
    type: Array,
    default: () => []
  },
  newCategoryName: {
    type: String,
    default: ''
  },
  products: {
    type: Array,
    default: () => []
  },
  submitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'close', 'submit', 'add-category', 'delete-category', 'update:newCategoryName', 'update:productForm'])

const selectedImage = ref(null)
const imagePreviewUrl = ref('')
const fileInputRef = ref(null)

const updateField = (field, value) => {
  emit('update:productForm', {
    ...props.productForm,
    [field]: value
  })
}

const handleLabelClick = (event) => {
  event.preventDefault()
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
    updateField('image', '')
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreviewUrl.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const handleAddCategory = () => {
  if (props.newCategoryName.trim()) {
    emit('add-category', props.newCategoryName.trim())
  }
}

const handleDeleteCategory = (categoryName) => {
  if (canDeleteCategory(categoryName)) {
    emit('delete-category', categoryName)
  }
}

const canDeleteCategory = (categoryName) => {
  return props.products.filter(p => 
    p.category === categoryName && 
    p.is_active !== false && 
    p.is_active !== null
  ).length === 0
}

const handleSubmit = () => {
  emit('submit', {
    ...props.productForm,
    selectedImage: selectedImage.value
  })
}

const handleClose = () => {
  selectedImage.value = null
  imagePreviewUrl.value = ''
  emit('close')
}

// Reset image preview when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    selectedImage.value = null
    imagePreviewUrl.value = ''
  }
})
</script>

<style scoped>
.product-form {
  padding: 0;
}

.form-row {
  display: flex;
  gap: var(--spacing-lg);
}

.form-row .form-group {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.checkbox-label span {
  user-select: none;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-tertiary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.category-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.category-select-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.category-select-row .form-select {
  flex: 1;
}

.category-delete-inline {
  flex-shrink: 0;
}

.new-category-input {
  padding: var(--spacing-lg);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-lg);
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.new-category-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.new-category-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.new-category-controls input {
  flex: 1;
  margin: 0;
}

.new-category-controls .btn {
  margin: 0;
  white-space: nowrap;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.file-input {
  display: none;
}

.file-input-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border: var(--border-width-medium) dashed var(--color-gray-300);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  background: var(--color-gray-100);
}

.file-input-label:hover {
  border-color: var(--color-tertiary);
  background: #e3f2fd;
}

.upload-icon {
  font-size: var(--font-size-xl);
  color: var(--color-tertiary);
  transition: all var(--transition-normal);
}

.file-input-label:hover .upload-icon {
  transform: scale(1.1);
}

.upload-text {
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

.image-preview,
.current-image {
  position: relative;
  display: inline-block;
  max-width: 200px;
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-full);
  background: var(--color-error);
  color: var(--color-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  transition: all var(--transition-normal);
}

.remove-image-btn:hover {
  background: #c82333;
}

.remove-icon {
  font-size: var(--font-size-xs);
}

.current-image-label {
  position: absolute;
  bottom: var(--spacing-sm);
  left: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-xs);
}

.action-icon {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .category-select-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .category-delete-inline {
    width: 100%;
  }
  
  .new-category-controls {
    flex-direction: column;
  }
  
  .new-category-controls .btn {
    width: 100%;
  }
}
</style>

