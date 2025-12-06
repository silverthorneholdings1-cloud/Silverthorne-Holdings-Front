<template>
  <header class="header">
    <nav class="nav">
      <div class="container">
        <!-- Logo Section -->
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <div class="logo">
              <span class="logo-text">Silverthorne Holdings</span>
            </div>
          </router-link>
        </div>
        
        <!-- Navigation Menu -->
        <div class="nav-center">
          <ul class="nav-menu">
            <li><router-link to="/" class="nav-link">Inicio</router-link></li>
            <li><router-link to="/shop" class="nav-link">Tienda</router-link></li>
            <li><router-link to="/offers" class="nav-link">Ofertas</router-link></li>
            <li><router-link to="/contact" class="nav-link">Contacto</router-link></li>
          </ul>
        </div>
        
        <!-- Actions Section -->
        <div class="nav-actions">
          <div class="cart-section">
            <button class="cart-button" @click="toggleCart">
              <font-awesome-icon icon="shopping-cart" class="cart-icon" />
              <span class="cart-count" v-if="cartItemCount > 0">{{ cartItemCount }}</span>
            </button>
          </div>
          
          <!-- Auth Section - Mostrar perfil o botones según estado de auth -->
          <div class="auth-section">
            <!-- Usuario autenticado - Mostrar perfil -->
            <div v-if="authStore.isAuthenticated && !authStore.loading" class="user-profile" @click="handleUserProfileClick">
              <div class="user-avatar">
                <font-awesome-icon icon="user" class="avatar-icon" />
              </div>
              <div class="user-avatar-mobile">
                <font-awesome-icon icon="bars" class="hamburger-icon" />
              </div>
              <div class="user-info">
                <span class="user-name">{{ getUserDisplayName }}</span>
                <span class="user-status">En línea</span>
              </div>
              <font-awesome-icon icon="chevron-down" class="dropdown-arrow" :class="{ 'dropdown-arrow-open': userMenuOpen }" />
              
              <!-- Menú desplegable del usuario -->
              <div class="user-menu" :class="{ 'user-menu-open': userMenuOpen }">
                <div class="user-menu-header">
                  <div class="user-avatar-large">
                    <font-awesome-icon icon="user" class="avatar-icon-large" />
                  </div>
                  <div class="user-details">
                    <h3 class="user-menu-name">{{ getUserDisplayName }}</h3>
                    <p class="user-menu-email">{{ (authStore.user && authStore.user.email) || 'Sin email' }}</p>
                  </div>
                </div>
                <div class="user-menu-separator"></div>
                <ul class="user-menu-items">
                  <li>
                    <button class="user-menu-item" @click="goToProfile">
                      <font-awesome-icon icon="user" class="menu-icon" />
                      <span>Mi Perfil</span>
                    </button>
                  </li>
                  <li>
                    <button class="user-menu-item" @click="goToOrders">
                      <font-awesome-icon icon="box" class="menu-icon" />
                      <span>Mis Pedidos</span>
                    </button>
                  </li>
                  <li v-if="isAdmin">
                    <button class="user-menu-item admin-menu-item" @click="goToAdmin">
                      <font-awesome-icon icon="tools" class="menu-icon" />
                      <span>Panel Admin</span>
                    </button>
                  </li>
                  <li>
                    <button class="user-menu-item" @click="goToSettings">
                      <font-awesome-icon icon="cog" class="menu-icon" />
                      <span>Configuración</span>
                    </button>
                  </li>
                </ul>
                <div class="user-menu-separator"></div>
                <button class="user-menu-item logout-btn" @click="handleLogout">
                  <font-awesome-icon icon="sign-out-alt" class="menu-icon" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
            
            <!-- Loading state -->
            <div v-else-if="authStore.loading" class="auth-loading">
              <font-awesome-icon icon="spinner" class="loading-spinner" spin />
              <span class="loading-text">Cargando...</span>
            </div>
            
            <!-- Usuario no autenticado - Mostrar botones (ocultos en móvil) -->
            <div v-else class="auth-buttons hide-auth-buttons-mobile">
              <button class="btn btn-outline btn-sm" @click="openLoginModal">
                <span class="btn-text">Iniciar Sesión</span>
              </button>
              <button class="btn btn-primary btn-sm" @click="openRegisterModal">
                <span class="btn-text">Registrarse</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Mobile Menu Toggle - Solo visible cuando no hay sesión -->
        <div class="mobile-menu-toggle" v-if="!authStore.isAuthenticated || authStore.loading">
          <button class="hamburger" @click="toggleMobileMenu">
            <font-awesome-icon icon="bars" class="hamburger-icon" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'mobile-menu-open': mobileMenuOpen }">
        <ul class="mobile-nav-menu">
          <li><router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">Inicio</router-link></li>
          <li><router-link to="/shop" class="mobile-nav-link" @click="closeMobileMenu">Tienda</router-link></li>
          <li><router-link to="/offers" class="mobile-nav-link" @click="closeMobileMenu">Ofertas</router-link></li>
          <li><router-link to="/contact" class="mobile-nav-link" @click="closeMobileMenu">Contacto</router-link></li>
        </ul>
        
        <!-- Mobile Auth Section -->
        <div class="mobile-auth-section">
          <!-- Usuario autenticado en móvil -->
          <div v-if="authStore.isAuthenticated && !authStore.loading" class="mobile-user-profile">
            <div class="mobile-user-info">
              <div class="user-avatar">
                <font-awesome-icon icon="user" class="avatar-icon" />
              </div>
              <div class="mobile-user-details">
                <h3 class="mobile-user-name">{{ getUserDisplayName }}</h3>
                <p class="mobile-user-email">{{ (authStore.user && authStore.user.email) || 'Sin email' }}</p>
              </div>
            </div>
            <div class="mobile-user-actions">
              <button class="btn btn-outline btn-full" @click="goToProfile(); closeMobileMenu()">
                Mi Perfil
              </button>
              <button class="btn btn-outline btn-full" @click="goToOrders(); closeMobileMenu()">
                Mis Pedidos
              </button>
              <button v-if="isAdmin" class="btn btn-admin btn-full" @click="goToAdmin(); closeMobileMenu()">
                <font-awesome-icon icon="tools" class="btn-icon" />
                Panel Admin
              </button>
              <button class="btn btn-outline btn-full" @click="goToSettings(); closeMobileMenu()">
                Configuración
              </button>
              <button class="btn btn-tertiary btn-full" @click="handleLogout(); closeMobileMenu()">
                Cerrar Sesión
              </button>
            </div>
          </div>
          
          <!-- Usuario no autenticado en móvil -->
          <div v-else class="mobile-auth-buttons">
            <button class="btn btn-outline btn-full" @click="openLoginModal(); closeMobileMenu()">
              Iniciar Sesión
            </button>
            <button class="btn btn-primary btn-full" @click="openRegisterModal(); closeMobileMenu()">
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart.js'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

