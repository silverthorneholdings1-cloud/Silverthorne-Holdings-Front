<template>
  <div class="payment-error">
    <div class="container">
      <div class="error-content">
        <div class="error-icon">
          <div class="error-symbol">
            <font-awesome-icon icon="times-circle" class="error-symbol-svg" />
          </div>
        </div>
        
        <h1>Error en el Pago</h1>
        <p>{{ errorMessage }}</p>
        
        <div v-if="orderDetails" class="order-details">
          <div class="detail-card">
            <h2>Detalles del Pedido</h2>
            
            <div class="detail-row">
              <span class="label">Número de Orden:</span>
              <span class="value">{{ orderDetails.orderNumber }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">ID de Orden:</span>
              <span class="value">{{ orderDetails.orderId }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Monto:</span>
              <span class="value amount">${{ formatCLP(orderDetails.amount || 0) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Estado:</span>
              <span class="value status failed">Error</span>
            </div>
          </div>
        </div>

        <div class="error-reasons">
          <h3>Posibles Causas</h3>
          <ul>
            <li>
              <font-awesome-icon icon="credit-card" class="reason-icon" />
              Datos de tarjeta incorrectos
            </li>
            <li>
              <font-awesome-icon icon="dollar-sign" class="reason-icon" />
              Fondos insuficientes
            </li>
            <li>
              <font-awesome-icon icon="lock" class="reason-icon" />
              Tarjeta bloqueada o vencida
            </li>
            <li>
              <font-awesome-icon icon="globe" class="reason-icon" />
              Problemas de conexión
            </li>
            <li>
              <font-awesome-icon icon="clock" class="reason-icon" />
              Tiempo de sesión agotado
            </li>
          </ul>
        </div>

        <div class="error-actions">
          <button @click="retryPayment" class="btn btn-primary">
            <font-awesome-icon icon="redo" class="btn-icon" />
            Intentar Pago Nuevamente
          </button>
          <router-link to="/checkout" class="btn btn-outline">
            <font-awesome-icon icon="arrow-left" class="btn-icon" />
            Volver al Checkout
          </router-link>
          <router-link to="/cart" class="btn btn-secondary">
            <font-awesome-icon icon="shopping-cart" class="btn-icon" />
            Revisar Carrito
          </router-link>
        </div>

        <div class="support-info">
          <h4>¿Necesitas Ayuda?</h4>
          <p>Si el problema persiste, contáctanos para obtener asistencia:</p>
          <div class="contact-methods">
            <div class="contact-item">
              <font-awesome-icon icon="envelope" class="contact-icon" />
              <span>soporte@silverthorneholdings.com</span>
            </div>
            <div class="contact-item">
              <font-awesome-icon icon="phone" class="contact-icon" />
              <span>+56 2 2345 6789</span>
            </div>
            <div class="contact-item">
              <font-awesome-icon icon="comments" class="contact-icon" />
              <span>Chat en vivo</span>
            </div>
          </div>
        </div>

        <div class="help-tips">
          <h4>Consejos Útiles</h4>
          <div class="tips-grid">
            <div class="tip-item">
              <font-awesome-icon icon="search" class="tip-icon" />
              <span>Verifica los datos de tu tarjeta</span>
            </div>
            <div class="tip-item">
              <font-awesome-icon icon="credit-card" class="tip-icon" />
              <span>Intenta con otra tarjeta</span>
            </div>
            <div class="tip-item">
              <font-awesome-icon icon="sync-alt" class="tip-icon" />
              <span>Actualiza la página e intenta de nuevo</span>
            </div>
            <div class="tip-item">
              <font-awesome-icon icon="mobile-alt" class="tip-icon" />
              <span>Contacta a tu banco si es necesario</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '../composables/useNotifications'
import transbankService from '../services/transbank.js'
import { formatCLP } from '../utils/formatters.js'

const route = useRoute()
const router = useRouter()
const { error: showError } = useNotifications()

// Reactive data
const errorMessage = ref('')
const orderDetails = ref(null)

onMounted(() => {
  // Get error details from route query
  errorMessage.value = route.query.message || 'Ha ocurrido un error durante el procesamiento del pago'
  
  // Get order details if available
  if (route.query.orderId || route.query.orderNumber) {
    orderDetails.value = {
      orderId: route.query.orderId,
      orderNumber: route.query.orderNumber,
      amount: parseFloat(route.query.amount) || 0
    }
  }

  // Try to get payment data from service
  const paymentData = transbankService.getStoredPaymentData()
  if (paymentData && !orderDetails.value) {
    orderDetails.value = {
      orderId: paymentData.orderId,
      orderNumber: paymentData.orderNumber,
      amount: 0 // Amount not stored in sessionStorage
    }
  }

  // Clear payment data from service
  transbankService.clearStoredPaymentData()
})

const retryPayment = () => {
  if (orderDetails.value?.orderId) {
    // Redirect to payment processing with existing order data
    router.push({
      name: 'PaymentProcessing',
      query: {
        orderId: orderDetails.value.orderId,
        orderNumber: orderDetails.value.orderNumber
      }
    })
  } else {
    // Redirect to checkout to start over
    router.push('/checkout')
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.payment-error {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
}

.error-content {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-icon {
  margin-bottom: 2rem;
}

.error-symbol {
  width: 80px;
  height: 80px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto;
  animation: errorShake 0.5s ease-in-out;
}

.error-symbol-svg {
  font-size: 1em;
  color: var(--icon-payment-error-symbol);
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-content h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #dc3545;
  font-weight: 700;
}

.error-content p {
  color: #666;
  font-size: 1.2rem;
  margin: 0 0 2rem 0;
}

.order-details {
  margin: 2rem 0;
}

.detail-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
}

.detail-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #333;
  text-align: center;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
}

.value.amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #dc3545;
}

.value.status.failed {
  color: #dc3545;
  font-weight: 600;
}

.error-reasons {
  margin: 2rem 0;
  text-align: left;
}

.error-reasons h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

.error-reasons ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-reasons li {
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reason-icon {
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.error-reasons li:nth-child(1) .reason-icon {
  color: var(--icon-payment-error-card);
}

.error-reasons li:nth-child(2) .reason-icon {
  color: var(--icon-payment-error-money);
}

.error-reasons li:nth-child(3) .reason-icon {
  color: var(--icon-payment-error-lock);
}

.error-reasons li:nth-child(4) .reason-icon {
  color: var(--icon-payment-error-globe);
}

.error-reasons li:nth-child(5) .reason-icon {
  color: var(--icon-payment-error-time);
}

.error-reasons li:hover .reason-icon {
  transform: scale(1.1);
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
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

.btn-primary .btn-icon {
  color: var(--icon-payment-error-retry-btn);
}

.btn-outline .btn-icon {
  color: var(--icon-payment-error-checkout-btn);
}

.btn-secondary .btn-icon {
  color: var(--icon-payment-error-cart-btn);
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
  border-color: #0056b3;
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

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-secondary:hover {
  background: #545b62;
  border-color: #545b62;
}

.support-info {
  margin: 2rem 0;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.support-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.support-info p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.contact-icon {
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.contact-item:nth-child(1) .contact-icon {
  color: var(--icon-payment-error-support-email);
}

.contact-item:nth-child(2) .contact-icon {
  color: var(--icon-payment-error-support-phone);
}

.contact-item:nth-child(3) .contact-icon {
  color: var(--icon-payment-error-chat);
}

.contact-item:hover .contact-icon {
  transform: scale(1.1);
}

.help-tips {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.help-tips h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #666;
}

.tip-icon {
  font-size: 1rem;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.tip-item:nth-child(1) .tip-icon {
  color: var(--icon-payment-error-search);
}

.tip-item:nth-child(2) .tip-icon {
  color: var(--icon-payment-error-card-alt);
}

.tip-item:nth-child(3) .tip-icon {
  color: var(--icon-payment-error-refresh);
}

.tip-item:nth-child(4) .tip-icon {
  color: var(--icon-payment-error-mobile);
}

.tip-item:hover .tip-icon {
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .error-content {
    padding: 2rem 1.5rem;
  }
  
  .error-content h1 {
    font-size: 2rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .contact-methods {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .label {
    font-size: 0.8rem;
  }
}
</style>
