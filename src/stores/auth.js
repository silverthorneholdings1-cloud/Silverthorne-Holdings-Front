import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const isAuthenticated = ref(false);
  const isInitializing = ref(false);

  // Verificar si hay un token al iniciar
  const initializeAuth = async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializing.value) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    
    isInitializing.value = true;
    
    try {
      // Intentar obtener el email del token JWT para hacer la consulta
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const identifier = tokenPayload.email || tokenPayload.id;
      
      if (identifier) {
        const userProfile = await authService.getUserProfile(identifier);
        // El backend devuelve { success: true, data: { ...user } }
        // Intentar acceder a data primero, luego user, luego directamente
        const userData = userProfile?.data || userProfile?.user || userProfile;
        
        if (userData) {
          // Asegurar que el objeto usuario tenga todas las propiedades necesarias
          user.value = {
            _id: userData.id || userData._id || null,
            id: userData.id || userData._id || null,
            name: userData.name || 'Usuario',
            email: userData.email || 'usuario@ejemplo.com',
            telefono: userData.telefono || userData.phone || '',
            fechaNacimiento: userData.fecha_nacimiento || userData.fechaNacimiento || userData.birthDate || '',
            direccion: userData.direccion || userData.address || '',
            avatar: userData.avatar || '',
            role: userData.role || 'user',
            isVerified: userData.is_verified !== undefined ? userData.is_verified : (userData.isVerified !== undefined ? userData.isVerified : false),
            ...userData
          };
          isAuthenticated.value = true;
          
          // Inicializar carrito después de autenticación
          try {
            const { useCartStore } = await import('./cart');
            const cartStore = useCartStore();
            await cartStore.initializeCart();
          } catch (cartError) {
            // Error initializing cart - silently fail, cart will load when needed
            console.error('[Auth] Error inicializando carrito:', cartError);
          }
        } else {
          // Si no hay datos del usuario, limpiar autenticación
          localStorage.removeItem('token');
          user.value = null;
          isAuthenticated.value = false;
        }
      } else {
        // Si no hay identificador en el token, limpiar autenticación
        localStorage.removeItem('token');
        user.value = null;
        isAuthenticated.value = false;
      }
    } catch (error) {
      // Error initializing auth - silently fail and clear auth
      // Si falla la verificación, limpiar autenticación
      localStorage.removeItem('token');
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      isInitializing.value = false;
    }
  };
  
  // Inicializar la autenticación
  initializeAuth();

  async function register(userData) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.register(userData);
      
      // No establecemos usuario como autenticado hasta que verifique email
      // user.value = response.user;
      // isAuthenticated.value = false; // Requiere verificación
      
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.login(credentials);
      
      // Si el login fue exitoso y tenemos token
      if (response && response.token) {
        isAuthenticated.value = true;
        
        try {
          // Hacer segunda llamada para obtener datos del usuario
          // Usamos el email como identificador
          const userProfile = await authService.getUserProfile(credentials.email);
          
          // El backend devuelve { success: true, data: { ...user } }
          // Intentar acceder a data primero, luego user, luego directamente
          const userData = userProfile?.data || userProfile?.user || userProfile;
          
          if (userData) {
            // Asegurar que el objeto usuario tenga todas las propiedades necesarias
            user.value = {
              _id: userData.id || userData._id || null,
              id: userData.id || userData._id || null,
              name: userData.name || 'Usuario',
              email: userData.email || credentials.email,
              telefono: userData.telefono || userData.phone || '',
              fechaNacimiento: userData.fecha_nacimiento || userData.fechaNacimiento || userData.birthDate || '',
              direccion: userData.direccion || userData.address || '',
              avatar: userData.avatar || '',
              role: userData.role || 'user',
              isVerified: userData.is_verified !== undefined ? userData.is_verified : (userData.isVerified !== undefined ? userData.isVerified : false),
              ...userData
            };
          } else {
            // Fallback si no hay datos
            user.value = {
              _id: null,
              name: 'Usuario',
              email: credentials.email,
              telefono: '',
              fechaNacimiento: '',
              direccion: '',
              avatar: '',
              role: 'user'
            };
          }
        } catch (profileError) {
          // Error fetching user profile - log error for debugging
          console.error('[Auth] Error obteniendo perfil:', profileError);
          // Aunque falle obtener el perfil, mantenemos autenticado con datos básicos
          user.value = {
            _id: null,
            name: 'Usuario',
            email: credentials.email,
            telefono: '',
            fechaNacimiento: '',
            direccion: '',
            avatar: '',
            role: 'user'
          };
        }
        
        // Inicializar carrito después de autenticación exitosa
        try {
          const { useCartStore } = await import('./cart');
          const cartStore = useCartStore();
          await cartStore.initializeCart();
        } catch (cartError) {
          // Error initializing cart - silently fail, cart will load when needed
          console.error('[Auth] Error inicializando carrito después de login:', cartError);
        }
      } else {
        throw new Error('Login response does not contain token');
      }
      
      return response;
    } catch (err) {
      error.value = err;
      isAuthenticated.value = false;
      user.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function verifyEmail(token) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.verifyEmail(token);
      
      // Solo actualizar user si la respuesta incluye user data
      if (response.user && response.type === 'VERIFIED') {
        user.value = response.user;
        isAuthenticated.value = true;
        
        // Inicializar carrito después de verificación exitosa
        try {
          const { useCartStore } = await import('./cart');
          const cartStore = useCartStore();
          await cartStore.initializeCart();
        } catch (cartError) {
          // Error initializing cart - silently fail, cart will load when needed
          console.error('[Auth] Error inicializando carrito después de verificación:', cartError);
        }
      }
      
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    localStorage.removeItem('token');
    user.value = null;
    isAuthenticated.value = false;
  }

  async function requestPasswordReset(email) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.requestPasswordReset(email);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function resetPassword(token, password) {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    user,
    error,
    loading,
    isAuthenticated,
    register,
    login,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    logout
  };
}); 