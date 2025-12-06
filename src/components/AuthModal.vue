<template>
  <!-- Login Modal -->
  <div v-if="showLoginModal" class="modal-overlay" @click="closeModals">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Iniciar Sesión</h2>
        <button class="close-btn" @click="closeModals">
          <font-awesome-icon icon="times" class="close-icon" />
        </button>
      </div>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="loginEmail">Email</label>
          <input 
            type="email" 
            id="loginEmail"
            v-model="loginForm.email" 
            placeholder="tu@email.com" 
            required
          >
        </div>
        <div class="form-group">
          <label for="loginPassword">Contraseña</label>
          <div class="password-input-wrapper">
            <input 
              :type="showLoginPassword ? 'text' : 'password'" 
              id="loginPassword"
              v-model="loginForm.password" 
              placeholder="Tu contraseña" 
              required
            >
            <button 
              type="button" 
              class="password-toggle-btn"
              @mousedown.prevent="showLoginPassword = true"
              @mouseup="showLoginPassword = false"
              @mouseleave="showLoginPassword = false"
              @touchstart.prevent="showLoginPassword = true"
              @touchend="showLoginPassword = false"
              title="Mantén presionado para ver la contraseña"
            >
              <font-awesome-icon :icon="showLoginPassword ? 'eye-slash' : 'eye'" class="password-icon" />
            </button>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Iniciar Sesión</button>
        <p class="forgot-password">
          <a href="#" @click.prevent="switchToForgotPassword">¿Olvidaste tu contraseña?</a>
        </p>
        <p class="auth-switch">
          ¿No tienes cuenta? 
          <a href="#" @click.prevent="switchToRegister">Regístrate aquí</a>
        </p>
      </form>
    </div>
  </div>

  <!-- Register Modal -->
  <div v-if="showRegisterModal" class="modal-overlay" @click="closeModals">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Registrarse</h2>
        <button class="close-btn" @click="closeModals">
          <font-awesome-icon icon="times" class="close-icon" />
        </button>
      </div>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="registerName">Nombre Completo</label>
          <input 
            type="text" 
            id="registerName"
            v-model="registerForm.name" 
            placeholder="Tu nombre completo" 
            required
          >
        </div>
        <div class="form-group">
          <label for="registerEmail">Email</label>
          <input 
            type="email" 
            id="registerEmail"
            v-model="registerForm.email" 
            placeholder="tu@email.com" 
            required
          >
        </div>
        <div class="form-group">
          <label for="registerPassword">Contraseña</label>
          <div class="password-input-wrapper">
            <input 
              :type="showRegisterPassword ? 'text' : 'password'" 
              id="registerPassword"
              v-model="registerForm.password" 
              placeholder="Mínimo 6 caracteres" 
              required
              minlength="6"
            >
            <button 
              type="button" 
              class="password-toggle-btn"
              @mousedown.prevent="showRegisterPassword = true"
              @mouseup="showRegisterPassword = false"
              @mouseleave="showRegisterPassword = false"
              @touchstart.prevent="showRegisterPassword = true"
              @touchend="showRegisterPassword = false"
              title="Mantén presionado para ver la contraseña"
            >
              <font-awesome-icon :icon="showRegisterPassword ? 'eye-slash' : 'eye'" class="password-icon" />
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="password-input-wrapper">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword"
              v-model="registerForm.confirmPassword" 
              placeholder="Repite tu contraseña" 
              required
            >
            <button 
              type="button" 
              class="password-toggle-btn"
              @mousedown.prevent="showConfirmPassword = true"
              @mouseup="showConfirmPassword = false"
              @mouseleave="showConfirmPassword = false"
              @touchstart.prevent="showConfirmPassword = true"
              @touchend="showConfirmPassword = false"
              title="Mantén presionado para ver la contraseña"
            >
              <font-awesome-icon :icon="showConfirmPassword ? 'eye-slash' : 'eye'" class="password-icon" />
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          class="btn btn-primary btn-full"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Registrando...' : 'Registrarse' }}
        </button>
        <p class="auth-switch">
          ¿Ya tienes cuenta? 
          <a href="#" @click.prevent="switchToLogin">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <div v-if="showForgotPasswordModal" class="modal-overlay" @click="closeModals">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Recuperar Contraseña</h2>
        <button class="close-btn" @click="closeModals">
          <font-awesome-icon icon="times" class="close-icon" />
        </button>
      </div>
      <form @submit.prevent="handleForgotPassword" class="auth-form">
        <div class="form-group">
          <label for="forgotEmail">Email</label>
          <input 
            type="email" 
            id="forgotEmail"
            v-model="forgotPasswordForm.email" 
            placeholder="tu@email.com" 
            required
          >
        </div>
        <button 
          type="submit" 
          class="btn btn-primary btn-full"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Enviando...' : 'Enviar Email de Recuperación' }}
        </button>
        <p class="auth-switch">
          ¿Recordaste tu contraseña? 
          <a href="#" @click.prevent="switchToLogin">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotifications } from '../composables/useNotifications'

