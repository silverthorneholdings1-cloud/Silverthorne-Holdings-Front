<template>
  <div class="verification-container">
    <div class="verification-card">
      <div v-if="!verifying && !verified && !token" class="check-email">
        <h2>
          <font-awesome-icon icon="envelope" class="section-icon" />
          Revisa tu Correo
        </h2>
        <p>Te hemos enviado un email de verificación. Haz clic en el enlace para activar tu cuenta.</p>
        <router-link to="/" class="btn btn-primary">
          <font-awesome-icon icon="home" class="btn-icon" />
          Volver al Inicio
        </router-link>
      </div>
      
      <div v-if="verifying" class="verifying">
        <div class="spinner">
          <font-awesome-icon icon="spinner" class="spinner-icon" :spin="true" />
        </div>
        <h2>
          <font-awesome-icon icon="clock" class="section-icon" />
          Verificando...
        </h2>
        <p>Estamos verificando tu cuenta, por favor espera.</p>
      </div>
      
      <div v-if="verified && !alreadyVerified" class="success">
        <h2>
          <font-awesome-icon icon="check-circle" class="section-icon" />
          ¡Cuenta Verificada!
        </h2>
        <p>{{ successMessage || 'Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.' }}</p>
        <router-link to="/" class="btn btn-primary">
          <font-awesome-icon icon="home" class="btn-icon" />
          Ir al Inicio
        </router-link>
      </div>
      
      <div v-if="alreadyVerified" class="info">
        <h2>
          <font-awesome-icon icon="info-circle" class="section-icon" />
          Cuenta Ya Verificada
        </h2>
        <p>{{ successMessage || 'Tu cuenta ya estaba verificada anteriormente. Puedes iniciar sesión directamente.' }}</p>
        <router-link to="/" class="btn btn-primary">
          <font-awesome-icon icon="home" class="btn-icon" />
          Ir al Inicio
        </router-link>
      </div>
      
      <div v-if="error" class="error">
        <h2>
          <font-awesome-icon icon="times-circle" class="section-icon" />
          Error de Verificación
        </h2>
        <p>{{ error }}</p>
        <div v-if="showResendForm" class="resend-form">
          <h3>
            <font-awesome-icon icon="envelope" class="section-icon" />
            Solicitar Nuevo Correo
          </h3>
          <p>Puedes solicitar un nuevo correo de verificación:</p>
          <form @submit.prevent="handleResendVerification" class="resend-form-content">
            <input 
              type="email" 
              v-model="emailInput" 
              placeholder="tu@email.com" 
              required
              class="email-input"
            />
            <button type="submit" :disabled="resending" class="btn btn-primary">
              <font-awesome-icon 
                :icon="resending ? 'spinner' : 'paper-plane'" 
                :spin="resending"
                class="btn-icon" 
              />
              {{ resending ? 'Enviando...' : 'Solicitar Correo' }}
            </button>
          </form>
          <p v-if="resendMessage" :class="resendSuccess ? 'success-message' : 'error-message'">
            {{ resendMessage }}
          </p>
        </div>
        <router-link to="/" class="btn btn-outline">
          <font-awesome-icon icon="home" class="btn-icon" />
          Volver al Inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/api'
import { useNotifications } from '../composables/useNotifications'

const route = useRoute()
const authStore = useAuthStore()
const { success, error: showError } = useNotifications()

const verifying = ref(false)
const verified = ref(false)
const alreadyVerified = ref(false)
const error = ref(null)
const successMessage = ref(null)
const token = ref(null)
const showResendForm = ref(false)
const emailInput = ref('')
const resending = ref(false)
const resendMessage = ref('')
const resendSuccess = ref(false)

const handleResendVerification = async () => {
  if (!emailInput.value) {
    resendMessage.value = 'Por favor ingresa tu correo electrónico'
    resendSuccess.value = false
    return
  }

  try {
    resending.value = true
    resendMessage.value = ''
    
    await authService.resendVerification(emailInput.value)
    
    resendMessage.value = 'Correo de verificación enviado. Revisa tu bandeja de entrada.'
    resendSuccess.value = true
    success('Correo de verificación enviado exitosamente')
  } catch (err) {
    resendMessage.value = err.error || err.message || 'Error al enviar el correo'
    resendSuccess.value = false
    showError(resendMessage.value)
  } finally {
    resending.value = false
  }
}