// Usar storeToRefs para obtener referencias reactivas a los valores del store
// Esto asegura que los cambios se reflejen automáticamente en el template
const { cartItemCount } = storeToRefs(cartStore)

// Watch para cargar el carrito cuando el usuario se autentica
watch(() => authStore.isAuthenticated, async (isAuthenticated, wasAuthenticated) => {
  if (isAuthenticated && !wasAuthenticated) {
    // Usuario acaba de autenticarse, cargar el carrito
    if (cartItemCount.value === 0 && !cartStore.loading) {
      await cartStore.loadCart();
    }
  }
}, { immediate: true })

// Watch para forzar actualización cuando el carrito se carga
// Esto asegura que el badge se actualice incluso si el Header se renderizó antes de que el carrito se cargara
watch(cartItemCount, async (newCount, oldCount) => {
  if (newCount !== oldCount) {
    // Forzar actualización del componente
    await nextTick();
  }
}, { immediate: true })

const emit = defineEmits(['open-login', 'open-register'])
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

// Computed para obtener el nombre del usuario para mostrar
const getUserDisplayName = computed(() => {
  try {
    // Usar operador de encadenamiento opcional para mayor seguridad
    const userName = authStore?.user?.name
    if (userName && typeof userName === 'string') {
      return userName.length > 15 ? userName.split(' ')[0] : userName
    }
    return 'Usuario'
  } catch (error) {
    return 'Usuario'
  }
})

// Computed para verificar si el usuario es administrador
const isAdmin = computed(() => {
  try {
    return authStore?.user?.role === 'admin'
  } catch (error) {
    return false
  }
})

// Funciones de modales
const openLoginModal = () => {
  emit('open-login')
}

