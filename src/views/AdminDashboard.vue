<template>

<!-- TODO: los colores de los botones y de los iconos -->

  <div class="admin-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner">
          <font-awesome-icon icon="spinner" class="spinning" />
        </div>
        <h2>Cargando datos del dashboard...</h2>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="container">
      <div class="dashboard-header">
        <h1>
          Panel de Administración
        </h1>
      </div>

      <!-- Error Message -->
      <div v-if="hasError" class="error-alert">
        <font-awesome-icon icon="exclamation-triangle" class="error-icon" />
        <p>{{ errorMessage }}</p>
      </div>

      <div class="dashboard-stats" v-if="stats">
        <!-- Primera fila: Productos y Usuarios -->
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="check-circle" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.activeProducts || 0 }}</h3>
            <p>Productos Activos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="tag" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.productsOnSale || 0 }}</h3>
            <p>Productos en Oferta</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="users" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalUsers || 0 }}</h3>
            <p>Total Usuarios</p>
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
        
        <!-- Segunda fila: Estados de Órdenes -->
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="clock" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.pendingOrders || 0 }}</h3>
            <p>Órdenes Pendientes</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="cog" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.processingOrders || 0 }}</h3>
            <p>Órdenes en Proceso</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="truck" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.shippedOrders || 0 }}</h3>
            <p>Órdenes Enviadas</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="check-circle" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.deliveredOrders || 0 }}</h3>
            <p>Órdenes Recibidas</p>
          </div>
        </div>
      </div>

      <div class="dashboard-actions">
        <div class="action-grid">
          <div class="action-card" @click="navigateTo('/admin/products')">
            <div class="action-icon">
              <font-awesome-icon icon="box" class="action-icon-svg" />
            </div>
            <h3>Gestionar Productos</h3>
            <p>Crear, editar y eliminar productos</p>
            <div class="action-button">
              <font-awesome-icon icon="arrow-right" class="action-btn-icon" />
              Ir a Productos
            </div>
          </div>

          <div class="action-card" @click="navigateTo('/admin/orders')">
            <div class="action-icon">
              <font-awesome-icon icon="clipboard-list" class="action-icon-svg" />
            </div>
            <h3>Gestionar Órdenes</h3>
            <p>Ver y actualizar estado de órdenes</p>
            <div class="action-button">
              <font-awesome-icon icon="arrow-right" class="action-btn-icon" />
              Ir a Órdenes
            </div>
          </div>

          <div class="action-card" @click="navigateTo('/admin/users')">
            <div class="action-icon">
              <font-awesome-icon icon="users" class="action-icon-svg" />
            </div>
            <h3>Gestionar Usuarios</h3>
            <p>Ver y administrar usuarios registrados</p>
            <div class="action-button">
              <font-awesome-icon icon="arrow-right" class="action-btn-icon" />
              Gestionar Usuarios
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Alerts -->
      <div class="payment-alerts" v-if="paymentAlerts.length > 0">
        <h2>
          <font-awesome-icon icon="exclamation-triangle" class="alerts-icon" />
          Alertas de Pago
        </h2>
        <div class="alerts-list">
          <div class="alert-item" v-for="alert in paymentAlerts" :key="alert.id" :class="`alert-${alert.type}`">
            <div class="alert-icon">
              <font-awesome-icon :icon="getAlertIcon(alert.type)" class="alert-icon-svg" />
            </div>
            <div class="alert-content">
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.message }}</p>
            </div>
            <div class="alert-actions">
              <button @click="handleAlert(alert)" class="btn btn-sm btn-outline">
                {{ alert.actionText }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div class="activity-list" v-if="recentOrders.length">
          <div class="activity-item" v-for="order in recentOrders" :key="order._id">
            <div class="activity-icon">
              <font-awesome-icon icon="shopping-cart" class="activity-icon-svg" />
            </div>
            <div class="activity-info">
              <h4>Nueva orden #{{ order._id?.slice(-8) }}</h4>
              <p>{{ formatDate(order.createdAt) }} - ${{ order.totalAmount }}</p>
              <div class="payment-info" v-if="order.paymentStatus">
                <span class="payment-badge" :class="`payment-${order.paymentStatus}`">
                  {{ getPaymentStatusText(order.paymentStatus) }}
                </span>
                <span v-if="order.authorizationCode" class="auth-code">
                  Auth: {{ order.authorizationCode }}
                </span>
              </div>
            </div>
            <div class="activity-status" :class="`status-${order.status}`">
              {{ getStatusText(order.status) }}
            </div>
          </div>
        </div>
        <div v-else class="no-activity">
          <p>No hay actividad reciente</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminService, productService } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import { formatCLP } from '../utils/formatters.js'

