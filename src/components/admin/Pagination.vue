<template>
  <div v-if="totalPages > 1" class="pagination">
    <div class="pagination-info">
      <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalItems }} {{ itemLabel }}</span>
      <select v-model="localItemsPerPage" @change="handleItemsPerPageChange" class="items-per-page-select">
        <option :value="10">10 por página</option>
        <option :value="20">20 por página</option>
        <option :value="50">50 por página</option>
        <option :value="100">100 por página</option>
      </select>
    </div>
    
    <div class="pagination-controls">
      <button 
        @click="goToPage(1)" 
        :disabled="currentPage === 1"
        class="btn btn-outline btn-sm"
        title="Primera página"
      >
        <font-awesome-icon icon="angle-double-left" />
      </button>
      <button 
        @click="goToPage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="btn btn-outline btn-sm"
        title="Página anterior"
      >
        <font-awesome-icon icon="chevron-left" />
        Anterior
      </button>
      
      <div class="page-numbers">
        <template v-for="page in visiblePages" :key="page">
          <button 
            v-if="page !== '...'"
            @click="goToPage(page)"
            :class="['btn', 'btn-sm', page === currentPage ? 'btn-primary' : 'btn-outline']"
          >
            {{ page }}
          </button>
          <span v-else class="ellipsis">...</span>
        </template>
      </div>
      
      <button 
        @click="goToPage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="btn btn-outline btn-sm"
        title="Página siguiente"
      >
        Siguiente
        <font-awesome-icon icon="chevron-right" />
      </button>
      <button 
        @click="goToPage(totalPages)" 
        :disabled="currentPage === totalPages"
        class="btn btn-outline btn-sm"
        title="Última página"
      >
        <font-awesome-icon icon="angle-double-right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  itemLabel: {
    type: String,
    default: 'elementos'
  }
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage', 'page-change', 'items-per-page-change'])

const localItemsPerPage = ref(props.itemsPerPage)

watch(() => props.itemsPerPage, (newVal) => {
  localItemsPerPage.value = newVal
})

const startItem = computed(() => {
  return ((props.currentPage - 1) * props.itemsPerPage) + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return end > props.totalItems ? props.totalItems : end
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  if (props.totalPages <= maxVisible) {
    // Show all pages if total pages is less than max visible
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (props.currentPage > 3) {
      pages.push('...')
    }
    
    // Show pages around current page
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (props.currentPage < props.totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(props.totalPages)
  }
  
  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

const handleItemsPerPageChange = () => {
  emit('update:itemsPerPage', localItemsPerPage.value)
  emit('items-per-page-change', localItemsPerPage.value)
  // Reset to first page when changing items per page (only if not already on page 1)
  if (props.currentPage !== 1) {
    emit('update:currentPage', 1)
    emit('page-change', 1)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  border-radius: 0 0 12px 12px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.items-per-page-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.items-per-page-select:hover {
  border-color: #9ca3af;
}

.items-per-page-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn {
  padding: 0.5rem 0.875rem;
  border: 1.5px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 36px;
}

.btn-sm {
  padding: 0.4375rem 0.75rem;
  font-size: 0.8125rem;
  min-height: 32px;
}

.btn-outline {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.ellipsis {
  padding: 0 0.5rem;
  color: #9ca3af;
  font-weight: 500;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  
  .pagination-info {
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
  }
  
  .pagination-controls {
    justify-content: center;
    width: 100%;
  }
  
  .page-numbers {
    display: none; /* Hide page numbers on mobile for simplicity */
  }
  
  .btn {
    min-height: 32px;
  }
}
</style>

