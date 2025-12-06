<template>
  <div class="products-table">
    <div class="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th class="sortable" @click="$emit('sort', 'name')">
              <div class="sortable-header">
                <span>Nombre</span>
                <div class="sort-icons">
                  <font-awesome-icon 
                    icon="sort-up" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'name' && sortOrder === 'asc' }"
                  />
                  <font-awesome-icon 
                    icon="sort-down" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'name' && sortOrder === 'desc' }"
                  />
                </div>
              </div>
            </th>
            <th>Categoría</th>
            <th class="sortable" @click="$emit('sort', 'price')">
              <div class="sortable-header">
                <span>Precio</span>
                <div class="sort-icons">
                  <font-awesome-icon 
                    icon="sort-up" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'price' && sortOrder === 'asc' }"
                  />
                  <font-awesome-icon 
                    icon="sort-down" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'price' && sortOrder === 'desc' }"
                  />
                </div>
              </div>
            </th>
            <th class="sortable" @click="$emit('sort', 'offer')">
              <div class="sortable-header">
                <span>Oferta</span>
                <div class="sort-icons">
                  <font-awesome-icon 
                    icon="sort-up" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'offer' && sortOrder === 'asc' }"
                  />
                  <font-awesome-icon 
                    icon="sort-down" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'offer' && sortOrder === 'desc' }"
                  />
                </div>
              </div>
            </th>
            <th class="sortable" @click="$emit('sort', 'stock')">
              <div class="sortable-header">
                <span>Stock</span>
                <div class="sort-icons">
                  <font-awesome-icon 
                    icon="sort-up" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'stock' && sortOrder === 'asc' }"
                  />
                  <font-awesome-icon 
                    icon="sort-down" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'stock' && sortOrder === 'desc' }"
                  />
                </div>
              </div>
            </th>
            <th class="sortable" @click="$emit('sort', 'featured')">
              <div class="sortable-header">
                <span>Destacado</span>
                <div class="sort-icons">
                  <font-awesome-icon 
                    icon="sort-up" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'featured' && sortOrder === 'asc' }"
                  />
                  <font-awesome-icon 
                    icon="sort-down" 
                    class="sort-icon"
                    :class="{ 'sort-active': sortColumn === 'featured' && sortOrder === 'desc' }"
                  />
                </div>
              </div>
            </th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <ProductTableRow
            v-for="product in products"
            :key="product._id || product.id"
            :product="product"
            :isProductOnSale="isProductOnSale"
            :getFinalPrice="getFinalPrice"
            :formatCLP="formatCLP"
            :roundDiscount="roundDiscount"
            @update-stock="(productId, stock) => $emit('update-stock', productId, stock)"
            @toggle-featured="(productId, currentState) => $emit('toggle-featured', productId, currentState)"
            @open-sale="$emit('open-sale', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @reactivate="$emit('reactivate', $event)"
          />
        </tbody>
      </table>
    </div>
    
    <div v-if="products.length === 0" class="no-products">
      <div class="empty-state">
        <div class="empty-icon">
          <font-awesome-icon icon="box" class="empty-icon-svg" />
        </div>
        <h3>No hay productos</h3>
        <p>Comienza agregando tu primer producto</p>
        <button @click="$emit('create-product')" class="btn btn-primary">
          <font-awesome-icon icon="plus" class="btn-icon" />
          Crear Primer Producto
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductTableRow from './ProductTableRow.vue'

defineProps({
  products: {
    type: Array,
    default: () => []
  },
  isProductOnSale: {
    type: Function,
    required: true
  },
  getFinalPrice: {
    type: Function,
    required: true
  },
  formatCLP: {
    type: Function,
    required: true
  },
  roundDiscount: {
    type: Function,
    required: true
  },
  sortColumn: {
    type: String,
    default: null
  },
  sortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  }
})

defineEmits(['update-stock', 'toggle-featured', 'open-sale', 'edit', 'delete', 'reactivate', 'create-product', 'sort'])
</script>

<style scoped>
.products-table {
  background: var(--color-white);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: var(--spacing-2xl) var(--spacing-xl);
  text-align: center;
  vertical-align: middle;
}

th {
  background: var(--color-gray-100);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: var(--spacing-2xl) var(--spacing-xl);
  border-bottom: 2px solid #dee2e6;
}

tbody tr {
  border-bottom: 2px solid #dee2e6;
}

tbody tr:last-child {
  border-bottom: none;
}

td {
  border-bottom: 1px solid #e9ecef;
}

tbody tr:not(:last-child) td {
  border-bottom: 2px solid #dee2e6 !important;
}

tbody tr:last-child td {
  border-bottom: none !important;
}

/* Imagen - centrada */
th:first-child,
td:first-child {
  text-align: center;
}

/* Nombre - izquierda */
th:nth-child(2),
td:nth-child(2) {
  text-align: left;
}

/* Categoría - centrada */
th:nth-child(3),
td:nth-child(3) {
  text-align: center;
}

/* Precio - centrada */
th:nth-child(4),
td:nth-child(4) {
  text-align: center;
}

/* Oferta - centrada */
th:nth-child(5),
td:nth-child(5) {
  text-align: center;
}

/* Stock - centrada */
th:nth-child(6),
td:nth-child(6) {
  text-align: center;
}

/* Destacado - centrada */
th:nth-child(7),
td:nth-child(7) {
  text-align: center;
}

/* Estado - centrada */
th:nth-child(8),
td:nth-child(8) {
  text-align: center;
}

/* Acciones - centrada */
th:nth-child(9),
td:nth-child(9) {
  text-align: center;
}

tbody tr {
  transition: background-color var(--transition-fast);
}

tbody tr:hover {
  background-color: var(--color-gray-50);
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast);
}

.sortable:hover {
  background-color: var(--color-gray-200);
}

.sortable-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  position: relative;
}

.sort-icons {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-left: var(--spacing-xs);
  height: 20px;
  justify-content: center;
}

.sort-icon {
  font-size: 10px;
  color: var(--color-gray-400);
  transition: all var(--transition-fast);
  opacity: 0.4;
  line-height: 1;
}

.sort-icon.sort-active {
  color: var(--color-tertiary);
  opacity: 1;
  font-size: 11px;
}

.sortable:hover .sort-icon {
  opacity: 0.6;
}

.sortable:hover .sort-icon.sort-active {
  opacity: 1;
}

.no-products {
  padding: var(--spacing-6xl);
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-svg {
  font-size: 1em;
  color: var(--color-gray-400);
  transition: all var(--transition-normal);
}

.empty-state:hover .empty-icon-svg {
  transform: scale(1.1) rotate(10deg);
}

.empty-state h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-gray-700);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.empty-state p {
  margin: 0 0 var(--spacing-2xl) 0;
  color: var(--color-gray-500);
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  th, td {
    padding: var(--spacing-lg) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}
</style>

