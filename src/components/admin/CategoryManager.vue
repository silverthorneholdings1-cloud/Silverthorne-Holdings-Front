<template>
  <Modal
    :show="show"
    title="Gestión de Categorías"
    icon="tag"
    max-width="lg"
    @update:show="$emit('update:show', $event)"
    @close="$emit('close')"
  >
    <div class="category-manager-content">
      <!-- Add New Category -->
      <div class="category-add-section">
        <label class="form-label">Agregar Nueva Categoría</label>
        <div class="category-add-input">
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
            class="btn btn-primary"
            :disabled="!newCategoryName.trim()"
          >
            <font-awesome-icon icon="plus" class="btn-icon" />
            Agregar
          </button>
        </div>
      </div>

      <!-- Categories List -->
      <div class="categories-list">
        <label class="form-label">Categorías Existentes</label>
        <div v-if="availableCategories.length === 0" class="no-categories">
          <p>No hay categorías disponibles</p>
        </div>
        <div v-else class="categories-grid">
          <div 
            v-for="category in availableCategories" 
            :key="category" 
            class="category-item"
            :class="{ 'category-has-products': getCategoryProductCount(category) > 0 }"
          >
            <div class="category-info">
              <span class="category-name">{{ category }}</span>
              <span 
                v-if="getCategoryProductCount(category) > 0" 
                class="category-badge-count"
                :title="`${getCategoryProductCount(category)} producto(s) activo(s) en esta categoría`"
              >
                <font-awesome-icon icon="box" class="count-icon" />
                {{ getCategoryProductCount(category) }}
              </span>
              <span v-else class="category-empty">Sin productos</span>
            </div>
            <button 
              @click="handleDeleteCategory(category)" 
              class="btn btn-sm btn-error category-delete-btn"
              :disabled="!canDeleteCategory(category)"
              :title="canDeleteCategory(category) ? 'Eliminar categoría' : 'No se puede eliminar: hay productos activos vinculados'"
            >
              <font-awesome-icon icon="trash" class="action-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" @click="$emit('close')" class="btn btn-secondary">
        Cerrar
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '../Modal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  availableCategories: {
    type: Array,
    default: () => []
  },
  products: {
    type: Array,
    default: () => []
  },
  newCategoryName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show', 'close', 'add-category', 'delete-category', 'update:newCategoryName'])

const getCategoryProductCount = (categoryName) => {
  return props.products.filter(p => 
    p.category === categoryName && 
    p.is_active !== false && 
    p.is_active !== null
  ).length
}

const canDeleteCategory = (categoryName) => {
  return getCategoryProductCount(categoryName) === 0
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
</script>

<style scoped>
.category-manager-content {
  padding: 0;
}

.category-add-section {
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-2xl);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
}

.category-add-input {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  margin-top: var(--spacing-md);
}

.category-add-input .form-input {
  flex: 1;
}

.categories-list {
  margin-top: var(--spacing-2xl);
}

.no-categories {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-gray-500);
}

.categories-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--color-gray-100);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-normal);
}

.category-item:hover {
  background: var(--color-gray-200);
  border-color: var(--color-gray-300);
}

.category-item.category-has-products {
  background: #e7f3ff;
  border-color: #b3d9ff;
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.category-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
}

.category-badge-count {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--color-tertiary);
  color: var(--color-white);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.count-icon {
  font-size: var(--font-size-xs);
}

.category-empty {
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.category-delete-btn {
  opacity: 1;
  transition: all var(--transition-normal);
}

.category-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-delete-btn:disabled:hover {
  background: var(--color-error);
  transform: none;
}

.action-icon {
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .category-add-input {
    flex-direction: column;
  }
  
  .category-add-input .btn {
    width: 100%;
  }
  
  .category-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .category-delete-btn {
    width: 100%;
  }
}
</style>

