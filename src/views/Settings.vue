<template>
  <div class="settings-page">
    <div class="container">
      <!-- Header de configuración -->
      <div class="settings-header">
        <div class="header-content">
          <div class="header-icon">
            <font-awesome-icon icon="cog" class="icon" />
          </div>
          <div class="header-info">
            <h1 class="page-title">Configuración</h1>
            <p class="page-subtitle">Gestiona tu cuenta y preferencias</p>
          </div>
        </div>
      </div>

      <!-- Contenido de configuración -->
      <div class="settings-content">

        <!-- Configuración de Preferencias -->
        <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <font-awesome-icon icon="palette" class="section-icon" />
              Preferencias
            </h2>
            <p class="section-description">Personaliza tu experiencia en la tienda</p>
          </div>
          
          <div class="settings-card">
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-title">Tema</h3>
                <p class="setting-description">Elige entre tema claro u oscuro</p>
              </div>
              <div class="setting-control">
                <select v-model="selectedTheme" @change="updateTheme" class="theme-select">
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="setting-title">Idioma</h3>
                <p class="setting-description">Selecciona tu idioma preferido</p>
              </div>
              <div class="setting-control">
                <select v-model="selectedLanguage" @change="updateLanguage" class="language-select">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuración de Notificaciones -->
        <!-- <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">🔔</span>
              Notificaciones
            </h2>
          </div>
        </div> -->

        <!-- Configuración de Suscripciones -->
        <!-- <div class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="section-icon">📧</span>
              Suscripciones
            </h2>
          </div>
        </div> -->

      </div>
    </div>

    <!-- Modal de Cambio de Contraseña -->
    <div v-if="showChangePasswordModal" class="modal-overlay" @click="closeChangePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Cambiar Contraseña</h3>
          <button class="modal-close" @click="closeChangePasswordModal">
            <font-awesome-icon icon="times" class="close-icon" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label for="currentPassword" class="form-label">Contraseña Actual</label>
              <input 
                type="password" 
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                class="form-input"
                required
              >
            </div>
            <div class="form-group">
              <label for="newPassword" class="form-label">Nueva Contraseña</label>
              <input 
                type="password" 
                id="newPassword"
                v-model="passwordForm.newPassword"
                class="form-input"
                required
                minlength="6"
              >
            </div>
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                class="form-input"
                required
                minlength="6"
              >
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeChangePasswordModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isChangingPassword">
                {{ isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado de la página
const isResending = ref(false)
const isChangingPassword = ref(false)

// Modales
const showChangePasswordModal = ref(false)

// Configuraciones
const selectedTheme = ref('auto')
const selectedLanguage = ref('es')

// Formulario de cambio de contraseña
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Cargar configuraciones guardadas
onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  // Cargar configuraciones desde localStorage
  const savedTheme = localStorage.getItem('theme')
  const savedLanguage = localStorage.getItem('language')

  if (savedTheme) {
    selectedTheme.value = savedTheme
  }
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage
  }
}

// Navegación
const goToProfile = () => {
  router.push('/profile')
}

const goToOrders = () => {
  router.push('/orders')
}

// Funciones de configuración
const updateTheme = () => {
  localStorage.setItem('theme', selectedTheme.value)
  applyTheme(selectedTheme.value)
  alert('Tema actualizado')
}

const updateLanguage = () => {
  localStorage.setItem('language', selectedLanguage.value)
  alert('Idioma actualizado')
}

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // Auto - seguir preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}

// Funciones de modales
const openChangePassword = () => {
  showChangePasswordModal.value = true
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const closeChangePasswordModal = () => {
  showChangePasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// Funciones de acciones
const resendVerification = async () => {
  isResending.value = true
  try {
    // Simulación de reenvío
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Email de verificación reenviado')
  } catch (error) {
    alert('Error al reenviar verificación')
  } finally {
    isResending.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Las contraseñas no coinciden')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres')
    return
  }

  isChangingPassword.value = true
  try {
    // Simulación de cambio de contraseña
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Contraseña cambiada exitosamente')
    closeChangePasswordModal()
  } catch (error) {
    alert('Error al cambiar contraseña')
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-gray-50);
  padding-top: 120px;
  padding-bottom: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* === HEADER === */
.settings-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  color: var(--color-quaternary);
}

.header-icon {
  font-size: 3rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon .icon {
  color: var(--icon-settings-header);
  font-size: 1em;
  transition: all var(--transition-normal);
}

.header-content:hover .header-icon .icon {
  transform: rotate(15deg) scale(1.1);
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--color-quaternary);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

/* === CONTENT === */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.section-icon {
  font-size: 1.25rem;
  color: var(--icon-settings-prefs);
  transition: all var(--transition-normal);
}

.section-title:hover .section-icon {
  transform: scale(1.1);
}

.section-description {
  color: var(--color-gray-600);
  margin: 0;
  font-size: 0.875rem;
}

.settings-card {
  padding: 2rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 0;
  border-bottom: 1px solid var(--color-gray-200);
  transition: all 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background-color: var(--color-gray-50);
  margin: 0 -2rem;
  padding: 2rem;
  border-radius: 12px;
}

.setting-info {
  flex: 1;
  margin-right: 2rem;
}

.setting-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 0.5rem 0;
}

.setting-description {
  color: var(--color-gray-600);
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.setting-control {
  display: flex;
  align-items: center;
}

/* === BOTONES === */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-tertiary);
  color: var(--color-white);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-quaternary);
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1rem;
}

/* === SELECTS === */
.theme-select,
.language-select {
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.theme-select:focus,
.language-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(221, 235, 157, 0.1);
}

/* === STATUS BADGES === */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.verified {
  background: #d1fae5;
  color: #065f46;
}

.status-icon {
  font-size: 0.75rem;
}

/* === MODALES === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 2rem;
}

.modal-content {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--icon-settings-close);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.modal-close:hover {
  color: var(--icon-settings-close-hover);
}

.close-icon {
  font-size: 1rem;
  transition: color var(--transition-normal);
}

.modal-close:hover .close-icon {
  color: var(--icon-settings-close-hover);
}

.modal-body {
  padding: 2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(221, 235, 157, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-gray-200);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-icon {
    font-size: 2.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-info {
    margin-right: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding-top: 100px;
  }
  
  .header-content {
    padding: 1.5rem;
  }
  
  .section-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .settings-card {
    padding: 1.5rem;
  }
  
  .setting-item {
    padding: 1.5rem 0;
  }
}
</style>
