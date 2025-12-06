<template>
  <div class="shop">
    <div class="container">
      <div class="shop-header">
        <h1><font-awesome-icon icon="store" class="shop-header-icon" /> Catálogo de Insumos Informáticos</h1>
        <p>Explora nuestra colección de insumos y equipos informáticos</p>
      </div>

      <div class="shop-controls">
        <div class="filters">
          <div class="filter-group">
            <label>Categoría:</label>
            <select v-model="selectedCategory" @change="filterProducts">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Ordenar por:</label>
            <select v-model="sortBy" @change="sortProducts">
              <option value="name">Nombre</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
            </select>
          </div>
          
          <button @click="resetFilters" class="reset-btn" title="Limpiar filtros">
            <font-awesome-icon icon="times" class="reset-icon" />
            Limpiar
          </button>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="filterProducts"
            placeholder="Buscar productos..."
            class="search-input"
          >
          <font-awesome-icon icon="search" class="search-icon" />
        </div>
      </div>

      <div class="results-info">
        <p v-if="!loading">Mostrando {{ filteredProducts.length }} productos</p>
        <p v-else>Cargando productos...</p>
      </div>

      <div v-if="loading" class="loading-state">
        <font-awesome-icon icon="spinner" class="loading-spinner" spin />
        <p>Cargando productos desde el servidor...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <font-awesome-icon icon="box" class="empty-icon" />
        <h3>No hay productos disponibles</h3>
        <p>No se pudieron cargar los productos del servidor.</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="no-results">
        <font-awesome-icon icon="times-circle" class="no-results-icon" />
        <h3>No se encontraron productos</h3>
        <p>Intenta ajustar los filtros o buscar con otros términos</p>
        <button @click="resetFilters" class="btn btn-primary">
          Limpiar Filtros
        </button>
      </div>

      <div v-else class="products-grid">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id" 
          :product="product"
          @view-product="viewProduct"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()

// Referencias reactivas
const products = ref([])
const loading = ref(false)
const selectedCategory = ref('Todos')
const sortBy = ref('name')
const searchQuery = ref('')

// Categorías (se cargan dinámicamente desde el backend)
const categories = ref(['Todos'])

// Cargar productos desde el backend
const loadProducts = async () => {
  loading.value = true
  try {
    const response = await productService.getAllProducts()
    
    // Response from service is: { success: true, data: { products: [...], pagination: {...} } }
    // Handle new response format: { success: true, data: { products: [...] } }
    // Or legacy format: { success: true, data: [...] } (array directly)
    let productsArray = []
    
    if (response?.success) {
      // New format: response.data is an object with products property
      if (response.data?.products && Array.isArray(response.data.products)) {
        productsArray = response.data.products
      }
      // Legacy format: response.data is directly an array
      else if (Array.isArray(response.data)) {
        productsArray = response.data
      }
    }
    
    // Mapear la respuesta del backend al formato esperado
    if (productsArray.length > 0) {
      products.value = productsArray.map(product => ({
        id: product._id || product.id, // Manejar tanto _id como id
        name: product.name,
        price: product.price,
        image: product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        description: product.description,
        category: product.category,
        stock: product.stock,
        // Include sale information for ProductCard to display offers
        is_on_sale: product.is_on_sale || false,
        discount_percentage: product.discount_percentage || null,
        sale_start_date: product.sale_start_date || null,
        sale_end_date: product.sale_end_date || null,
        sale_price: product.sale_price || null
      }))
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('[Shop] Error loading products:', error);
    products.value = []
  } finally {
    loading.value = false
  }
}

// Cargar categorías desde el backend
const loadCategories = async () => {
  try {
    // Intentar cargar categorías desde el endpoint específico
    const response = await productService.getCategories()
    if (response.success && response.data && Array.isArray(response.data)) {
      // Agregar "Todos" al inicio y ordenar el resto
      const uniqueCategories = [...new Set(response.data.filter(Boolean))].sort()
      categories.value = ['Todos', ...uniqueCategories]
    } else {
      // Fallback: extraer categorías de productos cargados
      loadCategoriesFromProducts()
    }
  } catch (error) {
    console.error('[Shop] Error loading categories from endpoint:', error);
    // Fallback: extraer categorías de productos cargados
    loadCategoriesFromProducts()
  }
}

// Fallback: extraer categorías de productos cargados
const loadCategoriesFromProducts = () => {
  if (products.value.length > 0) {
    // Extraer categorías únicas de los productos
    const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))].sort()
    categories.value = ['Todos', ...uniqueCategories]
  }
}

