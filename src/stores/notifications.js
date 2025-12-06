import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([]);

  // Generar ID único para cada notificación
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Agregar notificación
  const addNotification = (type, message, duration = 5000) => {
    const notification = {
      id: generateId(),
      type, // 'success', 'error', 'warning', 'info'
      message,
      duration,
      timestamp: Date.now()
    };

    notifications.value.push(notification);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, duration);
    }

    return notification.id;
  };

  // Remover notificación por ID
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  // Limpiar todas las notificaciones
  const clearAll = () => {
    notifications.value = [];
  };

  // Métodos de conveniencia
  const success = (message, duration) => addNotification('success', message, duration);
  const error = (message, duration) => addNotification('error', message, duration);
  const warning = (message, duration) => addNotification('warning', message, duration);
  const info = (message, duration) => addNotification('info', message, duration);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
}); 