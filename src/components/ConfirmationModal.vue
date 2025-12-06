<template>
  <Modal
    :show="show"
    :title="title"
    :icon="props.icon || defaultIcon"
    max-width="sm"
    :close-on-overlay="false"
    @update:show="$emit('update:show', $event)"
    @close="handleCancel"
  >
    <div class="confirmation-content">
      <div v-if="message" class="confirmation-message" :class="`message-${type}`">
        {{ message }}
      </div>
      <slot name="content"></slot>
    </div>

    <template #footer>
      <button 
        type="button" 
        @click="handleCancel" 
        class="btn btn-secondary"
      >
        {{ cancelText }}
      </button>
      <button 
        type="button" 
        @click="handleConfirm" 
        class="btn"
        :class="confirmButtonClass"
      >
        <font-awesome-icon v-if="confirmIcon" :icon="confirmIcon" class="btn-icon" />
        {{ confirmText }}
      </button>
    </template>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from './Modal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Aceptar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmIcon: {
    type: [String, Array],
    default: null
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['danger', 'success', 'info', 'warning'].includes(value)
  },
  icon: {
    type: [String, Array],
    default: null
  }
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'btn-error'
    case 'success':
      return 'btn-success'
    case 'warning':
      return 'btn-warning'
    default:
      return 'btn-primary'
  }
})

const defaultIcon = computed(() => {
  if (props.icon) return props.icon
  switch (props.type) {
    case 'danger':
      return 'exclamation-triangle'
    case 'success':
      return 'check-circle'
    case 'warning':
      return 'exclamation-circle'
    default:
      return 'info-circle'
  }
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}
</script>

<style scoped>
.confirmation-content {
  padding: 0;
}

.confirmation-message {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.message-danger {
  color: var(--color-error);
}

.message-success {
  color: var(--color-success);
}

.message-warning {
  color: var(--color-warning);
}

.message-info {
  color: var(--color-tertiary);
}

.btn-icon {
  margin-right: var(--spacing-sm);
}

@media (max-width: 768px) {
  .confirmation-message {
    font-size: var(--font-size-sm);
  }
}
</style>