// Helper function to get final price (considering offers)
const getFinalPrice = (product) => {
  if (!product) return 0
  
  // Check if product is currently on sale
  if (product.is_on_sale && product.discount_percentage) {
    const now = new Date()
    const startDate = product.sale_start_date ? new Date(product.sale_start_date) : null
    const endDate = product.sale_end_date ? new Date(product.sale_end_date) : null
    
    if (startDate && endDate && now >= startDate && now <= endDate) {
      // Product is currently on sale
      return product.price * (1 - product.discount_percentage / 100)
    }
  }
  
  // Return regular price
  return product.price
}

// Computed properties
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // Filter by category
  if (selectedCategory.value !== 'Todos') {
    result = result.filter(product => product.category === selectedCategory.value)
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }
  
  // Sort products (using final price for price sorting)
  switch (sortBy.value) {
    case 'price-low':
      result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b))
      break
    case 'price-high':
      result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a))
      break
    case 'name':
    default:
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
  }
  
  return result
})

// Methods
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const filterProducts = () => {
  // This function is called when filters change
  // The computed property will automatically update
}

const sortProducts = () => {
  // This function is called when sorting changes
  // The computed property will automatically update
}

const resetFilters = () => {
  selectedCategory.value = 'Todos'
  sortBy.value = 'name'
  searchQuery.value = ''
}

onMounted(async () => {
  // Cargar productos primero
  await loadProducts()
  
  // Cargar categorías después de cargar productos (para tener fallback)
  await loadCategories()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.shop {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
}

.shop-header {
  text-align: center;
  margin-bottom: 3rem;
}

.shop-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.shop-header-icon {
  color: var(--icon-shop-header);
  font-size: 0.9em;
  transition: all var(--transition-normal);
}

.shop-header h1:hover .shop-header-icon {
  transform: scale(1.1);
}

.shop-header p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.shop-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
  min-width: 120px;
}

.reset-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
  transform: translateY(-1px);
}

.reset-icon {
  font-size: 0.875rem;
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--icon-shop-search);
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.search-input:focus + .search-icon {
  color: var(--icon-shop-search-focus);
  transform: translateY(-50%) scale(1.1);
}

.results-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
}

.results-info p {
  margin: 0;
  color: #666;
  font-weight: 500;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--icon-shop-loading);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--icon-shop-empty);
  opacity: 0.5;
  transition: all var(--transition-normal);
}

.empty-state:hover .empty-icon {
  opacity: 0.7;
  transform: scale(1.05);
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: start;
}

/* Responsive: 2 columns on medium screens */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive: 1 column on small screens */
@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 2rem;
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--icon-shop-no-results);
  transition: all var(--transition-normal);
}

.no-results:hover .no-results-icon {
  transform: scale(1.05);
}

.no-results h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
}

.no-results p {
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 1.1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .shop {
    padding-top: 100px;
  }
  
  .shop-header h1 {
    font-size: 2rem;
  }
  
  .shop-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .filters {
    justify-content: space-between;
    gap: 1rem;
  }
  
  .filter-group {
    flex: 1;
    min-width: 100px;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .shop {
    padding-top: 90px;
    padding-bottom: 60px;
  }
  
  .container {
    padding: 0 var(--spacing-md, 1rem);
  }
  
  .shop-header {
    margin-bottom: 2rem;
  }
  
  .shop-header h1 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .shop-header p {
    font-size: 0.9rem;
  }
  
  .shop-controls {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
  
  .filter-group {
    flex: none;
    width: 100%;
  }
  
  .filter-group label {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
  
  .filter-group select {
    width: 100%;
    padding: 0.75rem;
    font-size: 0.9rem;
    min-width: auto;
    border-radius: 6px;
  }
  
  .reset-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .search-box {
    width: 100%;
    min-width: auto;
  }
  
  .search-input {
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .search-icon {
    right: 0.75rem;
    font-size: 0.9rem;
  }
  
  .results-info {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .results-info p {
    font-size: 0.875rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style> 