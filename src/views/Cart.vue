<template>
  <div class="cart">
    <div class="container">
      <div class="cart-header">
        <h1>
          <font-awesome-icon icon="shopping-cart" class="header-icon" />
          Mi Carrito
        </h1>
        <p v-if="cartItems.length > 0">{{ cartItemCount }} artículos en tu carrito</p>
      </div>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-icon">
          <font-awesome-icon icon="shopping-cart" class="empty-cart-icon-svg" />
        </div>
        <h2>Tu carrito está vacío</h2>
        <p>¡Empieza a agregar productos increíbles!</p>
        <router-link to="/shop" class="btn btn-primary">
          <font-awesome-icon icon="store" class="btn-icon" />
          Ir a la Tienda
        </router-link>
      </div>

      <div v-else class="cart-content">
        <div class="cart-items">
          <div class="cart-item" v-for="item in cartItems" :key="item.id">
            <img :src="item.image" :alt="item.name" class="item-image" />
            
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-price-row">
                <span v-if="item.isOnSale && item.originalPrice" class="price-original">
                  ${{ formatCLP(item.originalPrice) }}
                </span>
                <span :class="{ 'price-sale': item.isOnSale }" class="price">
                  ${{ formatCLP(item.price) }}
                </span>
                <span v-if="item.isOnSale && item.discountPercentage" class="discount-badge">
                  -{{ item.discountPercentage }}%
                </span>
              </div>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button 
                  class="qty-btn" 
                  @click="decreaseQuantity(item.id)" 
                  :disabled="item.quantity <= 1"
                >
                  <font-awesome-icon icon="minus" />
                </button>
                <input 
                  type="number" 
                  :value="item.quantity" 
                  @change="updateItemQuantity(item.id, $event.target.value)"
                  min="1"
                  class="qty-input"
                >
                <button class="qty-btn" @click="increaseQuantity(item.id)">
                  <font-awesome-icon icon="plus" />
                </button>
              </div>
              
              <div class="item-total">
                ${{ formatCLP(item.price * item.quantity) }}
              </div>
              
              <button class="remove-btn" @click="removeFromCart(item.id)" title="Eliminar">
                <font-awesome-icon icon="trash" />
              </button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-card">
            <h3>Resumen</h3>
            
            <div class="summary-line">
              <span>{{ cartItemCount }} artículos</span>
              <span>${{ formatCLP(cartTotal) }}</span>
            </div>
            
            <div class="summary-line">
              <span>Envío</span>
              <span v-if="cartTotal >= 500" class="free-shipping">Gratis</span>
              <span v-else>${{ formatCLP(25) }}</span>
            </div>
            
            <hr>
            
            <div class="summary-line total">
              <span>Total</span>
              <span>${{ formatCLP(finalTotal) }}</span>
            </div>
            
            <div v-if="cartTotal < 500" class="shipping-notice">
              Agrega ${{ formatCLP(500 - cartTotal) }} más para envío gratis
            </div>
            
            <div class="cart-actions">
              <router-link to="/checkout" class="btn btn-primary">
                Comprar
              </router-link>
              <router-link to="/shop" class="btn btn-secondary">
                Seguir Comprando
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart.js'
import { storeToRefs } from 'pinia'
import { formatCLP } from '../utils/formatters.js'

const cartStore = useCartStore()
const { cartItems, cartTotal, cartItemCount } = storeToRefs(cartStore)

// Computed properties
const shipping = computed(() => cartTotal.value >= 500 ? 0 : 25)
const finalTotal = computed(() => cartTotal.value + shipping.value)

// Methods
const removeFromCart = async (productId) => {
  if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
    await cartStore.removeFromCart(productId)
  }
}

const increaseQuantity = async (productId) => {
  const item = cartItems.value.find(item => item.id === productId)
  if (item) {
    await cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

const decreaseQuantity = async (productId) => {
  const item = cartItems.value.find(item => item.id === productId)
  if (item && item.quantity > 1) {
    await cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

const updateItemQuantity = async (productId, newQuantity) => {
  const quantity = parseInt(newQuantity)
  if (quantity > 0) {
    await cartStore.updateQuantity(productId, quantity)
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart {
  padding: 100px 0 60px;
  min-height: 100vh;
  background: #f8f9fa;
}

.cart-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cart-header p {
  color: #666;
  margin: 0;
}

.empty-cart {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 8px;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.3;
}

.empty-cart h2 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-cart p {
  margin: 0 0 1.5rem 0;
  color: #666;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.cart-items {
  background: white;
  border-radius: 8px;
  padding: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
}

.item-info {
  min-width: 0;
}

.item-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.price {
  font-weight: 600;
  color: #28a745;
}

.price-sale {
  color: #dc3545;
}

.price-original {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
}

.discount-badge {
  background: #dc3545;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
  color: #333;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  text-align: center;
  border: none;
  padding: 0.25rem;
  font-size: 0.875rem;
  background: transparent;
  appearance: textfield;
  -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.item-total {
  font-weight: 600;
  font-size: 1rem;
  color: #333;
  min-width: 80px;
  text-align: right;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.remove-btn:hover {
  background: #fee;
}

.cart-summary {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #333;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.free-shipping {
  color: #28a745;
  font-weight: 600;
}

.summary-card hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 1rem 0;
}

.summary-line.total {
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.shipping-notice {
  background: #e7f3ff;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #0056b3;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
  }
  
  .item-actions {
    flex-wrap: wrap;
  }
}
</style> 