// Props
defineProps({
  showLoginModal: {
    type: Boolean,
    default: false
  },
  showRegisterModal: {
    type: Boolean,
    default: false
  },
  showForgotPasswordModal: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close-modals', 'switch-to-register', 'switch-to-login', 'switch-to-forgot-password'])

// Store
const authStore = useAuthStore()
const { success, error, warning, info } = useNotifications()

// Password visibility states
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)

// Auth forms data
const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotPasswordForm = reactive({
  email: ''
})

// Modal functions
const closeModals = () => {
  emit('close-modals')
  // Reset forms
  Object.assign(loginForm, { email: '', password: '' })
  Object.assign(registerForm, { name: '', email: '', password: '', confirmPassword: '' })
  Object.assign(forgotPasswordForm, { email: '' })
  // Reset password visibility
  showLoginPassword.value = false
  showRegisterPassword.value = false
  showConfirmPassword.value = false
}

const switchToRegister = () => {
  emit('switch-to-register')
}

const switchToLogin = () => {
  emit('switch-to-login')
}

const switchToForgotPassword = () => {
  emit('switch-to-forgot-password')
}

// Auth form handlers
const handleLogin = async () => {
  // Basic validation
  if (!loginForm.email || !loginForm.password) {
    warning('Por favor completa todos los campos')
    return
  }
  
  try {
    const response = await authStore.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    // Usar el nombre del usuario desde el store después del login exitoso
    const userName = authStore.user?.name || 'Usuario'
    success(`¡Bienvenido ${userName}! Has iniciado sesión exitosamente.`)
    closeModals()
  } catch (err) {
    // Mostrar el error específico del backend
    const errorMessage = err.error || err.message || 'Error al iniciar sesión'
    error('Error: ' + errorMessage)
  }
}

const handleRegister = async () => {
  // Basic validation
  if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
    warning('Por favor completa todos los campos')
    return
  }
  
  if (registerForm.password !== registerForm.confirmPassword) {
    error('Las contraseñas no coinciden')
    return
  }
  
  if (registerForm.password.length < 6) {
    warning('La contraseña debe tener al menos 6 caracteres')
    return
  }
  
  try {
    const response = await authStore.register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password
    })
    
    // Mensaje específico para verificación de email
    success(`¡Registro exitoso! ${response.message}\n\nRevisa tu correo electrónico para verificar tu cuenta.`, 8000)
    closeModals()
  } catch (err) {
    // Mostrar el error específico del backend
    const errorMessage = err.error || err.message || 'Error en el registro'
    error('Error: ' + errorMessage)
  }
}

const handleForgotPassword = async () => {
  // Basic validation
  if (!forgotPasswordForm.email) {
    warning('Por favor ingresa tu email')
    return
  }

  try {
    const response = await authStore.requestPasswordReset(forgotPasswordForm.email)
    success(response.message)
    closeModals()
  } catch (err) {
    const errorMessage = err.error || err.message || 'Error al solicitar recuperación'
    error('Error: ' + errorMessage)
  }
}
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2xl);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-tertiary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.close-btn {
  background: none;
  border: none;
  font-size: var(--font-size-3xl);
  cursor: pointer;
  color: var(--icon-modal-close);
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  transition: all var(--transition-normal);
}

.close-btn:hover {
  background: var(--color-gray-200);
  color: var(--icon-modal-close-hover);
}

.close-icon {
  font-size: 1.1rem;
  transition: color var(--transition-normal);
}

.close-btn:hover .close-icon {
  color: var(--icon-modal-close-hover);
}

.auth-form {
  padding: var(--spacing-3xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-gray-700);
  background-color: var(--color-white);
  transition: all var(--transition-normal);
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  padding-right: 45px;
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-500);
  transition: color var(--transition-normal);
  z-index: 10;
}

.password-toggle-btn:hover {
  color: var(--color-primary);
}

.password-icon {
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(221, 235, 157, 0.15);
}

.form-group input::placeholder {
  color: var(--color-gray-400);
}

.auth-switch {
  text-align: center;
  margin: 0;
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.auth-switch a {
  color: var(--color-tertiary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-normal);
}

.auth-switch a:hover {
  color: var(--color-tertiary-dark);
  text-decoration: underline;
}

.forgot-password {
  text-align: center;
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
}

.forgot-password a {
  color: var(--color-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: color var(--transition-normal);
}

.forgot-password a:hover {
  color: var(--color-secondary-dark);
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: var(--spacing-lg);
  }
  
  .auth-form {
    padding: var(--spacing-2xl);
  }
}
</style> 