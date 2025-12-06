<template>
  <div class="home">
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1><font-awesome-icon icon="shopping-cart" class="hero-icon" /> Bienvenido a Silverthorne Holdings</h1>
          <p>Servicios informáticos profesionales e insumos de tecnología de calidad</p>
          <router-link to="/shop" class="btn btn-primary">
            Explorar Tienda
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">¿Por qué elegir Silverthorne Holdings?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <font-awesome-icon icon="truck" class="feature-icon" />
            <h3>Envío Rápido</h3>
            <p>Envío gratuito en compras mayores a $500. Entrega en 24-48 horas de insumos informáticos.</p>
          </div>
          <div class="feature-card">
            <font-awesome-icon icon="shield-alt" class="feature-icon" />
            <h3>Servicios Profesionales</h3>
            <p>Soluciones informáticas confiables con soporte técnico especializado y múltiples métodos de pago seguros.</p>
          </div>
          <div class="feature-card">
            <font-awesome-icon icon="star" class="feature-icon" />
            <h3>Calidad Garantizada</h3>
            <p>Insumos originales con garantía oficial y servicios informáticos de alta calidad.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Productos Destacados</h2>
          <router-link to="/shop" class="view-all-link">
            Ver todos <font-awesome-icon icon="chevron-down" class="arrow-icon" />
          </router-link>
        </div>
        
        <div class="products-grid">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product.id" 
            :product="product"
            @view-product="viewProduct"
          />
        </div>
      </div>
    </section>

    <section class="newsletter">
      <div class="container">
        <div class="newsletter-content">
          <h2>Mantente al día con nuestras ofertas</h2>
          <p>Si quieres recibir ofertas exclusivas, debes crear una cuenta</p>
          <div class="newsletter-actions">
            <button class="btn btn-primary" @click="openRegisterModal">
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../services/api'
import ProductCard from '../components/ProductCard.vue'

const router = useRouter()

// Referencias reactivas para productos
const products = ref([])
const loading = ref(false)

// Cargar productos destacados desde el backend
const loadProducts = async () => {
  loading.value = true
  try {
    // Request featured products for home page
    const response = await productService.getFeaturedProducts({ limit: 4, page: 1 })
    
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
      // Si no hay productos destacados, cargar productos regulares como fallback
      console.warn('[Home] No featured products found, loading regular products as fallback')
      const fallbackResponse = await productService.getAllProducts({ limit: 4, page: 1 })
      if (fallbackResponse?.success) {
        let fallbackArray = []
        if (fallbackResponse.data?.products && Array.isArray(fallbackResponse.data.products)) {
          fallbackArray = fallbackResponse.data.products
        } else if (Array.isArray(fallbackResponse.data)) {
          fallbackArray = fallbackResponse.data
        }
        if (fallbackArray.length > 0) {
          products.value = fallbackArray.map(product => ({
            id: product._id || product.id,
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
        }
      }
    }
  } catch (error) {
    console.error('[Home] Error loading featured products:', error);
    products.value = []
  } finally {
    loading.value = false
  }
}

// Use featured products directly
const featuredProducts = computed(() => {
  return products.value
})

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const openRegisterModal = (event) => {
  event.preventDefault()
  // Emit custom event that App.vue can listen to
  window.dispatchEvent(new CustomEvent('open-register-modal'))
}

// Cargar productos al montar el componente
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--color-tertiary) 0%, var(--color-quaternary) 100%);
  color: var(--color-white);
  padding: var(--spacing-6xl) 0 var(--spacing-5xl);
  text-align: center;
  margin-top: var(--header-height);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-lg) 0;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hero-icon {
  color: var(--icon-home-hero);
  font-size: 1.1em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all var(--transition-normal);
}

.hero-content h1:hover .hero-icon {
  transform: scale(1.1);
}

.hero-content p {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-normal);
  margin: 0 0 var(--spacing-3xl) 0;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

/* Features Section */
.features {
  padding: var(--spacing-6xl) 0;
  background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-primary-light) 100%);
}

.section-title {
  text-align: center;
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-5xl) 0;
  color: var(--color-tertiary);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius-full);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-3xl);
}

.feature-card {
  background: var(--color-white);
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: var(--border-width-thin) solid var(--color-gray-200);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  transform: translateX(-100%);
  transition: transform var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-var(--spacing-sm));
  box-shadow: var(--shadow-lg);
}

.feature-card:hover::before {
  transform: translateX(0);
}

.feature-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-lg);
  color: var(--icon-home-feature);
  transition: all var(--transition-normal);
  display: block;
}

.feature-card:hover .feature-icon {
  color: var(--icon-home-feature-hover);
  transform: scale(1.1);
}

.feature-card h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-tertiary);
}

.feature-card p {
  color: var(--color-gray-600);
  line-height: var(--line-height-relaxed);
  margin: 0;
  font-size: var(--font-size-base);
}

/* Featured Products Section */
.featured-products {
  padding: var(--spacing-6xl) 0;
  background: var(--color-white);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5xl);
}

.view-all-link {
  color: var(--color-tertiary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  transition: all var(--transition-normal);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-link:hover {
  color: var(--color-white);
  background: var(--color-tertiary);
  border-color: var(--color-tertiary);
  transform: translateX(var(--spacing-xs));
}

.arrow-icon {
  color: var(--icon-home-arrow);
  font-size: 0.8em;
  transition: all var(--transition-normal);
  transform: rotate(-90deg);
}

.view-all-link:hover .arrow-icon {
  color: var(--icon-home-arrow-hover);
  transform: rotate(-90deg) translateX(2px);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-3xl);
  align-items: start;
}

/* Responsive: 3 columns on large screens */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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

/* Newsletter Section */
.newsletter {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-tertiary) 100%);
  padding: var(--spacing-6xl) 0;
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.newsletter::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(45deg);
}

.newsletter-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.newsletter-content h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-lg) 0;
}

.newsletter-content p {
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-3xl) 0;
  opacity: 0.95;
  line-height: var(--line-height-relaxed);
}

.newsletter-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-3xl);
}

.newsletter .btn-primary {
  background: var(--color-primary);
  color: var(--color-quaternary);
  border-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  min-width: 140px;
}

.newsletter .btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: var(--spacing-5xl) 0 var(--spacing-4xl);
  }
  
  .hero-content h1 {
    font-size: var(--font-size-3xl);
  }
  
  .hero-content p {
    font-size: var(--font-size-lg);
  }
  
  .section-title {
    font-size: var(--font-size-2xl);
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .features,
  .featured-products,
  .newsletter {
    padding: var(--spacing-5xl) 0;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: var(--font-size-2xl);
  }
  
  .feature-card {
    padding: var(--spacing-xl);
  }
  
  .newsletter-content h2 {
    font-size: var(--font-size-2xl);
  }
}
</style> 