<template>
  <div class="admin-orders">
    <div class="container">
      <div class="orders-header">
        <h1>
          <font-awesome-icon icon="clipboard-list" class="header-icon" />
          Gestión de Órdenes
        </h1>
        <div class="header-actions">
          <router-link to="/admin" class="btn btn-outline">
            <font-awesome-icon icon="arrow-left" class="btn-icon" />
            Volver al Dashboard
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" v-if="stats">
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="box" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalOrders || 0 }}</h3>
            <p>Total Órdenes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="clock" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.pendingOrders || 0 }}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="check-circle" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.completedOrders || 0 }}</h3>
            <p>Completadas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="dollar-sign" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>${{ formatCLP(stats.totalRevenue || 0) }}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="credit-card" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.paidOrders || 0 }}</h3>
            <p>Pagadas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="undo" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.refundedOrders || 0 }}</h3>
            <p>Reembolsadas</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="cog" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.processingOrders || 0 }}</h3>
            <p>En Procesamiento</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="times-circle" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.cancelledOrders || 0 }}</h3>
            <p>Canceladas</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <OrderFilters
        :search-term="searchTerm"
        :selected-status="selectedStatus"
        :selected-payment-status="selectedPaymentStatus"
        @update:searchTerm="searchTerm = $event"
        @update:selectedStatus="selectedStatus = $event"
        @update:selectedPaymentStatus="selectedPaymentStatus = $event"
      />

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <font-awesome-icon icon="spinner" spin class="loading-icon" />
        <p>Cargando órdenes...</p>
      </div>

      <!-- Orders Table -->
      <div v-else>
        <OrderTable
          :orders="orders"
          :refunding-order="refundingOrder"
          :checking-payment="checkingPayment"
          @update-status="updateOrderStatus"
          @view="viewOrderDetails"
          @refund="refundOrder"
          @check-payment="checkPaymentStatus"
        />

        <!-- Pagination -->
        <Pagination
          v-if="pagination && pagination.totalPages > 1"
          :current-page="pagination.currentPage"
          :total-pages="pagination.totalPages"
          :total-items="pagination.totalItems"
          :items-per-page="pagination.itemsPerPage"
          item-label="órdenes"
          @update:currentPage="handlePageChange"
          @update:itemsPerPage="handleItemsPerPageChange"
        />
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      :show="!!selectedOrder"
      :order="selectedOrder"
      :refunding="refundingOrder === (selectedOrder?.id || selectedOrder?._id)"
      @update:show="selectedOrder = null"
      @close="selectedOrder = null"
      @refund="refundOrder"
    />

    <!-- Status Change Confirmation Modal -->
    <ConfirmationModal
      :show="showStatusChangeModal"
      title="Confirmar cambio de estado"
      :message="`¿Estás seguro de que quieres cambiar el estado de la orden ${pendingStatusChange.orderNumber} a '${getStatusLabel(pendingStatusChange.newStatus)}'? ${getEmailNotificationMessage(pendingStatusChange.newStatus)}`"
      confirm-text="Confirmar y enviar correo"
      cancel-text="Cancelar"
      type="info"
      icon="envelope"
      @update:show="showStatusChangeModal = $event"
      @confirm="confirmStatusChange"
      @cancel="cancelStatusChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { adminService } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import { formatCLP } from '../utils/formatters.js'
import OrderFilters from '../components/admin/OrderFilters.vue'
import OrderTable from '../components/admin/OrderTable.vue'
import OrderDetailsModal from '../components/admin/OrderDetailsModal.vue'
import Pagination from '../components/admin/Pagination.vue'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const { success, error } = useNotifications()

// State
const orders = ref([])
const stats = ref(null)
const loading = ref(false)
const selectedStatus = ref('')
const selectedPaymentStatus = ref('')
const searchTerm = ref('')
const selectedOrder = ref(null)
const refundingOrder = ref(null)
const checkingPayment = ref(null)
const showStatusChangeModal = ref(false)
const pendingStatusChange = ref({ orderId: null, newStatus: null, orderNumber: null })

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)
const pagination = ref(null)

// Debounce timer for search
let searchDebounceTimer = null

// Watch for filter changes and reload orders
watch([selectedStatus, selectedPaymentStatus], () => {
  currentPage.value = 1 // Reset to first page when filters change
  loadOrders()
})

