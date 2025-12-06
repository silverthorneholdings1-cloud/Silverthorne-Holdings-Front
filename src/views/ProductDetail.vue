<template>

<!-- TODO: cambiar logica para bajar a 0 productos en el carrito, el usuario no puede eliminar el producto del carrito en esta vista -->

  <div class="product-detail">
    <div class="container">
      <div v-if="loading" class="loading-state">
        <font-awesome-icon icon="spinner" spin class="loading-spinner" />
        <h2>Cargando producto...</h2>
      </div>

      <div v-else-if="!product" class="not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no existe o no está disponible.</p>
        <router-link to="/shop" class="btn btn-primary">
          <font-awesome-icon icon="arrow-left" class="btn-icon" />
          Volver a la tienda
        </router-link>
      </div>

      <div v-else class="product-content">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.image" :alt="product.name" />
            <div class="product-badges" v-if="isOnSale">
              <span class="badge badge-sale">
                <font-awesome-icon icon="tag" class="badge-icon" />
                {{ discountPercentage }}% OFF
              </span>
            </div>
          </div>
        </div>

        <div class="product-info">
          <nav class="breadcrumb">
            <router-link to="/">Inicio</router-link> /
            <router-link to="/shop">Tienda</router-link> /
            <span>{{ product.name }}</span>
          </nav>

          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price">
            <span v-if="isOnSale" class="price-original">${{ formatCLP(product.price) }}</span>
            <span :class="{ 'price-sale': isOnSale, 'price-normal': !isOnSale }">
              ${{ formatCLP(displayPrice) }}
            </span>
          </div>

          <div class="product-description">
            <h3>Descripción</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">Categoría:</span>
              <span class="meta-value">{{ product.category }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Stock disponible:</span>
              <span class="meta-value" :class="{ 'low-stock': product.stock <= 10, 'out-of-stock': product.stock === 0 }">
                {{ product.stock > 0 ? `${product.stock} unidades` : 'Sin stock' }}
              </span>
            </div>
          </div>

          <div class="product-actions">
            <div class="quantity-selector">
              <label>Cantidad:</label>
              <div class="quantity-input">
                <button 
                  class="qty-btn" 
                  @click="decreaseQuantity" 
                  :disabled="quantity <= 1"
                >
                  <font-awesome-icon icon="minus" class="qty-icon" />
                </button>
                <input 
                  type="number" 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  class="qty-input"
                />
                <button 
                  class="qty-btn" 
                  @click="increaseQuantity" 
                  :disabled="quantity >= product.stock"
                >
                  <font-awesome-icon icon="plus" class="qty-icon" />
                </button>
              </div>
            </div>

            <button 
              class="btn btn-primary add-to-cart"
              @click="addToCart"
              :disabled="product.stock === 0"
            >
              <font-awesome-icon icon="shopping-cart" class="btn-icon" />
              {{ product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito' }}
            </button>

            <button class="btn btn-outline" @click="goBack">
              <font-awesome-icon icon="arrow-left" class="btn-icon" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="related-products">
        <h2>Productos Relacionados</h2>
        <div class="products-grid">
          <ProductCard 
            v-for="relatedProduct in relatedProducts" 
            :key="relatedProduct.id" 
            :product="relatedProduct"
            @view-product="viewProduct"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../services/api'
import { useCartStore } from '../stores/cart.js'
import ProductCard from '../components/ProductCard.vue'
import { useNotifications } from '../composables/useNotifications'
import { formatCLP } from '../utils/formatters.js'

const route = useRoute()
const router = useRouter()
const { success } = useNotifications()
const cartStore = useCartStore()

const quantity = ref(1)
const product = ref(null)
const loading = ref(false)
const allProducts = ref([])

// Check if product is currently on sale (within date range)
const isOnSale = computed(() => {
  if (!product.value || !product.value.is_on_sale || !product.value.discount_percentage) {
    return false
  }
  
  const now = new Date()
  const startDate = product.value.sale_start_date ? new Date(product.value.sale_start_date) : null
  const endDate = product.value.sale_end_date ? new Date(product.value.sale_end_date) : null
  
  if (!startDate || !endDate) {
    return false
  }
  
  return now >= startDate && now <= endDate
})

// Calculate discount percentage
const discountPercentage = computed(() => {
  if (!isOnSale.value || !product.value.discount_percentage) {
    return 0
  }
  return Math.round(product.value.discount_percentage)
})

// Calculate display price (sale price if on sale, otherwise regular price)
const displayPrice = computed(() => {
  if (isOnSale.value && product.value.discount_percentage) {
    return product.value.price * (1 - product.value.discount_percentage / 100)
  }
  return product.value.price
})

// Cargar producto específico por ID
const loadProduct = async (productId) => {
  loading.value = true
  try {
    const response = await productService.getProductById(productId)
    
    if (response.success && response.data) {
      // Manejar tanto _id como id del backend
      const productId = response.data._id || response.data.id;
      
      product.value = {
        id: productId,
        name: response.data.name,
        price: response.data.price,
        image: response.data.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        description: response.data.description,
        category: response.data.category,
        stock: response.data.stock,
        is_on_sale: response.data.is_on_sale || false,
        discount_percentage: response.data.discount_percentage || null,
        sale_start_date: response.data.sale_start_date || null,
        sale_end_date: response.data.sale_end_date || null
      }
    } else {
      product.value = null
    }
  } catch (error) {
    product.value = null
  } finally {
    loading.value = false
  }
}

// Cargar todos los productos para mostrar relacionados
const loadAllProducts = async () => {
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
    
    if (productsArray.length > 0) {
      allProducts.value = productsArray.map(p => ({
        id: p._id || p.id, // Manejar tanto _id como id
        name: p.name,
        price: p.price,
        image: p.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        description: p.description,
        category: p.category,
        stock: p.stock
      }))
    }
  } catch (error) {
    console.error('[ProductDetail] Error loading all products:', error);
    allProducts.value = []
  }
}

// Get related products (same category, excluding current product)
const relatedProducts = computed(() => {
  if (!product.value) return []
  
  return allProducts.value
    .filter(p => p.category === product.value.category && p.id !== product.value.id)
    .slice(0, 4)
})

// Methods
const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (product.value && product.value.stock > 0) {
    for (let i = 0; i < quantity.value; i++) {
      await cartStore.addToCart(product.value)
    }
    success(`¡${quantity.value} ${product.value.name} agregado${quantity.value > 1 ? 's' : ''} al carrito!`)
    quantity.value = 1
  }
}

const goBack = () => {
  router.go(-1)
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// Observar cambios en la ruta para cargar el producto correcto
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadProduct(newId)
    quantity.value = 1
  }
}, { immediate: true })

