<template>
  <div class="user-orders">
    <div class="container">
      <div class="orders-header">
        <h1>
          <font-awesome-icon icon="box" class="header-icon" />
          Mis Pedidos
        </h1>
        <button 
          @click="refreshOrders" 
          class="btn-refresh"
          :disabled="loading || refreshing"
          :title="refreshing ? 'Actualizando...' : 'Actualizar pedidos'"
        >
          <font-awesome-icon 
            :icon="refreshing ? 'spinner' : 'sync-alt'" 
            :spin="refreshing"
            class="refresh-icon"
          />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <font-awesome-icon icon="spinner" spin class="loading-icon" />
        <p>Cargando tus pedidos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">
          <font-awesome-icon icon="box" class="empty-icon-svg" />
        </div>
        <h2>No tienes pedidos aún</h2>
        <p>Cuando realices tu primera compra, aparecerá aquí</p>
        <div class="empty-actions">
          <router-link to="/shop" class="btn btn-primary">
            <font-awesome-icon icon="store" class="btn-icon" />
            Ir a la Tienda
          </router-link>
        </div>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-content">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button 
            v-for="status in statusFilters" 
            :key="status.value"
            @click="activeFilter = status.value"
            :class="['tab', { active: activeFilter === status.value }]"
          >
            {{ status.label }}
            <span class="count">({{ getOrdersByStatus(status.value).length }})</span>
          </button>
        </div>

        <!-- Orders Grid -->
        <div class="orders-grid">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id || order._id" 
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <h3>Pedido #{{ getOrderNumber(order.id || order._id, order.orderNumber) }}</h3>
                <p class="order-date">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div class="order-status">
                <span :class="['status-badge', `status-${order.status}`]">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>

            <div class="order-details">
              <div class="order-items">
                <div 
                  v-for="item in order.items" 
                  :key="item.id || item._id"
                  class="order-item"
                >
                  <img 
                    :src="item.product?.image || '/placeholder.jpg'" 
                    :alt="item.product?.name || item.productName"
                    @error="handleImageError"
                  />
                  <div class="item-info">
                    <h4>{{ item.product?.name || item.productName }}</h4>
                    <p>Cantidad: {{ item.quantity }}</p>
                    <p class="item-price">${{ formatPrice(item.price) }}</p>
                  </div>
                </div>
              </div>

              <div class="order-summary">
                <div v-if="order.shippingCost > 0" class="summary-line">
                  <span>Envío:</span>
                  <span>${{ formatPrice(order.shippingCost) }}</span>
                </div>
                <hr v-if="order.shippingCost > 0" class="summary-divider">
                <div class="summary-line total-line">
                  <span>Total:</span>
                  <span class="total-amount">${{ formatPrice(order.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <div class="order-actions">
              <button 
                v-if="canCancelOrder(order)" 
                @click="cancelOrder(order.id || order._id)" 
                class="btn btn-danger"
                :disabled="cancellingOrder === (order.id || order._id)"
              >
                {{ cancellingOrder === (order.id || order._id) ? 'Cancelando...' : 'Cancelar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredOrdersCount"
          :items-per-page="itemsPerPage"
          item-label="pedidos"
          @page-change="currentPage = $event"
        />
      </div>

      <!-- Help Banner -->
      <div class="help-banner">
        <div class="help-banner-content">
          <div class="help-banner-icon">
            <font-awesome-icon icon="question-circle" />
          </div>
          <div class="help-banner-text">
            <h3>¿Tienes problemas con tu pedido?</h3>
            <p>Contáctanos y te ayudaremos lo antes posible</p>
          </div>
          <router-link to="/contact" class="btn btn-primary help-banner-btn">
            <font-awesome-icon icon="envelope" />
            Contactar
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNotifications } from '../composables/useNotifications'
import { orderService } from '../services/api.js'
import { formatCLP } from '../utils/formatters.js'
import Pagination from '../components/admin/Pagination.vue'

const { success, error } = useNotifications()
const route = useRoute()

// Reactive data
const orders = ref([])
const loading = ref(false)
const refreshing = ref(false)
const activeFilter = ref('all')
const cancellingOrder = ref(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Flag to prevent multiple simultaneous loads
let isLoadingInProgress = false
let hasLoadedOnMount = false

// Status filters
const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' }
]

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value

  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === activeFilter.value)
  }

  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const filteredOrdersCount = computed(() => {
  if (activeFilter.value === 'all') return orders.value.length
  return orders.value.filter(order => order.status === activeFilter.value).length
})

const totalPages = computed(() => {
  return Math.ceil(filteredOrdersCount.value / itemsPerPage)
})

// Watch for filter changes to reset pagination
watch(activeFilter, () => {
  currentPage.value = 1
})

// Methods
const loadOrders = async (showLoading = true) => {
  if (isLoadingInProgress) return

  isLoadingInProgress = true
  
  if (showLoading) {
    loading.value = true
  } else {
    refreshing.value = true
  }

  try {
    const response = await orderService.getUserOrders()
    
    let newOrders = []
    if (response?.data?.orders && Array.isArray(response.data.orders)) {
      newOrders = response.data.orders
    } else if (response?.orders && Array.isArray(response.orders)) {
      newOrders = response.orders
    } else if (response?.data && Array.isArray(response.data)) {
      newOrders = response.data
    } else if (Array.isArray(response)) {
      newOrders = response
    }

    orders.value = newOrders
  } catch (err) {
    if (showLoading) {
      error('Error al cargar tus pedidos. Por favor, intenta de nuevo.')
      orders.value = []
    }
  } finally {
    loading.value = false
    refreshing.value = false
    isLoadingInProgress = false
  }
}

const refreshOrders = async () => {
  await loadOrders(false)
  success('Pedidos actualizados')
}

const getOrdersByStatus = (status) => {
  if (!Array.isArray(orders.value)) return []
  if (status === 'all') return orders.value
  return orders.value.filter(order => order.status === status)
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return labels[status] || status
}

const canCancelOrder = (order) => {
  return ['pending', 'processing'].includes(order.status)
}

const cancelOrder = async (orderId) => {
  if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
    return
  }

  cancellingOrder.value = orderId
  try {
    await orderService.cancelOrder(orderId)
    success('Pedido cancelado exitosamente')
    await loadOrders()
  } catch (err) {
    error('Error al cancelar el pedido. Por favor, intenta de nuevo.')
  } finally {
    cancellingOrder.value = null
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return 'Fecha inválida'
  }
}

const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) return '0'
  return formatCLP(price)
}