const openRegisterModal = () => {
  emit('open-register')
}

// Funciones de menú móvil
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
  // Cerrar menú de usuario si está abierto
  if (userMenuOpen.value) {
    userMenuOpen.value = false
  }
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Funciones de menú de usuario
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

// Manejar clic en perfil de usuario - en móvil abre mobile-menu, en desktop abre user-menu
const handleUserProfileClick = () => {
  const isMobile = window.innerWidth <= 480
  if (isMobile) {
    toggleMobileMenu()
    if (userMenuOpen.value) {
      userMenuOpen.value = false
    }
  } else {
    toggleUserMenu()
    if (mobileMenuOpen.value) {
      mobileMenuOpen.value = false
    }
  }
}

// Funciones de navegación del usuario
const goToProfile = () => {
  closeUserMenu()
  closeMobileMenu()
  router.push('/profile')
}

const goToOrders = () => {
  closeUserMenu()
  closeMobileMenu()
  router.push('/orders')
}

const goToSettings = () => {
  closeUserMenu()
  closeMobileMenu()
  router.push('/settings')
}

const goToAdmin = () => {
  closeUserMenu()
  closeMobileMenu()
  router.push('/admin')
}

const handleLogout = () => {
  authStore.logout()
  // Limpiar el carrito localmente al cerrar sesión
  cartStore.resetCart()
  closeUserMenu()
  closeMobileMenu()
  router.push('/')
}

const toggleCart = () => {
  cartStore.toggleCart()
}

// Cerrar menú de usuario al hacer clic fuera
const handleClickOutside = (event) => {
  const userProfile = document.querySelector('.user-profile')
  if (userProfile && !userProfile.contains(event.target)) {
    closeUserMenu()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  
  // Cargar carrito si el usuario está autenticado y el carrito está vacío
  // Esto asegura que el badge se muestre correctamente al recargar la página
  if (authStore.isAuthenticated && cartItemCount.value === 0 && !cartStore.loading) {
    await cartStore.loadCart();
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background: var(--color-white);
  border-bottom: var(--border-width-thin) solid var(--color-gray-200);
  box-shadow: var(--shadow-md);
}

.nav { position: relative; }
.nav .container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-2xl);
  min-height: var(--header-height);
  gap: var(--spacing-2xl);
}

.nav-brand { justify-self: start; }
.brand-link {
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition-normal);
}
.brand-link:hover { transform: scale(1.02); }

.logo { display: flex; align-items: center; gap: var(--spacing-md); }
.logo-text {
  background: linear-gradient(45deg, var(--color-secondary), var(--color-tertiary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
}

.nav-center { justify-self: center; }
.nav-menu {
  display: flex;
  list-style: none;
  gap: var(--spacing-4xl);
  margin: 0;
  padding: 0;
  justify-content: center;
}

.nav-link {
  position: relative;
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-normal);
  letter-spacing: 0.01em;
}
.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius-full);
  transform: translateX(-50%);
  transition: all var(--transition-normal);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-tertiary);
  background: rgba(221, 235, 157, 0.08);
}
.nav-link:hover::before,
.nav-link.router-link-active::before { width: 80%; }

.nav-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.cart-section { position: relative; }
.cart-button {
  position: relative;
  background: none;
  border: var(--border-width-thin) solid transparent;
  font-size: var(--font-size-2xl);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  color: var(--icon-cart);
  cursor: pointer;
  transition: all var(--transition-normal);
}
.cart-button:hover {
  background: rgba(221, 235, 157, 0.12);
  color: var(--icon-cart-hover);
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.cart-count {
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 22px;
  height: 22px;
  background: var(--color-error);
  color: var(--color-white);
  border: 2px solid var(--color-white);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.auth-section {
  position: relative;
  border-left: var(--border-width-thin) solid var(--color-gray-200);
  padding-left: var(--spacing-xl);
}

.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--border-radius-lg);
  background: linear-gradient(135deg, rgba(221, 235, 157, 0.1), rgba(160, 200, 120, 0.05));
  cursor: pointer;
  transition: all var(--transition-normal);
}
.user-profile:hover {
  background: linear-gradient(135deg, rgba(221, 235, 157, 0.15), rgba(160, 200, 120, 0.1));
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.user-avatar-mobile { display: none; }
.avatar-icon {
  font-size: var(--font-size-lg);
  color: var(--icon-user);
  transition: color var(--transition-normal);
}
.user-profile:hover .avatar-icon { color: var(--icon-user-hover); }

.user-info { display: flex; flex-direction: column; gap: 2px; }
.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-quaternary);
  line-height: 1.2;
}
.user-status {
  font-size: var(--font-size-xs);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.dropdown-arrow {
  font-size: var(--font-size-xs);
  color: var(--icon-dropdown);
  margin-left: var(--spacing-xs);
  transition: all var(--transition-normal);
}
.user-profile:hover .dropdown-arrow { color: var(--icon-dropdown-hover); }
.dropdown-arrow-open { transform: rotate(180deg); }

.user-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 280px;
  background: var(--color-white);
  border: var(--border-width-thin) solid var(--color-gray-200);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
  z-index: var(--z-dropdown);
  overflow: hidden;
}
.user-menu-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-menu-header {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.user-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-full);
  background: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}