onMounted(async () => {
  // Cargar el producto actual
  if (route.params.id) {
    await loadProduct(route.params.id)
  }
  
  // Cargar todos los productos para mostrar relacionados
  await loadAllProducts()
  
  // Reset quantity when component mounts
  quantity.value = 1
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-detail {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--icon-product-loading);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.not-found {
  text-align: center;
  padding: 4rem 0;
}

.not-found h2 {
  margin: 0 0 2rem 0;
  color: #333;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.product-gallery {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.main-image {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.product-badges {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.badge-sale {
  color: white;
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.95) 0%, rgba(255, 0, 0, 0.95) 100%);
}

.badge-icon {
  font-size: 0.75rem;
}

.main-image img {
  width: 100%;
  height: 500px;
  object-fit: cover;
}

.product-info {
  padding: 1rem 0;
}

.breadcrumb {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.product-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #333;
}

.product-price {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.price-normal {
  font-size: 2.5rem;
  font-weight: 700;
  color: #28a745;
}

.price-sale {
  font-size: 2.5rem;
  font-weight: 700;
  color: #dc3545;
}

.price-original {
  font-size: 1.75rem;
  font-weight: 500;
  color: #6c757d;
  text-decoration: line-through;
}

.product-description {
  margin-bottom: 2rem;
}

.product-description h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #333;
}

.product-description p {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
}

.product-meta {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-weight: 600;
  color: #333;
}

.meta-value {
  color: #666;
}

.meta-value.low-stock {
  color: #ffc107;
  font-weight: 600;
}

.meta-value.out-of-stock {
  color: #dc3545;
  font-weight: 600;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quantity-selector label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.quantity-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
}

.qty-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-icon {
  font-size: 0.875rem;
  color: var(--icon-product-plus);
  transition: all var(--transition-normal);
}

.qty-btn:hover:not(:disabled) .qty-icon {
  color: var(--icon-product-plus-hover);
  transform: scale(1.1);
}

.qty-btn[disabled] .qty-icon {
  color: var(--color-gray-400);
}

.qty-input {
  width: 80px;
  text-align: center;
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.qty-input:focus {
  outline: none;
}

.btn {
  padding: 1rem 2rem;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.btn:hover .btn-icon {
  transform: scale(1.1);
}

.btn-primary .btn-icon {
  color: var(--icon-product-cart);
}

.btn-outline .btn-icon {
  color: var(--icon-product-back);
}

.btn-outline:hover .btn-icon {
  color: var(--icon-product-back-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #666;
  border-color: #ddd;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.add-to-cart {
  font-size: 1.25rem;
  padding: 1.25rem 2rem;
}

.related-products {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid #eee;
}

.related-products h2 {
  text-align: center;
  font-size: 2rem;
  margin: 0 0 3rem 0;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-gallery {
    position: static;
  }
  
  .main-image img {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .product-title {
    font-size: 2rem;
  }
  
  .price {
    font-size: 2rem;
  }
  
  .product-actions {
    gap: 1rem;
  }
  
  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .add-to-cart {
    font-size: 1.1rem;
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }
  
  .main-image img {
    height: 300px;
  }
  
  .product-title {
    font-size: 1.75rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 