const router = useRouter()
const { error } = useNotifications()

const stats = ref(null)
const recentOrders = ref([])
const paymentAlerts = ref([])
const loading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')

const loadDashboardData = async () => {
  loading.value = true
  hasError.value = false
  errorMessage.value = ''
  const startTime = Date.now()
  const minLoadTime = 1000 // Minimum 1 second loading time
  
  try {
    // Cargar estadísticas de órdenes y usuarios
    // Manejar errores de manera explícita para no ocultarlos
    let ordersStats = null
    let allProducts = null
    let orders = null
    let usersData = null
    const errors = []
    
    try {
      ordersStats = await adminService.getOrderStats('all') // Get all orders stats, not just last 30 days
    } catch (err) {
      console.error('[AdminDashboard] Error loading order stats:', err)
      errors.push('estadísticas de órdenes')
      ordersStats = { success: false, data: {} }
    }
    
    try {
      allProducts = await adminService.getAllProducts()
    } catch (err) {
      console.error('[AdminDashboard] Error loading products:', err)
      errors.push('productos')
      allProducts = { success: false, data: [] }
    }
    
    try {
      orders = await adminService.getAllOrders()
    } catch (err) {
      console.error('[AdminDashboard] Error loading orders:', err)
      errors.push('órdenes')
      orders = { success: false, data: [] }
    }
    
    try {
      usersData = await adminService.getAllUsers()
    } catch (err) {
      console.error('[AdminDashboard] Error loading users:', err)
      errors.push('usuarios')
      usersData = { success: false, data: [], total: 0 }
    }
    
    // Si hay errores, mostrar mensaje al usuario
    if (errors.length > 0) {
      hasError.value = true
      errorMessage.value = `Error al cargar: ${errors.join(', ')}. Algunos datos pueden estar incompletos.`
    }

    // Handle new response format: { success: true, data: { products: [...], pagination: {...} } }
    // allProducts is already the response.data from axios, so it's: { success: true, data: { products: [...] } }
    let productsArray = []
    if (allProducts?.success) {
      if (allProducts.data?.products && Array.isArray(allProducts.data.products)) {
        productsArray = allProducts.data.products
      } else if (Array.isArray(allProducts.data)) {
        productsArray = allProducts.data
      }
    }
    
    // Calculate product statistics
    const activeProducts = Array.isArray(productsArray) 
      ? productsArray.filter(p => p.isActive !== false && p.is_active !== false).length
      : 0
    
    // Calculate products on sale (checking dates if available)
    const now = new Date()
    const productsOnSale = Array.isArray(productsArray)
      ? productsArray.filter(p => {
          const isActive = p.isActive !== false && p.is_active !== false
          const isOnSale = p.isOnSale === true || p.is_on_sale === true
          if (!isActive || !isOnSale) return false
          
          // Check if sale dates are valid
          if (p.saleStartDate || p.sale_start_date) {
            const startDate = new Date(p.saleStartDate || p.sale_start_date)
            const endDate = new Date(p.saleEndDate || p.sale_end_date)
            return now >= startDate && now <= endDate
          }
          return true
        }).length
      : 0

    // Handle orders format: { success: true, data: { orders: [...], pagination: {...} } }
    // orders is already the response.data from axios, so it's: { success: true, data: { orders: [...] } }
    let ordersArray = []
    if (orders?.success) {
      if (orders.data?.orders && Array.isArray(orders.data.orders)) {
        ordersArray = orders.data.orders
      } else if (Array.isArray(orders.data)) {
        ordersArray = orders.data
      }
    }
    
    // Calculate order statistics from real data
    const allOrders = Array.isArray(ordersArray) ? ordersArray : []
    
    // Get order stats from backend response if available, otherwise calculate from orders array
    const ordersStatsData = ordersStats?.data || ordersStats || {}
    const ordersByStatus = ordersStatsData.ordersByStatus || {}
    
    // Calculate pending orders (only pending status)
    let pendingOrders = 0
    if (Object.keys(ordersByStatus).length > 0) {
      pendingOrders = ordersByStatus.pending || 0
    } else {
      pendingOrders = allOrders.filter(order => 
        order.status === 'pending'
      ).length
    }
    
    // Calculate processing orders (only processing status)
    let processingOrders = 0
    if (Object.keys(ordersByStatus).length > 0) {
      processingOrders = ordersByStatus.processing || 0
    } else {
      processingOrders = allOrders.filter(order => 
        order.status === 'processing'
      ).length
    }
    
    // Calculate shipped orders (only shipped status)
    let shippedOrders = 0
    if (Object.keys(ordersByStatus).length > 0) {
      shippedOrders = ordersByStatus.shipped || 0
    } else {
      shippedOrders = allOrders.filter(order => 
        order.status === 'shipped'
      ).length
    }
    
    // Calculate delivered orders (only delivered status)
    let deliveredOrders = 0
    if (Object.keys(ordersByStatus).length > 0) {
      deliveredOrders = ordersByStatus.delivered || 0
    } else {
      deliveredOrders = allOrders.filter(order => 
        order.status === 'delivered'
      ).length
    }

    // Calculate total revenue from paid orders if backend doesn't provide it
    let totalRevenue = ordersStatsData.summary?.totalRevenue || 0
    if (totalRevenue === 0 && allOrders.length > 0) {
      // Calculate from paid orders
      const paidOrders = allOrders.filter(order => 
        order.paymentStatus === 'paid' || order.payment_status === 'paid'
      )
      totalRevenue = paidOrders.reduce((sum, order) => {
        return sum + (order.totalAmount || order.total_amount || 0)
      }, 0)
    }

    // Calculate stats from real data only - no hardcoded defaults
    stats.value = {
      activeProducts,
      productsOnSale,
      totalUsers: usersData?.success 
        ? (usersData.data?.total || (Array.isArray(usersData.data?.users) ? usersData.data.users.length : 0))
        : 0,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders
    }

    // Obtener órdenes recientes (últimas 5) solo si hay datos reales
    if (Array.isArray(ordersArray) && ordersArray.length > 0) {
      recentOrders.value = ordersArray
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    } else {
      recentOrders.value = []
    }

    // Generate payment alerts from real data only
    generatePaymentAlerts(allOrders)

    // Ensure minimum loading time of 1 second for smooth UX
    const elapsedTime = Date.now() - startTime
    const remainingTime = minLoadTime - elapsedTime
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }

  } catch (err) {
    console.error('[AdminDashboard] Error loading dashboard data:', err)
    hasError.value = true
    errorMessage.value = 'Error al cargar los datos del dashboard. Por favor, intenta recargar la página.'
    error('Error al cargar datos del dashboard')
    // Even on error, ensure minimum loading time
    const elapsedTime = Date.now() - startTime
    const remainingTime = minLoadTime - elapsedTime
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    }
  } finally {
    loading.value = false
  }
}

