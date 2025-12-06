<template>
  <div class="filters">
    <div class="filter-group">
      <label class="form-label">Buscar productos:</label>
      <input 
        :value="searchTerm" 
        @input="$emit('update:searchTerm', $event.target.value)"
        type="text" 
        placeholder="Buscar por nombre, categoría..." 
        class="form-input filter-input"
      />
    </div>
    <div class="filter-group">
      <label class="form-label">Categoría:</label>
      <select 
        :value="selectedCategory" 
        @change="$emit('update:selectedCategory', $event.target.value)"
        class="form-input filter-select"
      >
        <option value="">Todas las categorías</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>
    <div class="filter-group">
      <label class="form-label">Estado:</label>
      <select 
        :value="productStatusFilter" 
        @change="$emit('update:productStatusFilter', $event.target.value)"
        class="form-input filter-select"
      >
        <option value="active">Productos activos</option>
        <option value="inactive">Productos inactivos</option>
      </select>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchTerm: {
    type: String,
    default: ''
  },
  selectedCategory: {
    type: String,
    default: ''
  },
  productStatusFilter: {
    type: String,
    default: 'active'
  },
  categories: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:searchTerm', 'update:selectedCategory', 'update:productStatusFilter'])
</script>

<style scoped>
.filters {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-input,
.filter-select {
  min-width: 200px;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-input,
  .filter-select {
    min-width: auto;
  }
}
</style>