.avatar-icon-large {
  font-size: var(--font-size-xl);
  color: var(--icon-user);
}

.user-details { flex: 1; }
.user-menu-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-quaternary);
  margin: 0 0 4px 0;
}
.user-menu-email {
  font-size: var(--font-size-xs);
  color: var(--color-quaternary);
  opacity: 0.8;
  margin: 0;
}
.user-menu-separator {
  height: 1px;
  background: var(--color-gray-200);
  margin: 0;
}
.user-menu-items {
  list-style: none;
  margin: 0;
  padding: var(--spacing-sm) 0;
}

.user-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-xl);
  background: none;
  border: none;
  text-align: left;
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  cursor: pointer;
  transition: all var(--transition-normal);
}
.user-menu-item:hover {
  background: var(--color-gray-100);
  color: var(--color-tertiary);
}
.logout-btn {
  color: var(--color-error);
  margin-top: var(--spacing-sm);
}
.logout-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: var(--color-error);
}

.menu-icon {
  width: 20px;
  font-size: var(--font-size-base);
  text-align: center;
  color: var(--icon-settings);
  transition: color var(--transition-normal);
}
.user-menu-item:hover .menu-icon { color: var(--icon-settings-hover); }
.user-menu-item.admin-menu-item .menu-icon { color: var(--icon-admin); }
.user-menu-item.admin-menu-item:hover .menu-icon { color: var(--icon-admin-hover); }
.user-menu-item.logout-btn .menu-icon { color: var(--icon-logout); }
.user-menu-item.logout-btn:hover .menu-icon { color: var(--icon-logout-hover); }

.auth-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}
.loading-spinner {
  font-size: var(--font-size-base);
  color: var(--icon-loading);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.loading-text { font-weight: var(--font-weight-medium); }

.auth-buttons { display: flex; gap: var(--spacing-md); }
.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border: var(--border-width-thin) solid transparent;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}
.btn-sm {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
}
.btn-outline {
  background: transparent;
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
}
.btn-outline:hover,
.btn-primary:hover,
.btn-tertiary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
.btn-outline:hover {
  background: var(--color-tertiary);
  color: var(--color-white);
}
.btn-primary {
  background: var(--color-primary);
  color: var(--color-quaternary);
  border-color: var(--color-primary);
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}
.btn-tertiary {
  background: var(--color-tertiary);
  color: var(--color-white);
  border-color: var(--color-tertiary);
}
.btn-tertiary:hover {
  background: var(--color-tertiary-dark);
  border-color: var(--color-tertiary-dark);
}
.btn-admin {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: var(--color-white);
  border: 1px solid #ff6b35;
  font-weight: 600;
}
.btn-admin:hover {
  background: linear-gradient(135deg, #e55a2e, #e68619);
  border-color: #e55a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}
.admin-menu-item {
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
  border: 1px solid rgba(255, 107, 53, 0.2);
}
.admin-menu-item:hover {
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.15), rgba(247, 147, 30, 0.15));
  border-color: rgba(255, 107, 53, 0.3);
}
.btn-full { width: 100%; justify-content: center; }
.btn-icon {
  margin-right: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--icon-admin);
  transition: color var(--transition-normal);
}
.btn-admin:hover .btn-icon { color: var(--icon-admin-hover); }