const navigateTo = (path) => {
  router.push(path)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return statusMap[status] || status
}

const getPaymentStatusText = (status) => {
  const statusMap = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  }
  return statusMap[status] || status
}

const getAlertIcon = (type) => {
  const iconMap = {
    warning: 'exclamation-triangle',
    info: 'info-circle',
    danger: 'times-circle'
  }
  return iconMap[type] || 'info-circle'
}

const generatePaymentAlerts = (orders) => {
  const alerts = []
  
  // Check for failed payments
  const failedPayments = orders.filter(order => order.paymentStatus === 'failed')
  if (failedPayments.length > 0) {
    alerts.push({
      id: 'failed-payments',
      type: 'warning',
      icon: '⚠️',
      title: 'Pagos Fallidos',
      message: `${failedPayments.length} órdenes con pagos fallidos requieren atención`,
      actionText: 'Ver Órdenes',
      action: () => navigateTo('/admin/orders?filter=failed')
    })
  }
  
  // Check for pending payments older than 1 hour
  const oldPendingPayments = orders.filter(order => {
    if (order.paymentStatus !== 'pending') return false
    const orderDate = new Date(order.createdAt)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return orderDate < oneHourAgo
  })
  
  if (oldPendingPayments.length > 0) {
    alerts.push({
      id: 'old-pending-payments',
      type: 'info',
      icon: '⏰',
      title: 'Pagos Pendientes Antiguos',
      message: `${oldPendingPayments.length} órdenes con pagos pendientes por más de 1 hora`,
      actionText: 'Revisar',
      action: () => navigateTo('/admin/orders?filter=pending')
    })
  }
  
  // Check for high refund rate
  const totalOrders = orders.length
  const refundedOrders = orders.filter(order => order.paymentStatus === 'refunded').length
  const refundRate = totalOrders > 0 ? (refundedOrders / totalOrders) * 100 : 0
  
  if (refundRate > 10 && totalOrders > 10) {
    alerts.push({
      id: 'high-refund-rate',
      type: 'danger',
      icon: '📉',
      title: 'Alta Tasa de Reembolsos',
      message: `Tasa de reembolsos del ${refundRate.toFixed(1)}% - Revisar calidad del servicio`,
      actionText: 'Ver Órdenes',
      action: () => navigateTo('/admin/orders')
    })
  }
  
  paymentAlerts.value = alerts
}

