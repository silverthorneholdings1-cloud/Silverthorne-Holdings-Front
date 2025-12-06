/**
 * Preloader utility for prefetching API data
 * Handles intelligent prefetching of data based on routes and user state
 */

import { productService, cartService, authService } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import logger from './logger';

// Cache to prevent duplicate prefetch calls
const prefetchCache = new Map();
const PREFETCH_CACHE_TTL = 30000; // 30 seconds

/**
 * Check if data should be prefetched (not in cache or cache expired)
 */
function shouldPrefetch(key) {
  const cached = prefetchCache.get(key);
  if (!cached) return true;
  
  const now = Date.now();
  if (now - cached.timestamp > PREFETCH_CACHE_TTL) {
    prefetchCache.delete(key);
    return true;
  }
  
  return false;
}

/**
 * Mark data as prefetched
 */
function markPrefetched(key) {
  prefetchCache.set(key, { timestamp: Date.now() });
}

/**
 * Prefetch categories (used in Shop and other routes)
 */
export async function prefetchCategories() {
  const key = 'categories';
  if (!shouldPrefetch(key)) return;
  
  try {
    await productService.getCategories();
    markPrefetched(key);
  } catch (error) {
    // Silently fail - don't block navigation
    logger.error('Prefetch categories error:', error);
  }
}

/**
 * Prefetch featured products (used in Home)
 */
export async function prefetchFeaturedProducts() {
  const key = 'featured-products';
  if (!shouldPrefetch(key)) return;
  
  try {
    await productService.getFeaturedProducts({ limit: 8 });
    markPrefetched(key);
  } catch (error) {
    logger.error('Prefetch featured products error:', error);
  }
}

/**
 * Prefetch on-sale products (used in Offers)
 */
export async function prefetchOnSaleProducts() {
  const key = 'on-sale-products';
  if (!shouldPrefetch(key)) return;
  
  try {
    await productService.getOnSaleProducts({ limit: 8 });
    markPrefetched(key);
  } catch (error) {
    logger.error('Prefetch on-sale products error:', error);
  }
}

/**
 * Prefetch product details by ID
 */
export async function prefetchProduct(productId) {
  const key = `product-${productId}`;
  if (!shouldPrefetch(key)) return;
  
  try {
    await productService.getProductById(productId);
    markPrefetched(key);
  } catch (error) {
    logger.error(`Prefetch product ${productId} error:`, error);
  }
}

/**
 * Prefetch shop products list
 */
export async function prefetchShopProducts() {
  const key = 'shop-products';
  if (!shouldPrefetch(key)) return;
  
  try {
    await Promise.all([
      prefetchCategories(),
      productService.getAllProducts({ limit: 12, page: 1 })
    ]);
    markPrefetched(key);
  } catch (error) {
    logger.error('Prefetch shop products error:', error);
  }
}

/**
 * Prefetch cart data (if user is authenticated)
 */
export async function prefetchCart() {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) return;
  
  const key = 'cart';
  if (!shouldPrefetch(key)) return;
  
  try {
    const cartStore = useCartStore();
    // Use the store's loadCart method to ensure data is cached in Pinia
    await cartStore.loadCart();
    markPrefetched(key);
  } catch (error) {
    logger.error('Prefetch cart error:', error);
  }
}

/**
 * Prefetch user profile (if authenticated)
 */
export async function prefetchUserProfile() {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || !authStore.user) return;
  
  const key = 'user-profile';
  if (!shouldPrefetch(key)) return;
  
  try {
    const identifier = authStore.user.email || authStore.user.id;
    if (identifier) {
      await authService.getUserProfile(identifier);
      markPrefetched(key);
    }
  } catch (error) {
    logger.error('Prefetch user profile error:', error);
  }
}

/**
 * Prefetch checkout data (cart + user profile)
 */
export async function prefetchCheckoutData() {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) return;
  
  try {
    await Promise.all([
      prefetchCart(),
      prefetchUserProfile()
    ]);
  } catch (error) {
    logger.error('Prefetch checkout data error:', error);
  }
}

/**
 * Prefetch admin data based on route
 */
export async function prefetchAdminData(routeName) {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') return;
  
  try {
    const { adminService } = await import('../services/api');
    
    switch (routeName) {
      case 'AdminDashboard':
        // Prefetch all data needed for dashboard
        await Promise.all([
          adminService.getOrderStats(),
          adminService.getAllProducts(),
          adminService.getAllOrders(),
          adminService.getAllUsers()
        ]);
        break;
      case 'AdminProducts':
        await adminService.getAllProducts();
        break;
      case 'AdminOrders':
        await adminService.getAllOrders();
        await adminService.getOrderStats();
        break;
      case 'AdminUsers':
        await adminService.getAllUsers();
        await adminService.getUserStats();
        break;
    }
  } catch (error) {
    logger.error('Prefetch admin data error:', error);
  }
}

/**
 * Preload critical data on app initialization
 * This should be called once when the app starts
 */
export async function preloadCriticalData() {
  try {
    const authStore = useAuthStore();
    
    // Always prefetch: categories and featured products
    const criticalPromises = [
      prefetchCategories(),
      prefetchFeaturedProducts()
    ];
    
    // If authenticated, also prefetch user data and cart
    if (authStore.isAuthenticated) {
      criticalPromises.push(
        prefetchUserProfile(),
        prefetchCart()
      );
    }
    
    // Execute all prefetches in parallel, but don't wait for them
    Promise.all(criticalPromises).catch(error => {
      logger.error('Preload critical data error:', error);
    });
  } catch (error) {
    logger.error('Preload critical data error:', error);
  }
}

/**
 * Clear prefetch cache (useful for testing or forced refresh)
 */
export function clearPrefetchCache() {
  prefetchCache.clear();
}

