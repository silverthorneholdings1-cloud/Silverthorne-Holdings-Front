<template>
  <tr class="product-row">
    <td>
      <div class="product-image">
        <img :src="product.image" :alt="product.name" />
      </div>
    </td>
    <td>
      <div class="product-name">
        <h4>{{ product.name }}</h4>
        <p>{{ product.description?.substring(0, 50) }}...</p>
      </div>
    </td>
    <td>
      <span class="category-badge">{{ product.category }}</span>
    </td>
    <td>
      <span 
        class="price" 
        :class="{ 'price-on-sale': isProductOnSale(product) }"
      >
        ${{ formatCLP(getFinalPrice(product)) }}
      </span>
    </td>
    <td>
      <span 
        class="sale-badge" 
        :class="{ 'sale-active': isProductOnSale(product) }"
      >
        <font-awesome-icon icon="tag" class="badge-icon" />
        <span v-if="isProductOnSale(product)">
          {{ roundDiscount(product.discount_percentage) }}%
        </span>
        <span v-else>No</span>
      </span>
    </td>
    <td>
      <div class="stock-control">
        <input 
          :value="product.stock" 
          @change="$emit('update-stock', product._id || product.id, $event.target.value)"
          type="number" 
          min="0" 
          class="stock-input form-input"
        />
      </div>
    </td>
    <td>
      <span 
        class="featured-badge" 
        :class="{ 'featured-active': product.is_featured }"
      >
        <font-awesome-icon icon="star" class="badge-icon" />
        {{ product.is_featured ? 'Sí' : 'No' }}
      </span>
    </td>
    <td>
      <span 
        class="status-badge" 
        :class="{ 
          'status-active': product.is_active !== false && product.stock > 0, 
          'status-inactive': product.is_active === false || product.stock === 0 
        }"
      >
        {{ product.is_active === false ? 'Inactivo' : (product.stock > 0 ? 'Disponible' : 'Agotado') }}
      </span>
    </td>
    <td>
      <div class="actions">
        <!-- Para productos inactivos, solo mostrar opción de reactivar -->
        <template v-if="product.is_active === false">
          <button 
            @click="$emit('reactivate', product.id)" 
            class="btn btn-sm btn-success"
            title="Reactivar producto"
          >
            <font-awesome-icon icon="undo" class="action-icon" />
          </button>
        </template>
        <!-- Para productos activos, mostrar todas las opciones -->
        <template v-else>
          <button 
            @click="$emit('toggle-featured', product._id || product.id, product.is_featured)" 
            class="btn btn-sm"
            :class="product.is_featured ? 'btn-featured-active' : 'btn-featured'"
            :title="product.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'"
          >
            <font-awesome-icon icon="star" class="action-icon" />
          </button>
          <button 
            @click="$emit('open-sale', product)" 
            class="btn btn-sm"
            :class="isProductOnSale(product) ? 'btn-sale-active' : 'btn-sale'"
            :title="isProductOnSale(product) ? 'Editar oferta' : 'Configurar oferta'"
          >
            <font-awesome-icon icon="tag" class="action-icon" />
          </button>
          <button 
            @click="$emit('edit', product)" 
            class="btn btn-sm btn-outline" 
            title="Editar producto"
          >
            <font-awesome-icon icon="edit" class="action-icon" />
          </button>
          <button 
            @click="$emit('delete', product.id)" 
            class="btn btn-sm btn-error" 
            title="Eliminar producto"
          >
            <font-awesome-icon icon="trash" class="action-icon" />
          </button>
        </template>
      </div>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true
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
  }
})

defineEmits(['update-stock', 'toggle-featured', 'open-sale', 'edit', 'delete', 'reactivate'])
</script>

<style scoped>
.product-row {
  position: relative;
}

.product-row:not(:last-child) {
  border-bottom: 2px solid #dee2e6 !important;
}

.product-row:not(:last-child) td {
  border-bottom: 2px solid #dee2e6 !important;
}

.product-image {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.product-image img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.product-name {
  min-width: 200px;
}

.product-name h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.product-name p {
  margin: 0;
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

td:nth-child(3) {
  text-align: center;
}

.category-badge {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: inline-block;
  margin: var(--spacing-xs) 0;
}

td:nth-child(4) {
  text-align: center;
}

.price {
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  font-size: var(--font-size-base);
  display: inline-block;
  margin: var(--spacing-xs) 0;
}

.price-on-sale {
  color: var(--color-error);
}

td:nth-child(6) {
  text-align: center;
}

.stock-control {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) 0;
  width: 100%;
}

.stock-input {
  width: 100px;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  margin: 0 auto;
}

td:nth-child(8) {
  text-align: center;
}

.status-badge {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  display: inline-block;
  white-space: nowrap;
  margin: var(--spacing-xs) 0;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

td:nth-child(7) {
  text-align: center;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  transition: all var(--transition-normal);
  white-space: nowrap;
  margin: var(--spacing-xs) 0;
  justify-content: center;
}

.featured-badge .badge-icon {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.featured-active {
  background: #fff3cd;
  color: #856404;
}

.featured-active .badge-icon {
  color: #ffc107;
}

td:nth-child(5) {
  text-align: center;
}

.sale-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-xl);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  transition: all var(--transition-normal);
  white-space: nowrap;
  margin: var(--spacing-xs) 0;
  justify-content: center;
}

.sale-badge .badge-icon {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.sale-active {
  background: #f8d7da;
  color: #721c24;
}

.sale-active .badge-icon {
  color: var(--color-error);
}

td:nth-child(9) {
  text-align: center;
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  align-items: center;
  justify-items: center;
  min-width: 120px;
  max-width: 140px;
  margin: 0 auto;
}

.btn-featured {
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.btn-featured:hover {
  background: #fff3cd;
  color: #856404;
  border-color: #ffc107;
}

.btn-featured-active {
  background: #fff3cd;
  color: #856404;
  border: var(--border-width-thin) solid #ffc107;
}

.btn-featured-active:hover {
  background: #ffc107;
  color: #856404;
  border-color: #ffc107;
}

.btn-sale {
  background: var(--color-gray-200);
  color: var(--color-gray-500);
  border: var(--border-width-thin) solid var(--color-gray-300);
}

.btn-sale:hover {
  background: #f8d7da;
  color: #721c24;
  border-color: var(--color-error);
}

.btn-sale-active {
  background: #f8d7da;
  color: #721c24;
  border: var(--border-width-thin) solid var(--color-error);
}

.btn-sale-active:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.action-icon {
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
}

.btn:hover .action-icon {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .product-image img {
    width: 70px;
    height: 70px;
  }
  
  .product-name {
    min-width: 150px;
  }
  
  .actions {
    min-width: auto;
    grid-template-columns: repeat(2, 1fr);
    max-width: 100%;
  }
}
</style>

