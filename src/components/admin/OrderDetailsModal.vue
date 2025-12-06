<template>
  <Modal
    :show="show"
    title="Detalles de la Orden"
    icon="clipboard-list"
    max-width="lg"
    @update:show="$emit('update:show', $event)"
    @close="$emit('close')"
  >
    <div v-if="order" class="order-details">
      <!-- Order Info -->
      <div class="order-info-section">
        <h3>Información de la Orden</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>ID de Orden:</label>
            <span>{{ order.id || order._id }}</span>
          </div>
          <div class="info-item">
            <label>Número de Orden:</label>
            <span>{{ order.orderNumber || order.order_number || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Fecha de Creación:</label>
            <span>{{ formatDate(order.createdAt || order.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>Estado:</label>
            <span class="status-badge" :class="`status-${order.status}`">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <div class="info-item">
            <label>Total:</label>
            <span class="amount">${{ formatCLP(order.totalAmount || order.total_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="customer-info-section">
        <h3>Información del Cliente</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Nombre:</label>
            <span>{{ order.customerName || order.user?.name || 'No disponible' }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ order.customerEmail || order.user?.email || 'No disponible' }}</span>
          </div>
          <div class="info-item" v-if="order.customerPhone || order.user?.phone">
            <label>Teléfono:</label>
            <span>{{ order.customerPhone || order.user?.phone || 'No disponible' }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="payment-info-section">
        <h3>Información de Pago</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Estado del Pago:</label>
            <span class="payment-badge" :class="`payment-${order.paymentStatus || order.payment_status || 'pending'}`">
              {{ getPaymentStatusLabel(order.paymentStatus || order.payment_status) }}
            </span>
          </div>
          <div class="info-item" v-if="order.authorizationCode || order.authorization_code">
            <label>Código de Autorización:</label>
            <span>{{ order.authorizationCode || order.authorization_code }}</span>
          </div>
          <div class="info-item" v-if="order.transactionId || order.transaction_id">
            <label>ID de Transacción:</label>
            <span>{{ order.transactionId || order.transaction_id }}</span>
          </div>
          <div class="info-item" v-if="order.paymentMethod || order.payment_method">
            <label>Método de Pago:</label>
            <span>{{ order.paymentMethod || order.payment_method }}</span>
          </div>
        </div>
      </div>

      <!-- Shipping Info -->
      <div class="shipping-info-section" v-if="order.shippingAddress || order.shipping_street">
        <h3>Información de Envío</h3>
        <div class="info-grid">
          <div class="info-item" v-if="order.shippingAddress?.street || order.shipping_street">
            <label>Dirección:</label>
            <span>{{ order.shippingAddress?.street || order.shipping_street }}</span>
          </div>
          <div class="info-item" v-if="order.shippingAddress?.city || order.shipping_city">
            <label>Ciudad:</label>
            <span>{{ order.shippingAddress?.city || order.shipping_city }}</span>
          </div>
          <div class="info-item" v-if="order.shippingAddress?.state || order.shipping_state">
            <label>Estado/Región:</label>
            <span>{{ order.shippingAddress?.state || order.shipping_state }}</span>
          </div>
          <div class="info-item" v-if="order.shippingAddress?.zipCode || order.shipping_zip_code">
            <label>Código Postal:</label>
            <span>{{ order.shippingAddress?.zipCode || order.shipping_zip_code }}</span>
          </div>
          <div class="info-item" v-if="order.shippingAddress?.country || order.shipping_country">
            <label>País:</label>
            <span>{{ order.shippingAddress?.country || order.shipping_country }}</span>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="order-items-section" v-if="orderItems && orderItems.length > 0">
        <h3>Productos</h3>
        <div class="items-list">
          <div v-for="item in orderItems" :key="item.id || item._id" class="order-item">
            <div class="item-image-placeholder" v-if="!getItemImage(item)">
              <font-awesome-icon icon="image" />
            </div>
            <img v-else :src="getItemImage(item)" :alt="getItemName(item)" class="item-image" />
            <div class="item-details">
              <h4>{{ getItemName(item) }}</h4>
              <p>Cantidad: {{ item.quantity }}</p>
              <p>Precio unitario: ${{ formatCLP(item.price) }}</p>
            </div>
            <div class="item-total">
              ${{ formatCLP(item.price * item.quantity) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button @click="$emit('close')" class="btn btn-outline">Cerrar</button>
      <button 
        v-if="order && (order.paymentStatus || order.payment_status) === 'paid' && order.status !== 'cancelled'"
        @click="$emit('refund', order)" 
        class="btn btn-warning"
        :disabled="refunding"
      >
        {{ refunding ? 'Procesando...' : 'Reembolsar' }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '../Modal.vue'
import { formatCLP } from '../../utils/formatters.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  },
  refunding: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:show', 'close', 'refund'])

const orderItems = computed(() => {
  if (!props.order) return []
  return props.order.items || props.order.order_items || []
})

// Helper functions to access item properties (supporting both old and new structure)
const getItemImage = (item) => {
  return item.product?.image || item.image || null
}

const getItemName = (item) => {
  return item.product?.name || item.name || item.productName || item.product_name || 'Producto sin nombre'
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

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }
  return labels[status] || status || 'Desconocido'
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  }
  return labels[status] || status || 'Pendiente'
}
</script>

<style scoped>
.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.order-info-section,
.customer-info-section,
.payment-info-section,
.shipping-info-section,
.order-items-section {
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-gray-200);
}

.order-items-section:last-child {
  border-bottom: none;
}

.order-info-section h3,
.customer-info-section h3,
.payment-info-section h3,
.shipping-info-section h3,
.order-items-section h3 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-gray-700);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.info-item span {
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.status-badge.status-pending { background: #fff3cd; color: #856404; }
.status-badge.status-processing { background: #d1ecf1; color: #0c5460; }
.status-badge.status-shipped { background: #d4edda; color: #155724; }
.status-badge.status-delivered { background: #d1f2eb; color: #00695c; }
.status-badge.status-cancelled { background: #f8d7da; color: #721c24; }

.payment-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 80px;
}

.payment-badge.payment-pending { background: #fff3cd; color: #856404; }
.payment-badge.payment-paid { background: #d4edda; color: #155724; }
.payment-badge.payment-failed { background: #f8d7da; color: #721c24; }
.payment-badge.payment-refunded { background: #d1ecf1; color: #0c5460; }

.amount {
  font-weight: 700;
  color: #28a745;
  font-size: 1.1rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--border-radius-md);
}

.item-image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-200);
  border-radius: var(--border-radius-md);
  color: var(--color-gray-400);
  font-size: 1.5rem;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.item-details {
  flex: 1;
}

.item-details h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-gray-700);
  font-size: var(--font-size-base);
}

.item-details p {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.item-total {
  font-weight: 700;
  color: #28a745;
  font-size: 1.1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 1rem;
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

.btn-warning {
  background: #ffc107;
  color: #212529;
  border-color: #ffc107;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #d39e00;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