onMounted(async () => {
  token.value = route.query.token
  
  if (token.value) {
    try {
      verifying.value = true
      const response = await authStore.verifyEmail(token.value)
      
      // Manejar diferentes tipos de respuesta
      if (response.type === 'ALREADY_VERIFIED') {
        alreadyVerified.value = true
        verified.value = true
        successMessage.value = response.message || 'Tu cuenta ya estaba verificada'
      } else if (response.type === 'VERIFIED') {
        verified.value = true
        successMessage.value = response.message || 'Cuenta verificada exitosamente'
        success('¡Cuenta verificada exitosamente!')
      }
    } catch (err) {
      const errorData = err.response?.data || err
      
      // Determinar el tipo de error y mostrar mensaje apropiado
      if (errorData.type === 'TOKEN_EXPIRED') {
        error.value = errorData.message || 'El enlace de verificación ha expirado'
        showResendForm.value = true
      } else if (errorData.type === 'USER_NOT_FOUND') {
        error.value = errorData.message || 'Usuario no encontrado'
        showResendForm.value = true
      } else if (errorData.type === 'INVALID_TOKEN') {
        error.value = errorData.message || 'Token inválido'
        showResendForm.value = true
      } else {
        error.value = errorData.message || errorData.error || 'Error al verificar la cuenta'
        showResendForm.value = true
      }
      
      showError(error.value)
    } finally {
      verifying.value = false
    }
  }
})
</script>

<style scoped>
.verification-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-secondary-light) 100%);
  padding: var(--spacing-3xl);
}

.verification-card {
  background: var(--color-white);
  padding: var(--spacing-5xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.verification-card h2 {
  margin-bottom: var(--spacing-lg);
  color: var(--color-tertiary);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.section-icon {
  font-size: 1.2em;
  transition: all var(--transition-normal);
}

.check-email .section-icon {
  color: var(--icon-email-verification-check);
}

.verifying .section-icon {
  color: var(--icon-email-verification-spinner);
}

.success .section-icon {
  color: var(--icon-email-verification-success);
}

.error .section-icon {
  color: var(--icon-email-verification-error);
}

.verification-card:hover .section-icon {
  transform: scale(1.1) rotate(5deg);
}

.verification-card p {
  margin-bottom: var(--spacing-3xl);
  color: var(--color-gray-600);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-base);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-lg);
  transition: all var(--transition-normal);
  border: var(--border-width-thin) solid;
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
  color: var(--icon-email-verification-home-btn);
}

.btn-outline .btn-icon {
  color: var(--icon-email-verification-home-btn-outline);
}

.btn-outline:hover .btn-icon {
  color: var(--icon-email-verification-home-btn-outline-hover);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-quaternary);
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  background: transparent;
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
}

.btn-outline:hover {
  background: var(--color-tertiary);
  color: var(--color-white);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.spinner {
  border: 3px solid var(--color-gray-200);
  border-radius: var(--border-radius-full);
  border-top: 3px solid var(--color-secondary);
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-icon {
  font-size: 1rem;
  color: var(--icon-email-verification-spinner);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  color: var(--color-success);
}

.success h2 {
  color: var(--color-success);
}

.error {
  color: var(--color-error);
}

.error h2 {
  color: var(--color-error);
}

.verifying {
  color: var(--color-secondary);
}

.verifying h2 {
  color: var(--color-secondary);
}

.info {
  color: var(--color-info);
}

.info h2 {
  color: var(--color-info);
}

.resend-form {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--border-radius-md);
  border: var(--border-width-thin) solid var(--color-gray-200);
}

.resend-form h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.resend-form-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.email-input {
  padding: var(--spacing-md);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  transition: all var(--transition-normal);
}

.email-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.success-message {
  color: var(--color-success);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(0, 184, 148, 0.1);
  border-radius: var(--border-radius-sm);
}

.error-message {
  color: var(--color-error);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(231, 76, 60, 0.1);
  border-radius: var(--border-radius-sm);
}

@media (max-width: 768px) {
  .verification-container {
    padding: var(--spacing-lg);
  }
  
  .verification-card {
    padding: var(--spacing-3xl);
    margin: var(--spacing-lg);
  }
}
</style> 