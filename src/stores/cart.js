import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartService } from '../services/api';
import { useAuthStore } from './auth';
import { useNotifications } from '../composables/useNotifications';

export const useCartStore = defineStore('cart', () => {
  // Estado
  const items = ref([]);
  const isOpen = ref(false);
  const loading = ref(false);
  const error = ref(null);
  const isInitializing = ref(false);

  // Composables
  const { success, error: errorNotification } = useNotifications();

  const verificationRequiredMessage = 'Debes verificar tu cuenta para usar el carrito. Revisa tu correo electrónico.';

  const resolveCartErrorMessage = (err, fallbackMessage) => {
    if (err?.verificationRequired) {
      return verificationRequiredMessage;
    }
    return err?.message || err?.error || fallbackMessage;
  };

  // Helper function to map backend cart items to frontend format
  // Uses data directly from backend without additional API calls
  function mapItemsToCartFormat(itemsArray) {
    if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
      return [];
    }
    
    return itemsArray
      .filter(item => item.productId) // Filter out items without productId
      .map(item => ({
        id: item.productId,
        _id: item.productId,
        name: item.productName || `Producto ${item.productId}`,
        price: item.price, // Recalculated price from backend
        image: item.image || '/placeholder-product.svg',
        stock: item.stock ?? 999,
        quantity: item.quantity,
        category: item.category || 'General',
        rating: 5, // Default rating (not provided by backend)
        description: item.description || '',
        subtotal: item.subtotal || (item.price * item.quantity),
        // Include sale information from backend
        isOnSale: item.isOnSale || false,
        discountPercentage: item.discountPercentage || null,
        originalPrice: item.originalPrice || item.price
      }));
  }

  // Computed properties - Pinia maneja la reactividad automáticamente
  // Estos computed se actualizan automáticamente cuando items.value cambia
  const cartItems = computed(() => items.value);
  
  const cartTotal = computed(() => 
    items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  );
  
  const cartItemCount = computed(() => 
    items.value.reduce((total, item) => total + (item.quantity || 0), 0)
  );
  
  const isCartOpen = computed(() => isOpen.value);

  // Acciones
  async function loadCart() {
    const authStore = useAuthStore();
    
    // Solo cargar si está autenticado
    if (!authStore.isAuthenticated) {
      items.value = [];
      return;
    }

    // Prevent multiple simultaneous loads
    // No verificar isInitializing aquí porque initializeCart lo usa para prevenir múltiples inicializaciones
    if (loading.value) {
      return;
    }
    loading.value = true;
    error.value = null;
    
    try {
      // Get cart from backend
      const response = await cartService.getCart();
      
      // Check for removed products notification
      let removedProductsInfo = null;
      if (response.success && response.data && response.data.removedProducts) {
        removedProductsInfo = response.data.removedProducts;
      }
      
      let mappedItems = [];
      
      // Extract items from response (backend already includes all product details)
      if (response.success && response.data) {
        // Case 1: response.data.items (standard format from formatCart)
        if (response.data.items && Array.isArray(response.data.items)) {
          mappedItems = mapItemsToCartFormat(response.data.items);
        }
        // Case 2: response.data is an array directly
        else if (Array.isArray(response.data)) {
          mappedItems = mapItemsToCartFormat(response.data);
        }
        // Case 3: response.data.cartItems
        else if (response.data.cartItems && Array.isArray(response.data.cartItems)) {
          mappedItems = mapItemsToCartFormat(response.data.cartItems);
        }
        // Case 4: Try summary endpoint as fallback
        else {
          const summaryResponse = await cartService.getCartSummary();
          
          // Check for removed products in summary response too
          if (summaryResponse.success && summaryResponse.data && summaryResponse.data.removedProducts) {
            removedProductsInfo = summaryResponse.data.removedProducts;
          }
          
          if (summaryResponse.success && summaryResponse.data) {
            if (summaryResponse.data.items && Array.isArray(summaryResponse.data.items)) {
              mappedItems = mapItemsToCartFormat(summaryResponse.data.items);
            } else if (Array.isArray(summaryResponse.data)) {
              mappedItems = mapItemsToCartFormat(summaryResponse.data);
            }
          }
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array response
        mappedItems = mapItemsToCartFormat(response.data);
      } else {
        // Try summary as fallback
        const summaryResponse = await cartService.getCartSummary();
        
        // Check for removed products in summary response too
        if (summaryResponse.success && summaryResponse.data && summaryResponse.data.removedProducts) {
          removedProductsInfo = summaryResponse.data.removedProducts;
        }
        
        if (summaryResponse.success && summaryResponse.data) {
          if (summaryResponse.data.items && Array.isArray(summaryResponse.data.items)) {
            mappedItems = mapItemsToCartFormat(summaryResponse.data.items);
          } else if (Array.isArray(summaryResponse.data)) {
            mappedItems = mapItemsToCartFormat(summaryResponse.data);
          }
        }
      }
      
      // Show notification if products were removed
      if (removedProductsInfo && removedProductsInfo.count > 0) {
        errorNotification('Un artículo ya no existe o no queda stock');
      }
      
      // Update items - Pinia handles reactivity automatically
      items.value = mappedItems;
      
    } catch (err) {
      console.error('[Cart Store] Error loading cart:', err);
      // Manejar errores específicos de autenticación
      if (err?.verificationRequired) {
        error.value = resolveCartErrorMessage(err, verificationRequiredMessage);
      } else if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Debes iniciar sesión para ver tu carrito';
        // Limpiar carrito local si no está autenticado
        items.value = [];
      } else {
        error.value = resolveCartErrorMessage(err, 'Error al cargar el carrito');
        items.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  async function addToCart(product) {
    const authStore = useAuthStore();
    
    // Verificar autenticación
    if (!authStore.isAuthenticated) {
      errorNotification('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    // Optimistic update: add item immediately to UI
    const existingItem = items.value.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.subtotal = existingItem.price * existingItem.quantity;
    } else {
      // Create temporary item with product data
      const tempItem = {
        id: product.id,
        _id: product.id,
        name: product.name,
        price: product.price || 0,
        image: product.image || '/placeholder-product.svg',
        stock: product.stock ?? 999,
        quantity: 1,
        category: product.category || 'General',
        rating: product.rating || 5,
        description: product.description || '',
        subtotal: (product.price || 0) * 1,
        isOnSale: product.isOnSale || false,
        discountPercentage: product.discountPercentage || null,
        originalPrice: product.originalPrice || product.price || 0
      };
      items.value.push(tempItem);
    }

    loading.value = true;
    error.value = null;
    
    try {
      const productData = {
        productId: product.id,
        quantity: 1
      };
      
      // Backend returns the updated cart with all items
      const response = await cartService.addToCart(productData);
      
      // Use backend response directly instead of reloading
      if (response.success && response.data) {
        let backendItems = [];
        if (response.data.items && Array.isArray(response.data.items)) {
          backendItems = mapItemsToCartFormat(response.data.items);
        } else if (Array.isArray(response.data)) {
          backendItems = mapItemsToCartFormat(response.data);
        }
        
        // Update with backend data (this ensures consistency)
        if (backendItems.length > 0) {
          items.value = backendItems;
        }
      }
      
      success(`${product.name} agregado al carrito`);
      
    } catch (err) {
      // Revert optimistic update on error
      await loadCart();
      
      if (err?.verificationRequired) {
        const message = resolveCartErrorMessage(err, verificationRequiredMessage);
        error.value = message;
        errorNotification(message);
      } else if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Debes iniciar sesión para agregar productos al carrito';
        errorNotification(error.value);
      } else {
        // Extraer mensaje de error del response si está disponible
        const errorMessage = err?.response?.data?.error || 
                            err?.message || 
                            'Error al agregar producto al carrito';
        const message = resolveCartErrorMessage(err, errorMessage);
        error.value = message;
        errorNotification(message);
      }
    } finally {
      loading.value = false;
    }
  }

  async function removeFromCart(productId) {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      errorNotification('Debes iniciar sesión para modificar el carrito');
      return;
    }

    // Optimistic update: remove item immediately from UI
    const itemToRemove = items.value.find(item => item.id === productId);
    const previousItems = [...items.value];
    items.value = items.value.filter(item => item.id !== productId);

    loading.value = true;
    error.value = null;
    
    try {
      // Backend returns the updated cart with all items
      const response = await cartService.removeFromCart(productId);
      
      // Use backend response directly instead of reloading
      if (response.success && response.data) {
        let backendItems = [];
        if (response.data.items && Array.isArray(response.data.items)) {
          backendItems = mapItemsToCartFormat(response.data.items);
        } else if (Array.isArray(response.data)) {
          backendItems = mapItemsToCartFormat(response.data);
        }
        
        // Update with backend data (this ensures consistency)
        items.value = backendItems;
      }
      
      success('Producto eliminado del carrito');
      
    } catch (err) {
      // Revert optimistic update on error
      items.value = previousItems;
      
      if (err?.verificationRequired) {
        const message = resolveCartErrorMessage(err, verificationRequiredMessage);
        error.value = message;
        errorNotification(message);
      } else if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Debes iniciar sesión para modificar el carrito';
        errorNotification(error.value);
      } else {
        const message = resolveCartErrorMessage(err, 'Error al eliminar producto del carrito');
        error.value = message;
        errorNotification(message);
      }
    } finally {
      loading.value = false;
    }
  }

  async function updateQuantity(productId, quantity) {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      errorNotification('Debes iniciar sesión para modificar el carrito');
      return;
    }

    // Si la cantidad es 0 o menor, eliminar el producto
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Optimistic update: update quantity immediately in UI
    const itemToUpdate = items.value.find(item => item.id === productId);
    const previousQuantity = itemToUpdate?.quantity;
    const previousSubtotal = itemToUpdate?.subtotal;
    
    if (itemToUpdate) {
      itemToUpdate.quantity = quantity;
      itemToUpdate.subtotal = itemToUpdate.price * quantity;
    }

    loading.value = true;
    error.value = null;
    
    try {
      const itemData = {
        productId: productId,
        quantity: quantity
      };
      
      // Backend returns the updated cart with all items
      const response = await cartService.updateCartItem(itemData);
      
      // Use backend response directly instead of reloading
      if (response.success && response.data) {
        let backendItems = [];
        if (response.data.items && Array.isArray(response.data.items)) {
          backendItems = mapItemsToCartFormat(response.data.items);
        } else if (Array.isArray(response.data)) {
          backendItems = mapItemsToCartFormat(response.data);
        }
        
        // Update with backend data (this ensures consistency)
        if (backendItems.length > 0) {
          items.value = backendItems;
        }
      }
      
    } catch (err) {
      // Revert optimistic update on error
      if (itemToUpdate) {
        itemToUpdate.quantity = previousQuantity;
        itemToUpdate.subtotal = previousSubtotal;
      }
      
      if (err?.verificationRequired) {
        const message = resolveCartErrorMessage(err, verificationRequiredMessage);
        error.value = message;
        errorNotification(message);
      } else if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Debes iniciar sesión para modificar el carrito';
        errorNotification(error.value);
      } else {
        const message = resolveCartErrorMessage(err, 'Error al actualizar cantidad');
        error.value = message;
        errorNotification(message);
      }
    } finally {
      loading.value = false;
    }
  }

  async function clearCart() {
    const authStore = useAuthStore();
    
    if (!authStore.isAuthenticated) {
      items.value = [];
      return;
    }

    loading.value = true;
    error.value = null;
    
    try {
      await cartService.clearCart();
      items.value = [];
      success('Carrito vaciado');
      
    } catch (err) {
      if (err?.verificationRequired) {
        const message = resolveCartErrorMessage(err, verificationRequiredMessage);
        error.value = message;
        errorNotification(message);
      } else if (err?.status === 401 || err?.statusCode === 401) {
        error.value = 'Debes iniciar sesión para vaciar el carrito';
        errorNotification(error.value);
      } else {
        const message = resolveCartErrorMessage(err, 'Error al vaciar el carrito');
        error.value = message;
        errorNotification(message);
      }
    } finally {
      loading.value = false;
    }
  }

  // Función para resetear el carrito localmente (sin llamadas al servidor)
  function resetCart() {
    items.value = [];
    error.value = null;
  }

  // Funciones de UI (mantener compatibilidad)
  function toggleCart() {
    isOpen.value = !isOpen.value;
  }

  function openCart() {
    isOpen.value = true;
  }

  function closeCart() {
    isOpen.value = false;
  }

  // Inicializar carrito cuando se autentica
  const initializeCart = async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializing.value) {
      return;
    }
    
    // Si ya está cargando, simplemente esperar a que termine
    if (loading.value) {
      // Esperar hasta 5 segundos máximo
      let attempts = 0;
      while (loading.value && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      if (!loading.value) {
        return;
      }
    }
    
    isInitializing.value = true;
    try {
      await loadCart();
    } catch (error) {
      console.error('[Cart Store] Error inicializando carrito:', error);
      // Don't throw - allow app to continue even if cart init fails
    } finally {
      isInitializing.value = false;
    }
  };

  return {
    // Estado
    items,
    isOpen,
    loading,
    error,
    
    // Computed (mantenemos la misma API)
    cartItems,
    cartTotal,
    cartItemCount,
    isCartOpen,
    
    // Acciones
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    resetCart,
    toggleCart,
    openCart,
    closeCart,
    initializeCart
  };
});

// Exportar funciones individuales para mantener compatibilidad con el código existente
export { useCartStore as default };

// Crear una instancia del store para las exportaciones individuales
let cartStoreInstance = null;

function getCartStore() {
  if (!cartStoreInstance) {
    cartStoreInstance = useCartStore();
  }
  return cartStoreInstance;
}

// Exportar funciones individuales (compatibilidad backward)
export const cartItems = computed(() => getCartStore().cartItems);
export const cartTotal = computed(() => getCartStore().cartTotal);
export const cartItemCount = computed(() => getCartStore().cartItemCount);
export const isCartOpen = computed(() => getCartStore().isCartOpen);

export const addToCart = (product) => getCartStore().addToCart(product);
export const removeFromCart = (productId) => getCartStore().removeFromCart(productId);
export const updateQuantity = (productId, quantity) => getCartStore().updateQuantity(productId, quantity);
export const clearCart = () => getCartStore().clearCart();
export const toggleCart = () => getCartStore().toggleCart();
export const openCart = () => getCartStore().openCart();
export const closeCart = () => getCartStore().closeCart(); 