// Watch for search term changes with debounce
watch(searchTerm, (newValue) => {
  // Clear existing timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  // Reset to first page when search changes
  currentPage.value = 1
  
  // Set new timer for debounce (500ms delay)
  searchDebounceTimer = setTimeout(() => {
    loadOrders()
  }, 500)
})

// Methods
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    }
    
    // Add filters if they have values
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }
    
    if (selectedPaymentStatus.value) {
      params.paymentStatus = selectedPaymentStatus.value
    }
    
    if (searchTerm.value) {
      params.search = searchTerm.value
    }
    
    const [ordersResponse, statsResponse] = await Promise.all([
      adminService.getAllOrders(params),
      adminService.getOrderStats('all') // Request all orders stats, not just last 30 days
    ])
    
    // Handle response format: { success: true, data: { orders: [...], pagination: {...} } }
    if (ordersResponse?.success) {
      if (ordersResponse.data?.orders && Array.isArray(ordersResponse.data.orders)) {
        orders.value = ordersResponse.data.orders
        pagination.value = ordersResponse.data.pagination || null
      } else if (Array.isArray(ordersResponse.data)) {
        // Legacy format: fallback to array
        orders.value = ordersResponse.data
        pagination.value = null
      } else {
        orders.value = []
        pagination.value = null
      }
    } else {
      orders.value = []
      pagination.value = null
    }
    
    // Transform stats response to match frontend format
    const statsData = statsResponse?.data || statsResponse || {}
    
    // Check if it's the backend format (has summary, ordersByStatus, or ordersByPaymentStatus)
    if (statsData.summary || statsData.ordersByStatus || statsData.ordersByPaymentStatus) {
      // Backend format: { summary: {...}, ordersByStatus: {...}, ordersByPaymentStatus: {...} }
      stats.value = {
        totalOrders: statsData.summary?.totalOrders || 0,
        totalRevenue: statsData.summary?.totalRevenue || 0,
        pendingOrders: statsData.ordersByStatus?.pending || 0,
        completedOrders: (statsData.ordersByStatus?.delivered || 0) + (statsData.ordersByStatus?.shipped || 0),
        paidOrders: statsData.ordersByPaymentStatus?.paid || 0,
        refundedOrders: statsData.ordersByPaymentStatus?.refunded || 0,
        processingOrders: statsData.ordersByStatus?.processing || 0,
        cancelledOrders: statsData.ordersByStatus?.cancelled || 0
      }
    } else if (statsData.totalOrders !== undefined || statsData.pendingOrders !== undefined) {
      // Frontend format already (legacy or direct)
      stats.value = {
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders: statsData.pendingOrders || 0,
        completedOrders: statsData.completedOrders || 0,
        paidOrders: statsData.paidOrders || 0,
        refundedOrders: statsData.refundedOrders || 0,
        processingOrders: statsData.processingOrders || 0,
        cancelledOrders: statsData.cancelledOrders || 0
      }
    } else {
      // Fallback: initialize with zeros
      stats.value = {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        paidOrders: 0,
        refundedOrders: 0,
        processingOrders: 0,
        cancelledOrders: 0
      }
    }
  } catch (err) {
    error('Error al cargar órdenes: ' + (err.message || 'Error desconocido'))
    orders.value = []
    pagination.value = null
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadOrders()
  // Scroll to top of table
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleItemsPerPageChange = (newItemsPerPage) => {
  itemsPerPage.value = newItemsPerPage
  currentPage.value = 1
  loadOrders()
}

// Get status label in Spanish
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

// Get email notification message based on status
const getEmailNotificationMessage = (status) => {
  const messages = {
    processing: 'Se enviará un correo al cliente informándole que su pedido está siendo procesado y preparado para envío.',
    shipped: 'Se enviará un correo al cliente notificándole que su pedido ha sido enviado y está en camino.',
    delivered: 'Se enviará un correo al cliente confirmando la entrega y agradeciéndole por su compra.',
    cancelled: 'Se enviará un correo al cliente informándole sobre la cancelación de su pedido.'
  }
  return messages[status] || 'Se enviará un correo electrónico al cliente notificándole sobre este cambio.'
}

// Handle status change request - show confirmation modal
const updateOrderStatus = (orderId, newStatus) => {
  if (!orderId) {
    error('Error: ID de orden inválido')
    console.error('updateOrderStatus called with invalid orderId:', orderId)
    return
  }

  // Find the order to get its number
  const order = orders.value.find(o => (o.id === orderId || o._id === orderId))
  const orderNumber = order?.orderNumber || order?.order_number || `#${orderId.toString().slice(-8)}`

  // Store pending change and show modal
  pendingStatusChange.value = {
    orderId,
    newStatus,
    orderNumber
  }
  showStatusChangeModal.value = true
}

// Confirm and execute status change
const confirmStatusChange = async () => {
  const { orderId, newStatus } = pendingStatusChange.value
  
  try {
    await adminService.updateOrderStatus(orderId, newStatus)
    success('Estado de orden actualizado')
    await loadOrders()
    // Update selected order if it's the same one
    if (selectedOrder.value && (selectedOrder.value.id === orderId || selectedOrder.value._id === orderId)) {
      selectedOrder.value.status = newStatus
    }
  } catch (err) {
    error('Error al actualizar estado de orden: ' + (err.message || 'Error desconocido'))
  } finally {
    showStatusChangeModal.value = false
    pendingStatusChange.value = { orderId: null, newStatus: null, orderNumber: null }
  }
}

// Cancel status change
const cancelStatusChange = () => {
  showStatusChangeModal.value = false
  pendingStatusChange.value = { orderId: null, newStatus: null, orderNumber: null }
}

const viewOrderDetails = (order) => {
  selectedOrder.value = order
}

const refundOrder = async (order) => {
  const orderId = order?.id || order?._id
  if (!orderId) {
    error('Error: ID de orden inválido')
    console.error('refundOrder called with invalid order:', order)
    return
  }

  if (!confirm(`¿Estás seguro de que quieres reembolsar la orden #${orderId.toString().slice(-8)}?`)) {
    return
  }

  refundingOrder.value = orderId
  try {
    await adminService.refundPayment(orderId)
    success('Reembolso procesado exitosamente')
    await loadOrders()
    if (selectedOrder.value && (selectedOrder.value.id === orderId || selectedOrder.value._id === orderId)) {
      selectedOrder.value.paymentStatus = 'refunded'
      selectedOrder.value.payment_status = 'refunded'
    }
  } catch (err) {
    error('Error al procesar el reembolso: ' + (err.message || 'Error desconocido'))
  } finally {
    refundingOrder.value = null
  }
}

const checkPaymentStatus = async (order) => {
  const orderId = order?.id || order?._id
  if (!orderId) {
    error('Error: ID de orden inválido')
    console.error('checkPaymentStatus called with invalid order:', order)
    return
  }

  checkingPayment.value = orderId
  try {
    await adminService.getPaymentStatus(orderId)
    success('Estado de pago actualizado')
    await loadOrders()
  } catch (err) {
    error('Error al verificar el estado del pago: ' + (err.message || 'Error desconocido'))
  } finally {
    checkingPayment.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.admin-orders {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.orders-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  color: var(--icon-admin-orders-header);
  font-size: 1.2em;
  transition: all var(--transition-normal);
}

.orders-header:hover .header-icon {
  transform: scale(1.1) rotate(5deg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-svg {
  font-size: 1em;
  transition: all var(--transition-normal);
}

.stat-card:hover .stat-icon-svg {
  transform: scale(1.1);
}

/* Colores específicos para cada estadística */
.stat-card:nth-child(1) .stat-icon-svg { color: var(--icon-admin-products); }
.stat-card:nth-child(2) .stat-icon-svg { color: var(--icon-admin-pending); }
.stat-card:nth-child(3) .stat-icon-svg { color: var(--icon-admin-success); }
.stat-card:nth-child(4) .stat-icon-svg { color: var(--icon-admin-revenue); }
.stat-card:nth-child(5) .stat-icon-svg { color: var(--icon-admin-payments); }
.stat-card:nth-child(6) .stat-icon-svg { color: var(--icon-admin-refunds); }
.stat-card:nth-child(7) .stat-icon-svg { color: #3b82f6; } /* Blue for processing */
.stat-card:nth-child(8) .stat-icon-svg { color: #ef4444; } /* Red for cancelled */

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-icon {
  font-size: 2.5rem;
  color: var(--icon-admin-orders-loading);
  margin: 0 auto 1rem;
  display: block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-outline {
  background: white;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.btn-icon {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