const handleAlert = (alert) => {
  if (alert.action) {
    alert.action()
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.admin-dashboard {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
}

/* Loading State Styles */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
}

.loading-content {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.loading-spinner {
  font-size: 4rem;
  color: var(--color-primary, #4CAF50);
  margin-bottom: 2rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-content h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 2rem;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary, #4CAF50), #66BB6A);
  border-radius: 4px;
  animation: progress 1.5s ease-in-out infinite;
  width: 70%;
  position: relative;
}

@keyframes progress {
  0% {
    left: -70%;
  }
  100% {
    left: 100%;
  }
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
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
  color: var(--icon-admin-tools);
  font-size: 1.2em;
  transition: all var(--transition-normal);
}

.dashboard-header:hover .header-icon {
  transform: scale(1.1) rotate(5deg);
}

.dashboard-header p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  font-size: 3rem;
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

/* Colores específicos para cada tipo de estadística */
/* Primera fila */
.stat-card:nth-child(1) .stat-icon-svg { color: #10b981; } /* Productos Activos - Green */
.stat-card:nth-child(2) .stat-icon-svg { color: #f59e0b; } /* Productos en Oferta - Orange */
.stat-card:nth-child(3) .stat-icon-svg { color: #3b82f6; } /* Total Usuarios - Blue */
.stat-card:nth-child(4) .stat-icon-svg { color: var(--icon-admin-revenue); } /* Ingresos Totales */
/* Segunda fila */
.stat-card:nth-child(5) .stat-icon-svg { color: var(--icon-admin-pending); } /* Órdenes Pendientes */
.stat-card:nth-child(6) .stat-icon-svg { color: #3b82f6; } /* Órdenes en Proceso - Blue */
.stat-card:nth-child(7) .stat-icon-svg { color: #8b5cf6; } /* Órdenes Enviadas - Purple */
.stat-card:nth-child(8) .stat-icon-svg { color: #10b981; } /* Órdenes Recibidas - Green */

.stat-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stat-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.dashboard-actions {
  margin-bottom: 3rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-svg {
  font-size: 1em;
  color: var(--icon-admin-products);
  transition: all var(--transition-normal);
}

.action-card:hover .action-icon-svg {
  transform: scale(1.1);
}

/* Colores específicos para cada acción */
.action-card:nth-child(1) .action-icon-svg { color: var(--icon-admin-products); }
.action-card:nth-child(2) .action-icon-svg { color: var(--icon-admin-orders); }
.action-card:nth-child(3) .action-icon-svg { color: var(--icon-admin-analytics); }
.action-card:nth-child(4) .action-icon-svg { color: var(--icon-admin-users); }
.action-card:nth-child(5) .action-icon-svg { color: var(--icon-admin-payments); }

.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.action-card p {
  margin: 0 0 1.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.action-button {
  background: #007bff;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
}

.action-btn-icon {
  font-size: 0.875rem;
  color: var(--icon-admin-action);
  transition: all var(--transition-normal);
}

.action-card:hover .action-btn-icon {
  transform: translateX(3px);
}

.recent-activity {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alerts-icon {
  color: var(--icon-admin-alerts);
  font-size: 1.2em;
  transition: all var(--transition-normal);
}

.payment-alerts:hover .alerts-icon {
  transform: scale(1.1);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-icon-svg {
  font-size: 1em;
  color: var(--icon-admin-cart);
  transition: all var(--transition-normal);
}

.activity-item:hover .activity-icon-svg {
  transform: scale(1.1);
}

.alert-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-icon-svg {
  font-size: 1em;
  transition: all var(--transition-normal);
}

.alert-item.alert-warning .alert-icon-svg { color: var(--icon-admin-pending); }
.alert-item.alert-info .alert-icon-svg { color: var(--icon-admin-clock); }
.alert-item.alert-danger .alert-icon-svg { color: var(--icon-admin-chart); }

.alert-item:hover .alert-icon-svg {
  transform: scale(1.1);
}

.activity-info {
  flex: 1;
}

.activity-info h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.activity-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background: #d4edda;
  color: #155724;
}

.status-delivered {
  background: #d1f2eb;
  color: #00695c;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: #666;
}

/* Payment Alerts */
.payment-alerts {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.payment-alerts h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.alert-warning {
  background: #fff3cd;
  border-left-color: #ffc107;
}

.alert-item.alert-info {
  background: #d1ecf1;
  border-left-color: #17a2b8;
}

.alert-item.alert-danger {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
}

.alert-content p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
}

/* Payment Info in Activity */
.payment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.payment-badge {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 50px;
}

.payment-badge.payment-pending { background: #fff3cd; color: #856404; }
.payment-badge.payment-paid { background: #d4edda; color: #155724; }
.payment-badge.payment-failed { background: #f8d7da; color: #721c24; }
.payment-badge.payment-refunded { background: #d1ecf1; color: #0c5460; }

.auth-code {
  font-size: 0.7rem;
  color: #666;
  font-family: monospace;
}

/* Reutilizar estilos globales de botones - solo ajustes específicos si es necesario */

/* Error Alert */
.error-alert {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #721c24;
}

.error-icon {
  font-size: 1.25rem;
  color: #dc3545;
  flex-shrink: 0;
}

.error-alert p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding-top: 100px;
    padding-bottom: 60px;
  }
  .container {
    padding: 0 var(--spacing-md, 1rem);
  }
  .dashboard-header {
    margin-bottom: 2rem;
  }
  .dashboard-header h1 {
    font-size: 2rem;
  }
  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .action-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .stat-card {
    padding: 1.5rem;
    gap: 1rem;
  }
  .stat-icon {
    font-size: 2.5rem;
  }
  .stat-info h3 {
    font-size: 1.75rem;
  }
  .action-card {
    padding: 1.5rem;
  }
  .action-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .alert-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .payment-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .activity-status {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding-top: 90px;
    padding-bottom: 40px;
  }
  .container {
    padding: 0 var(--spacing-sm, 0.75rem);
  }
  .dashboard-header h1 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  .dashboard-header p {
    font-size: 0.9rem;
  }
  .dashboard-stats {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  .stat-icon {
    font-size: 2rem;
  }
  .stat-info h3 {
    font-size: 1.5rem;
  }
  .stat-info p {
    font-size: 0.8rem;
  }
  .action-grid {
    gap: 0.75rem;
  }
  .action-card {
    padding: 1rem;
  }
  .action-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .action-card h3 {
    font-size: 1.1rem;
  }
  .action-card p {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  .action-button {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    width: 100%;
  }
  .payment-alerts,
  .recent-activity {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  .payment-alerts h2,
  .recent-activity h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  .alert-item {
    padding: 0.75rem;
  }
  .alert-content h4 {
    font-size: 0.9rem;
  }
  .alert-content p {
    font-size: 0.8rem;
  }
  .activity-item {
    padding: 0.75rem;
  }
  .activity-info h4 {
    font-size: 0.9rem;
  }
  .activity-info p {
    font-size: 0.8rem;
  }
  .activity-status {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
  .error-alert {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .error-alert p {
    font-size: 0.85rem;
  }
}
</style> 