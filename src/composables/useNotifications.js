import { useNotificationStore } from '../stores/notifications'

export function useNotifications() {
  const store = useNotificationStore()

  return {
    // Métodos principales
    success: store.success,
    error: store.error,  
    warning: store.warning,
    info: store.info,
    
    // Métodos avanzados
    notify: store.addNotification,
    remove: store.removeNotification,
    clear: store.clearAll,
    
    // Acceso al estado
    notifications: store.notifications
  }
} 