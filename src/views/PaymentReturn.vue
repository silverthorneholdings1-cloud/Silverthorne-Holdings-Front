<template>
  <div class="payment-return">
    <div class="container">
      <div class="return-content">
        <div class="processing-icon">
          <div class="spinner">
            <font-awesome-icon icon="spinner" class="spinner-icon" :spin="true" />
          </div>
        </div>
        
        <h1>Procesando Retorno de Pago</h1>
        <p>Confirmando tu pago con Transbank...</p>
        
        <div class="processing-steps">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-icon">1</div>
            <span>Recibiendo confirmación</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-icon">2</div>
            <span>Validando pago</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <div class="step-icon">3</div>
            <span>Finalizando orden</span>
          </div>
        </div>

        <div v-if="error" class="error-message">
          <div class="error-icon">
            <font-awesome-icon icon="times-circle" class="error-icon-svg" />
          </div>
          <h3>Error en la Confirmación</h3>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button @click="retryConfirmation" class="btn btn-primary">
              <font-awesome-icon icon="redo" class="btn-icon" />
              Intentar Nuevamente
            </button>
            <router-link to="/checkout" class="btn btn-outline">
              <font-awesome-icon icon="arrow-left" class="btn-icon" />
              Volver al Checkout
            </router-link>
          </div>
        </div>

        <div v-if="isProcessing" class="processing-message">
          <div class="processing-icon">
            <font-awesome-icon icon="sync-alt" class="processing-icon-svg" :spin="true" />
          </div>
          <h3>Procesando confirmación...</h3>
          <p>Por favor espera mientras validamos tu pago</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart.js'
import { useNotifications } from '../composables/useNotifications'
import transbankService from '../services/transbank.js'

const route = useRoute()
const router = useRouter()
const { error: showError } = useNotifications()
const cartStore = useCartStore()

// Reactive data
const currentStep = ref(1)
const error = ref('')
const isProcessing = ref(false)
const redirectAttempted = ref(false)

// Get token from URL
const transbankToken = ref(route.query.token_ws)

