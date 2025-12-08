<template>
  <div class="checkout">
    <div class="container">
      <div class="checkout-header">
        <h1>
          <font-awesome-icon icon="credit-card" class="header-icon" />
          Finalizar Compra
        </h1>
        <p>Completa tu pedido de {{ cartItemCount }} artículos</p>
      </div>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <font-awesome-icon icon="shopping-cart" class="empty-cart-icon-svg" />
        </div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos antes de realizar una compra</p>
        <router-link to="/shop" class="btn btn-primary">
          <font-awesome-icon icon="store" class="btn-icon" />
          Ir a la Tienda
        </router-link>
      </div>

      <div v-else class="checkout-content">
        <div class="checkout-form">
          <form @submit.prevent="submitOrder">
            <!-- Shipping Information -->
            <div class="form-section">
              <h2>
                <font-awesome-icon icon="box" class="section-icon" />
                Información de Envío
              </h2>
              
                <div class="form-group">
                <label for="name">Nombre *</label>
                  <input 
                    type="text" 
                  id="name"
                  v-model="shippingForm.name" 
                    required
                  />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input 
                  type="email" 
                  id="email"
                  v-model="shippingForm.email" 
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">Teléfono *</label>
                <input 
                  type="tel" 
                  id="phone"
                  v-model="shippingForm.phone" 
                  required
                />
              </div>

              <div class="form-group">
                <label for="address">Dirección *</label>
                <input 
                  type="text" 
                  id="address"
                  v-model="shippingForm.address" 
                  placeholder="Calle, número, piso, departamento"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ciudad *</label>
                  <input 
                    type="text" 
                    id="city"
                    v-model="shippingForm.city" 
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="zipCode">Código Postal *</label>
                  <input 
                    type="text" 
                    id="zipCode"
                    v-model="shippingForm.zipCode" 
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="form-section">
              <h2>
                <font-awesome-icon icon="credit-card" class="section-icon" />
                Información de Pago
              </h2>
              
              <div class="payment-method-selection">
                <div class="payment-option selected">
                  <div class="payment-icon">
                    <font-awesome-icon icon="university" class="payment-icon-svg" />
                  </div>
                  <div class="payment-info">
                    <h3>Transbank Webpay Plus</h3>
                    <p>Pago seguro con tarjeta de crédito o débito</p>
                  </div>
                  <div class="payment-check">
                    <font-awesome-icon icon="check" class="check-icon" />
                  </div>
                </div>
              </div>

              <div class="payment-info-card">
                <div class="info-item">
                  <font-awesome-icon icon="shield-alt" class="info-icon" />
                  <span>Pago 100% seguro con Transbank</span>
                </div>
                <div class="info-item">
                  <font-awesome-icon icon="credit-card" class="info-icon" />
                  <span>Acepta todas las tarjetas principales</span>
                </div>
                <div class="info-item">
                  <font-awesome-icon icon="bolt" class="info-icon" />
                  <span>Procesamiento instantáneo</span>
                </div>
              </div>
            </div>

            <!-- Order Notes -->
            <div class="form-section">
              <h2>
                <font-awesome-icon icon="clipboard-list" class="section-icon" />
                Notas del Pedido
              </h2>
              
              <div class="form-group">
                <label for="orderNotes">Comentarios adicionales (opcional)</label>
                <textarea 
                  id="orderNotes"
                  v-model="orderNotes" 
                  rows="3"
                  placeholder="Instrucciones especiales para la entrega..."
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <router-link to="/cart" class="btn btn-outline">
                <font-awesome-icon icon="arrow-left" class="btn-icon" />
                Volver al Carrito
              </router-link>
              <button type="submit" class="btn btn-primary" :disabled="isProcessing">
                <font-awesome-icon 
                  :icon="isProcessing ? 'spinner' : 'credit-card'" 
                  :spin="isProcessing"
                  class="btn-icon" 
                />
                {{ isProcessing ? 'Procesando...' : `Pagar $${formatCLP(finalTotal)}` }}
              </button>
            </div>
          </form>
        </div>

        <div class="order-summary">
          <div class="summary-card">
            <h2>
              <font-awesome-icon icon="clipboard-list" class="summary-icon" />
              Resumen del Pedido
            </h2>
            
            <div class="order-items">
              <div v-for="item in cartItems" :key="item.id" class="order-item">
                <img :src="item.image" :alt="item.name" />
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p>Cantidad: {{ item.quantity }}</p>
                </div>
                <div class="item-price">
                  ${{ formatCLP(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="summary-totals">
              <div class="summary-line">
                <span>Subtotal:</span>
                <span>${{ formatCLP(cartTotal) }}</span>
              </div>
              
              <div class="summary-line">
                <span>Envío:</span>
                <span v-if="cartTotal >= 500" class="free-shipping">Gratis</span>
                <span v-else>${{ formatCLP(25) }}</span>
              </div>
              
              <hr class="summary-divider">
              
              <div class="summary-line total-line">
                <span>Total:</span>
                <span class="total-amount">${{ formatCLP(finalTotal) }}</span>
              </div>
            </div>

            <div class="security-info">
              <div class="security-item">
                <font-awesome-icon icon="shield-alt" class="security-icon" />
                <span>Pago 100% seguro</span>
              </div>
              <div class="security-item">
                <font-awesome-icon icon="truck" class="security-icon" />
                <span>Envío asegurado</span>
              </div>
              <div class="security-item">
                <font-awesome-icon icon="undo" class="security-icon" />
                <span>30 días de garantía</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart.js'
import { useAuthStore } from '../stores/auth.js'
import { storeToRefs } from 'pinia'
import { useNotifications } from '../composables/useNotifications'
import { formatCLP } from '../utils/formatters.js'

const router = useRouter()
const { success, error } = useNotifications()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { cartItems, cartTotal, cartItemCount } = storeToRefs(cartStore)
const { user, isAuthenticated } = storeToRefs(authStore)

// Form data
const shippingForm = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zipCode: ''
})

// Payment form removed - using Transbank instead

const orderNotes = ref('')
const isProcessing = ref(false)

// Computed properties
const shipping = computed(() => cartTotal.value >= 500 ? 0 : 25)
const finalTotal = computed(() => cartTotal.value + shipping.value)

// Methods

// Cargar datos del usuario desde la sesión
const loadUserData = () => {
  if (isAuthenticated.value && user.value) {
    if (user.value.name) {
      shippingForm.name = user.value.name
    }
    if (user.value.email) {
      shippingForm.email = user.value.email
    }
    if (user.value.telefono || user.value.phone) {
      shippingForm.phone = user.value.telefono || user.value.phone || ''
    }
  }
}

const submitOrder = async () => {
  isProcessing.value = true
  
  try {
    // Validate shipping form
    if (!shippingForm.name || !shippingForm.email || 
        !shippingForm.phone || !shippingForm.address || !shippingForm.city || !shippingForm.zipCode) {
      throw new Error('Por favor completa todos los campos obligatorios')
    }

    // Redirect to payment processing
    router.push({
      name: 'PaymentProcessing',
      query: {
        // Pass shipping data for payment initiation
        shippingData: JSON.stringify({
          name: shippingForm.name,
          email: shippingForm.email,
          phone: shippingForm.phone,
          address: shippingForm.address,
          city: shippingForm.city,
          zipCode: shippingForm.zipCode,
          orderNotes: orderNotes.value
        })
      }
    })
    
  } catch (err) {
    error(err.message || 'Error al procesar el pedido. Por favor, intenta nuevamente.')
  } finally {
    isProcessing.value = false
  }
}

// Load user data when component mounts
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.checkout {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
}

.checkout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.checkout-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--icon-checkout-header);
  font-size: 1.2em;
  transition: all var(--transition-normal);
}