.mobile-menu-toggle {
  display: none;
  justify-self: end;
}
.hamburger {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}
.hamburger:hover { background: var(--color-gray-100); }
.hamburger-icon {
  font-size: var(--font-size-lg);
  color: var(--icon-menu);
  transition: all var(--transition-normal);
}
.hamburger:hover .hamburger-icon { color: var(--icon-menu-hover); }

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white);
  border-top: var(--border-width-thin) solid var(--color-gray-200);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
}
.mobile-menu-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.mobile-nav-menu {
  list-style: none;
  margin: 0 0 var(--spacing-xl) 0;
  padding: 0;
}
.mobile-nav-menu li { margin-bottom: var(--spacing-md); }
.mobile-nav-link {
  display: block;
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
}
.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--color-tertiary);
  background: rgba(221, 235, 157, 0.1);
}

.mobile-auth-section {
  border-top: var(--border-width-thin) solid var(--color-gray-200);
  padding-top: var(--spacing-xl);
}
.mobile-user-profile { text-align: center; }
.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(221, 235, 157, 0.1), rgba(160, 200, 120, 0.05));
  border-radius: var(--border-radius-lg);
}
.mobile-user-details { flex: 1; text-align: left; }
.mobile-user-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-quaternary);
  margin: 0 0 4px 0;
}
.mobile-user-email {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}
.mobile-user-actions,
.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (max-width: 1024px) {
  .nav .container {
    grid-template-columns: 1fr auto;
    gap: var(--spacing-xl);
  }
  .nav-center { display: none; }
  .mobile-menu-toggle,
  .mobile-menu { display: block; }
  .auth-section {
    border-left: none;
    padding-left: 0;
  }
  .auth-buttons { gap: var(--spacing-sm); }
  .btn-text { display: none; }
  .btn {
    min-width: 40px;
    padding: var(--spacing-sm);
  }
  .user-info,
  .dropdown-arrow { display: none; }
}

@media (max-width: 768px) {
  .nav .container {
    padding: var(--spacing-md) var(--spacing-lg);
    gap: var(--spacing-lg);
  }
  .logo-text { font-size: var(--font-size-xl); }
  .nav-actions { gap: var(--spacing-lg); }
  .cart-button {
    padding: var(--spacing-sm);
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .nav .container {
    padding: var(--spacing-sm) var(--spacing-md);
    grid-template-columns: auto 1fr auto;
    gap: var(--spacing-md);
  }
  .logo-text {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
  }
  .nav-actions {
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
  .cart-button {
    padding: var(--spacing-xs);
    font-size: var(--font-size-xl);
  }
  .cart-count {
    top: -4px;
    right: -4px;
    width: 20px;
    height: 20px;
    font-size: 10px;
    border-width: 1.5px;
  }
  .auth-section {
    border-left: none;
    padding-left: 0;
  }
  /* Ocultar botones de auth en móvil cuando no hay sesión */
  .hide-auth-buttons-mobile {
    display: none;
  }
  .btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    min-width: auto;
  }
  /* Mobile menu toggle visible cuando no hay sesión (controlado por v-if) */
  .mobile-menu-toggle {
    display: block !important;
  }
  .user-profile {
    padding: var(--spacing-sm);
    background: none;
    border: none;
    gap: 0;
    min-width: auto;
  }
  .user-profile:hover {
    background: var(--color-gray-100);
    transform: none;
    box-shadow: none;
    border: none;
  }
  .user-avatar { display: none; }
  /* Reutilizar estilos del hamburger para el avatar móvil */
  .user-avatar-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }
  .user-profile:hover .hamburger-icon { color: var(--icon-menu-hover); }
  .user-info,
  .dropdown-arrow,
  .user-menu { display: none; }
  .mobile-menu { padding: var(--spacing-lg) var(--spacing-md); }
  .mobile-nav-menu { margin-bottom: var(--spacing-lg); }
  .mobile-nav-link {
    font-size: var(--font-size-base);
    padding: var(--spacing-sm) var(--spacing-md);
  }
  .mobile-auth-section {
    padding-top: var(--spacing-lg);
    margin-top: var(--spacing-md);
  }
  .mobile-auth-buttons { gap: var(--spacing-sm); }
  .mobile-auth-buttons .btn,
  .mobile-user-actions .btn {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    width: 100%;
  }
  .mobile-user-info {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }
  .mobile-user-name { font-size: var(--font-size-sm); }
  .mobile-user-email { font-size: var(--font-size-xs); }
}
</style> 