const getOrderNumber = (orderId, orderNumber) => {
  if (orderNumber) return orderNumber
  if (orderId) {
    if (typeof orderId === 'number') {
      return orderId.toString()
    }
    return orderId.toString().slice(-8)
  }
  return 'N/A'
}

const handleImageError = (event) => {
  event.target.src = '/placeholder.jpg'
}

// Watch route changes
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/orders' && oldPath && oldPath !== newPath && hasLoadedOnMount && !isLoadingInProgress) {
    loadOrders()
  }
}, { immediate: false })

// Lifecycle
onMounted(() => {
  if (!isLoadingInProgress) {
    loadOrders().then(() => {
      hasLoadedOnMount = true
    }).catch(() => {
      hasLoadedOnMount = true
    })
  } else {
    hasLoadedOnMount = true
  }
})

onActivated(() => {
  if (hasLoadedOnMount && !isLoadingInProgress) {
    loadOrders()
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-orders {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fffe 0%, #f0f7f4 100%);
}

.orders-header {
  text-align: center;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.orders-header h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-800);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-refresh {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-gray-700);
}

.btn-refresh:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  transform: rotate(180deg);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1.125rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-icon {
  font-size: 2.5rem;
  color: var(--icon-orders-loading);
  margin: 0 auto 1rem;
  display: block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  background: white;
  padding: 4rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-svg {
  color: var(--icon-orders-empty);
  font-size: 1em;
  transition: all var(--transition-normal);
}

.empty-state h2 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.75rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #666;
  font-size: 1.1rem;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-gray-300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab:hover {
  background: var(--color-gray-50);
}

.tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.count {
  font-size: 0.875rem;
  opacity: 0.8;
}

.orders-grid {
  display: grid;
  gap: 1rem;
}

.order-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.order-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--color-gray-800);
  font-size: 1.125rem;
  font-weight: 600;
}

.order-date {
  margin: 0;
  color: var(--color-gray-600);
  font-size: 0.8125rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending { background: #fff3cd; color: #856404; }
.status-processing { background: #d1ecf1; color: #0c5460; }
.status-shipped { background: #d4edda; color: #155724; }
.status-delivered { background: #d1ecf1; color: #0c5460; }
.status-cancelled { background: #f8d7da; color: #721c24; }

.order-details {
  margin-bottom: 1rem;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 0.125rem 0;
  color: var(--color-gray-800);
  font-size: 0.9375rem;
  font-weight: 600;
}

.item-info p {
  margin: 0;
  color: var(--color-gray-600);
  font-size: 0.8125rem;
}

.item-price {
  font-weight: 600;
  color: #28a745;
}

.order-summary {
  background: var(--color-gray-50);
  padding: 1rem;
  border-radius: 8px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
  font-size: 0.875rem;
}

.summary-divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 0.5rem 0;
}

.total-line {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0;
}

.total-amount {
  color: #007bff;
  font-size: 1.125rem;
}

.order-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.btn-outline {
  background: transparent;
  color: var(--color-gray-600);
  border-color: var(--color-gray-300);
}

.btn-outline:hover:not(:disabled) {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
  border-color: var(--color-gray-400);
}

.btn-danger {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-error-dark);
  border-color: var(--color-error-dark);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.help-banner {
  margin-top: var(--spacing-3xl);
  background: linear-gradient(135deg, var(--color-tertiary) 0%, var(--color-quaternary) 100%);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-3xl);
  box-shadow: var(--shadow-lg);
}

.help-banner-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  flex-wrap: wrap;
}

.help-banner-icon {
  font-size: var(--font-size-4xl);
  color: var(--color-white);
  opacity: 0.9;
}

.help-banner-text {
  flex: 1;
  min-width: 200px;
}

.help-banner-text h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-white);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.help-banner-text p {
  margin: 0;
  color: var(--color-white);
  opacity: 0.9;
  font-size: var(--font-size-base);
}

.help-banner-btn {
  background: var(--color-white);
  color: var(--color-tertiary);
  border-color: var(--color-white);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) var(--spacing-3xl);
  white-space: nowrap;
}

.help-banner-btn:hover {
  background: var(--color-gray-100);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .orders-header {
    padding: 1.5rem;
  }

  .orders-header h1 {
    font-size: 2rem;
    padding-right: 3rem;
  }

  .btn-refresh {
    top: 1.5rem;
    right: 1.5rem;
    padding: 0.625rem;
  }

  .filter-tabs {
    flex-direction: column;
  }

  .order-header {
    flex-direction: column;
    gap: 1rem;
  }

  .order-actions {
    flex-direction: column;
  }

  .help-banner {
    margin-top: var(--spacing-3xl);
    padding: var(--spacing-2xl);
  }

  .help-banner-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }

  .help-banner-icon {
    font-size: var(--font-size-3xl);
  }

  .help-banner-text h3 {
    font-size: var(--font-size-xl);
  }

  .help-banner-text p {
    font-size: var(--font-size-sm);
  }

  .help-banner-btn {
    width: 100%;
  }
}
</style>
