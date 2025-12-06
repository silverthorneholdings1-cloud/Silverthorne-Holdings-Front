<template>
  <div class="offers">
    <div class="container">
      <div class="offers-header">
        <h1><font-awesome-icon icon="tag" class="offers-header-icon" /> Ofertas Especiales</h1>
        <p>Aprovecha nuestras increíbles ofertas por tiempo limitado</p>
      </div>

      <div class="results-info">
        <p v-if="!loading">Mostrando {{ products.length }} productos en oferta</p>
        <p v-else>Cargando ofertas...</p>
      </div>

      <div v-if="loading" class="loading-state">
        <font-awesome-icon icon="spinner" class="loading-spinner" spin />
        <p>Cargando ofertas desde el servidor...</p>
      </div>

      <div v-else-if="products.length === 0" class="empty-state">
        <font-awesome-icon icon="tag" class="empty-icon" />
        <h3>No hay ofertas disponibles</h3>
        <p>No hay productos en oferta en este momento. ¡Vuelve pronto para ver nuestras ofertas especiales!</p>
        <router-link to="/shop" class="btn btn-primary">
          <font-awesome-icon icon="store" class="btn-icon" />
          Ver Tienda Completa
        </router-link>
      </div>

      <div v-else class="products-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product"
          @view-product="viewProduct"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()

// Referencias reactivas
const products = ref([])
const loading = ref(false)

// Cargar productos en oferta desde el backend
const loadProducts = async () => {
  loading.value = true
  try {
    const response = await productService.getOnSaleProducts({ limit: 100, page: 1 })
    
    // Response from service is: { success: true, data: { products: [...], pagination: {...} } }
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
        sale_price: product.sale_price,
        discount_percentage: product.discount_percentage,
        is_featured: product.is_featured,
        is_on_sale: product.is_on_sale,
        sale_start_date: product.sale_start_date,
        sale_end_date: product.sale_end_date,
        image: product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        description: product.description,
        category: product.category,
        stock: product.stock
      }))
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('[Offers] Error loading products on sale:', error);
    products.value = []
  } finally {
    loading.value = false
  }
}

// Methods
const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

onMounted(async () => {
  await loadProducts()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.offers {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.offers-header {
  text-align: center;
  margin-bottom: 3rem;
}

.offers-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.offers-header-icon {
  color: #dc3545;
  font-size: 0.9em;
  transition: all var(--transition-normal);
}

.offers-header h1:hover .offers-header-icon {
  transform: scale(1.1) rotate(-10deg);
}

.offers-header p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.results-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #dc3545;
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
  color: #dc3545;
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
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  align-items: start;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-primary {
  background: #dc3545;
  color: white;
}

.btn-primary:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-icon {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .offers {
    padding-top: 100px;
  }
  
  .offers-header h1 {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>