// Helper function to mask token for logging
const maskToken = (token) => {
  if (!token || token.length < 10) return '***'
  return `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
}

onMounted(async () => {
  // Log payment return attempt
  console.log('[PaymentReturn] Component mounted', {
    hasToken: !!transbankToken.value,
    tokenMasked: transbankToken.value ? maskToken(transbankToken.value) : 'none',
    hasAuthToken: !!localStorage.getItem('token')
  })
  
  if (!transbankToken.value) {
    const errorMsg = 'Token de pago no encontrado en la URL'
    console.error('[PaymentReturn] Missing token_ws parameter')
    error.value = errorMsg
    showError(errorMsg)
    return
  }
  
  await confirmPayment()
})

const confirmPayment = async () => {
  try {
    isProcessing.value = true
    error.value = ''
    currentStep.value = 2
    
    console.log('[PaymentReturn] Starting payment confirmation', {
      tokenMasked: maskToken(transbankToken.value),
      step: currentStep.value
    })
    
    const data = await transbankService.confirmPayment(transbankToken.value)
    
    console.log('[PaymentReturn] Payment confirmed successfully', {
      orderId: data.data?.orderId,
      orderNumber: data.data?.orderNumber,
      status: data.data?.status
    })
    
    currentStep.value = 3
    
    // Clear cart on successful payment
    try {
      await cartStore.clearCart()
      console.log('[PaymentReturn] Cart cleared successfully')
    } catch (cartError) {
      console.warn('[PaymentReturn] Error clearing cart:', cartError)
      // Don't fail the payment if cart clearing fails
    }
    
    // Clear stored payment data
    try {
      transbankService.clearStoredPaymentData()
    } catch (storageError) {
      console.warn('[PaymentReturn] Error clearing stored payment data:', storageError)
    }
    
    // Redirect to success page
    try {
      redirectAttempted.value = true
      await router.push({
        name: 'PaymentSuccess',
        query: {
          orderId: data.data.orderId,
          orderNumber: data.data.orderNumber,
          amount: data.data.amount,
          authorizationCode: data.data.authorizationCode
        }
      })
    } catch (redirectError) {
      console.error('[PaymentReturn] Error redirecting to success page:', redirectError)
      // Fallback: show success message in current component
      error.value = 'Pago confirmado exitosamente. Por favor, revisa tus órdenes.'
    }
    
  } catch (err) {
    // Enhanced error handling
    console.error('[PaymentReturn] Error confirming payment:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      tokenMasked: maskToken(transbankToken.value)
    })
    
    // Determine specific error message
    let errorMessage = 'Error al confirmar el pago'
    
    if (err.response) {
      // Network/API error
      if (err.response.status === 400) {
        errorMessage = err.response.data?.message || 'La transacción no es válida o fue cancelada'
      } else if (err.response.status === 404) {
        errorMessage = 'No se encontró la orden asociada a este pago'
      } else if (err.response.status === 500) {
        errorMessage = 'Error en el servidor. Por favor, intenta nuevamente más tarde'
      } else {
        errorMessage = err.response.data?.message || err.message || errorMessage
      }
    } else if (err.message) {
      // Other errors (network, timeout, etc.)
      if (err.message.includes('Network Error') || err.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente'
      } else if (err.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Por favor, intenta nuevamente'
      } else {
        errorMessage = err.message
      }
    }
    
    error.value = errorMessage
    showError(errorMessage)
    
    // Try to redirect to error page, but show error in component if redirect fails
    try {
      redirectAttempted.value = true
      await router.push({
        name: 'PaymentError',
        query: {
          message: errorMessage
        }
      })
    } catch (redirectError) {
      console.error('[PaymentReturn] Error redirecting to error page:', redirectError)
      // Error is already displayed in the component, so user can see it
      // The component will show the error message and retry button
    }
  } finally {
    isProcessing.value = false
  }
}

const retryConfirmation = () => {
  console.log('[PaymentReturn] Retrying payment confirmation')
  error.value = ''
  currentStep.value = 1
  isProcessing.value = false
  redirectAttempted.value = false
  confirmPayment()
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.payment-return {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  align-items: center;
}

.return-content {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.processing-icon {
  margin-bottom: 2rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  font-size: 1.5rem;
  color: var(--icon-payment-return-spinner);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.return-content h1 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: #333;
  font-weight: 700;
}

.return-content p {
  color: #666;
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.processing-steps {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  position: relative;
}

.processing-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: #e9ecef;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  background: white;
  padding: 0 1rem;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step.active .step-icon {
  background: #007bff;
  color: white;
}

.step.completed .step-icon {
  background: #28a745;
  color: white;
}

.step span {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.step.active span {
  color: #007bff;
}

.step.completed span {
  color: #28a745;
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon-svg {
  font-size: 1em;
  color: var(--icon-payment-return-error);
  transition: all var(--transition-normal);
}

.error-message:hover .error-icon-svg {
  transform: scale(1.1) rotate(10deg);
}

.error-message h3 {
  color: #721c24;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.error-message p {
  color: #721c24;
  margin: 0 0 1.5rem 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.processing-message {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.processing-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: pulse 1.5s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-icon-svg {
  font-size: 1em;
  color: var(--icon-payment-return-processing);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.processing-message h3 {
  color: #0c5460;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.processing-message p {
  color: #0c5460;
  margin: 0;
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
  color: var(--icon-payment-return-retry-btn);
}

.btn-outline .btn-icon {
  color: var(--icon-payment-return-back-btn);
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

/* Responsive Design */
@media (max-width: 768px) {
  .return-content {
    padding: 2rem 1.5rem;
  }
  
  .return-content h1 {
    font-size: 1.75rem;
  }
  
  .processing-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .processing-steps::before {
    display: none;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>