.checkout-header:hover .header-icon {
  transform: scale(1.1) rotate(5deg);
}

.checkout-header p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.empty-cart {
  text-align: center;
  background: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.empty-cart-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-cart-icon-svg {
  font-size: 1em;
  color: var(--icon-checkout-empty);
  transition: all var(--transition-normal);
}

.empty-cart:hover .empty-cart-icon-svg {
  transform: scale(1.1) rotate(-10deg);
  opacity: 0.8;
}

.empty-cart h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.75rem;
}

.empty-cart p {
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 1.1rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.checkout-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2.5rem;
}

.form-section:last-of-type {
  margin-bottom: 2rem;
}

.form-section h2 {
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f8f9fa;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-icon {
  color: var(--icon-checkout-shipping);
  font-size: 1.1em;
  transition: all var(--transition-normal);
}

.form-section:nth-child(2) .section-icon {
  color: var(--icon-checkout-payment);
}

.form-section:nth-child(3) .section-icon {
  color: var(--icon-checkout-notes);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.payment-method-selection {
  margin-bottom: 1.5rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.payment-option.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.payment-icon {
  font-size: 2rem;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon-svg {
  font-size: 1em;
  color: var(--icon-checkout-bank);
  transition: all var(--transition-normal);
}

.payment-option:hover .payment-icon-svg {
  transform: scale(1.1);
}

.payment-info {
  flex: 1;
}

.payment-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.payment-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.payment-check {
  width: 24px;
  height: 24px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
}

.check-icon {
  font-size: 0.875rem;
  color: var(--icon-checkout-pay-btn);
}

.payment-info-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.info-item:nth-child(1) .info-icon {
  color: var(--icon-checkout-secure);
}

.info-item:nth-child(2) .info-icon {
  color: var(--icon-checkout-card);
}

.info-item:nth-child(3) .info-icon {
  color: var(--icon-checkout-lightning);
}

.info-item:hover .info-icon {
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.order-summary {
  position: sticky;
  top: 120px;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-icon {
  color: var(--icon-checkout-summary);
  font-size: 1.1em;
  transition: all var(--transition-normal);
}

.summary-card:hover .summary-icon {
  transform: scale(1.1) rotate(5deg);
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-info p {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.item-price {
  font-weight: 600;
  color: #28a745;
  font-size: 0.875rem;
}

.summary-totals {
  padding-top: 1rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.free-shipping {
  color: #28a745;
  font-weight: 600;
}

.summary-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 1.5rem 0;
}

.total-line {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.total-amount {
  font-size: 1.5rem;
  color: #007bff;
}

.security-info {
  padding-top: 1.5rem;
  border-top: 1px solid #f8f9fa;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #666;
}

.security-item:last-child {
  margin-bottom: 0;
}

.security-icon {
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.security-item:nth-child(1) .security-icon {
  color: var(--icon-checkout-security);
}

.security-item:nth-child(2) .security-icon {
  color: var(--icon-checkout-truck);
}

.security-item:nth-child(3) .security-icon {
  color: var(--icon-checkout-return);
}

.security-item:hover .security-icon {
  transform: scale(1.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  font-size: 0.875rem;
  transition: all var(--transition-normal);
}

.btn:hover .btn-icon {
  transform: scale(1.1);
}

.btn-outline .btn-icon {
  color: var(--icon-checkout-back);
}

.btn-outline:hover .btn-icon {
  color: var(--icon-checkout-back-hover);
}

.btn-primary .btn-icon {
  color: var(--icon-checkout-pay-btn);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
  font-size: 1.1rem;
  padding: 1rem 2rem;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-header h1 {
    font-size: 2rem;
  }
  
  .checkout-form {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }
  
  .checkout-form,
  .summary-card {
    padding: 1rem;
  }
}
</style> 