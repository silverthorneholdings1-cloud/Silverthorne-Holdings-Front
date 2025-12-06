<template>
  <div class="admin-users">
    <div class="container">
      <div class="users-header">
        <h1>
          <font-awesome-icon icon="users" class="header-icon" />
          Gestión de Usuarios
        </h1>
        <div class="header-actions">
          <button @click="exportUsers" class="btn btn-export" :disabled="loading || filteredUsers.length === 0">
            <font-awesome-icon icon="chart-bar" class="btn-icon" />
            <span class="btn-text">Exportar CSV</span>
            <span class="btn-count" v-if="filteredUsers.length > 0">({{ filteredUsers.length }})</span>
          </button>
          <router-link to="/admin" class="btn btn-back">
            <font-awesome-icon icon="arrow-left" class="btn-icon" />
            <span class="btn-text">Dashboard</span>
          </router-link>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" v-if="stats">
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
            <font-awesome-icon icon="check-circle" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.verifiedUsers || 0 }}</h3>
            <p>Verificados</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="user-plus" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.newUsersThisMonth || 0 }}</h3>
            <p>Este Mes</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <font-awesome-icon icon="clock" class="stat-icon-svg" />
          </div>
          <div class="stat-info">
            <h3>{{ stats.activeUsers || 0 }}</h3>
            <p>Activos (30 días)</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label>Buscar usuarios:</label>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Nombre, email, dirección..." 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label>Rol:</label>
          <select v-model="roleFilter" class="filter-select">
            <option value="">Todos los roles</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Ordenar por:</label>
          <select v-model="sortBy" class="filter-select">
            <option value="name">Nombre</option>
            <option value="email">Email</option>
            <option value="created_at">Fecha de Registro</option>
            <option value="last_login">Última Actividad</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Dirección:</label>
          <select v-model="sortOrder" class="filter-select">
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-checkbox-label">
            <input 
              v-model="showInactive" 
              type="checkbox" 
              class="filter-checkbox"
            />
            <span>Mostrar usuarios desactivados</span>
          </label>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <font-awesome-icon icon="spinner" spin class="loading-icon" />
        <p>Cargando usuarios...</p>
      </div>

      <!-- Users Table -->
      <div v-else class="users-table">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Registro</th>
                <th>Última Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      <font-awesome-icon icon="user" class="avatar-icon" />
                    </div>
                    <div class="user-details">
                      <h4>{{ user.name || 'Sin nombre' }}</h4>
                      <p v-if="user.telefono">{{ user.telefono }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="user-email">{{ user.email }}</span>
                </td>
                <td>
                  <div class="role-status-container">
                    <span class="role-badge" :class="`role-${user.role}`">
                      {{ user.role === 'admin' ? 'Admin' : 'Usuario' }}
                    </span>
                    <span 
                      v-if="user.deleted_at || user.is_deleted === true || user.is_active === false" 
                      class="status-badge status-inactive"
                    >
                      Desactivado
                    </span>
                  </div>
                </td>
                <td>
                  <span class="contact-info">{{ user.telefono || 'No disponible' }}</span>
                </td>
                <td>
                  <span class="address-info">{{ user.direccion || 'No disponible' }}</span>
                </td>
                <td>
                  <span class="date-info">{{ formatDate(user.created_at) }}</span>
                </td>
                <td>
                  <span class="date-info">{{ formatDate(user.last_login) }}</span>
                </td>
                <td>
                  <div class="actions">
                    <button @click="viewUserDetails(user)" class="btn btn-sm btn-outline" title="Ver detalles">
                      <font-awesome-icon icon="eye" class="action-icon" />
                    </button>
                    <button 
                      v-if="!(user.deleted_at || user.is_deleted === true || user.is_active === false)"
                      @click="editUser(user)" 
                      class="btn btn-sm btn-outline" 
                      title="Editar usuario"
                    >
                      <font-awesome-icon icon="edit" class="action-icon" />
                    </button>
                    <button 
                      v-if="user.deleted_at || user.is_deleted === true || user.is_active === false"
                      @click="reactivateUser(user)" 
                      class="btn btn-sm btn-success" 
                      title="Reactivar usuario"
                      :disabled="reactivatingUser === user.id"
                    >
                      <font-awesome-icon 
                        :icon="reactivatingUser === user.id ? 'spinner' : 'undo'" 
                        :spin="reactivatingUser === user.id"
                        class="action-icon" 
                      />
                      Reactivar
                    </button>
                    <button 
                      v-if="!(user.deleted_at || user.is_deleted === true || user.is_active === false)"
                      @click="deleteUser(user)" 
                      class="btn btn-sm btn-danger" 
                      title="Eliminar usuario"
                    >
                      <font-awesome-icon icon="trash" class="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredUsers.length === 0" class="no-users">
          <div class="empty-state">
            <div class="empty-icon">
              <font-awesome-icon icon="users" class="empty-icon-svg" />
            </div>
            <h3>No hay usuarios</h3>
            <p>No se encontraron usuarios con los filtros seleccionados</p>
          </div>
        </div>
      </div>

      <!-- User Details Modal -->
      <div v-if="selectedUser" class="modal-overlay" @click="closeUserDetails">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Detalles del Usuario</h2>
            <button @click="closeUserDetails" class="close-btn">
              <font-awesome-icon icon="times" class="close-icon" />
            </button>
          </div>
          
          <div class="modal-body" v-if="selectedUser">
            <div class="user-details-section">
              <div class="user-avatar-large">
                <font-awesome-icon icon="user" class="avatar-icon-large" />
              </div>
              <h3>{{ selectedUser.name || 'Sin nombre' }}</h3>
            </div>

            <div class="user-info-section">
              <h3>Información Personal</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ selectedUser.email }}</span>
                </div>
                <div class="info-item">
                  <label>Teléfono:</label>
                  <span>{{ selectedUser.telefono || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <label>Dirección:</label>
                  <span>{{ selectedUser.direccion || 'No disponible' }}</span>
                </div>
                <div class="info-item">
                  <label>Rol:</label>
                  <span class="role-badge" :class="`role-${selectedUser.role}`">
                    {{ selectedUser.role === 'admin' ? 'Administrador' : 'Usuario' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Verificado:</label>
                  <span :class="selectedUser.is_verified ? 'status-verified' : 'status-unverified'">
                    {{ selectedUser.is_verified ? 'Sí' : 'No' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Fecha de Registro:</label>
                  <span>{{ formatDate(selectedUser.created_at) }}</span>
                </div>
                <div class="info-item">
                  <label>Última Actividad:</label>
                  <span>{{ formatDate(selectedUser.last_login) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeUserDetails" class="btn btn-secondary">Cerrar</button>
            <button @click="editUserFromDetails" class="btn btn-primary">
              <font-awesome-icon icon="edit" class="btn-icon" />
              Editar Usuario
            </button>
          </div>
        </div>
      </div>

      <!-- User Edit Modal -->
      <Modal
        v-model:show="showEditModal"
        title="Editar Usuario"
        icon="edit"
        max-width="lg"
        @close="closeEditModal"
      >
        <form @submit.prevent="submitUserEdit" class="user-form">
          <div class="form-group">
            <label>Nombre *</label>
            <input 
              v-model="userForm.name" 
              type="text" 
              required 
              placeholder="Nombre completo"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="userForm.email" 
              type="email" 
              required 
              placeholder="email@ejemplo.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Teléfono</label>
            <input 
              v-model="userForm.telefono" 
              type="text" 
              placeholder="+56 9 1234 5678"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <textarea 
              v-model="userForm.direccion" 
              placeholder="Dirección completa"
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Rol *</label>
            <select v-model="userForm.role" required class="form-select">
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="form-group">
            <div class="verification-display">
              <font-awesome-icon 
                :icon="userForm.is_verified ? 'check-circle' : 'times-circle'" 
                :class="userForm.is_verified ? 'verified' : 'unverified'"
              />
              <span>{{ userForm.is_verified ? 'Usuario Verificado' : 'Usuario No Verificado' }}</span>
            </div>
          </div>
        </form>

        <template #footer>
          <button type="button" @click="closeEditModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="button" @click="submitUserEdit" :disabled="submitting" class="btn btn-primary">
            {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminService } from '../services/api'
import { useNotifications } from '../composables/useNotifications'
import Modal from '../components/Modal.vue'

const { success, error } = useNotifications()

// State
const users = ref([])
const stats = ref(null)
const loading = ref(false)
const searchTerm = ref('')
const roleFilter = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')
const showInactive = ref(false)
const selectedUser = ref(null)
const showEditModal = ref(false)
const submitting = ref(false)
const reactivatingUser = ref(null)

// Form data for editing
const userForm = ref({
  id: null,
  name: '',
  email: '',
  telefono: '',
  direccion: '',
  role: 'user',
  is_verified: false
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtrar usuarios activos/inactivos según el checkbox
  if (!showInactive.value) {
    // Mostrar solo usuarios activos (no tienen deleted_at o is_deleted = false)
    filtered = filtered.filter(user => 
      !user.deleted_at && user.is_deleted !== true && user.is_active !== false
    )
  } else {
    // Mostrar solo usuarios desactivados
    filtered = filtered.filter(user => 
      user.deleted_at || user.is_deleted === true || user.is_active === false
    )
  }

  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.telefono?.toLowerCase().includes(term) ||
      user.direccion?.toLowerCase().includes(term)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  // Ordenar los resultados
  filtered.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'name':
        aValue = (a.name || '').toLowerCase()
        bValue = (b.name || '').toLowerCase()
        break
      case 'email':
        aValue = (a.email || '').toLowerCase()
        bValue = (b.email || '').toLowerCase()
        break
      case 'created_at':
        aValue = new Date(a.created_at || 0)
        bValue = new Date(b.created_at || 0)
        break
      case 'last_login':
        aValue = new Date(a.last_login || 0)
        bValue = new Date(b.last_login || 0)
        break
      default:
        aValue = a[sortBy.value] || ''
        bValue = b[sortBy.value] || ''
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  return filtered
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await adminService.getAllUsers()
    // Response from service is: { success: true, data: { users: [...], total: ... } }
    // Handle new response format: { success: true, data: { users: [...] } }
    // Or legacy format: { success: true, data: [...] } (array directly)
    let usersArray = []
    
    if (response?.success) {
      // New format: response.data is an object with users property
      if (response.data?.users && Array.isArray(response.data.users)) {
        usersArray = response.data.users
      }
      // Legacy format: response.data is directly an array
      else if (Array.isArray(response.data)) {
        usersArray = response.data
      }
    }
    
    users.value = usersArray
    
    // Calcular estadísticas
    calculateStats()
  } catch (err) {
    console.error('[AdminUsers] Error loading users:', err);
    error('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const totalUsers = users.value.length
  const verifiedUsers = users.value.filter(u => u.is_verified).length
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const newUsersThisMonth = users.value.filter(u => {
    const userDate = new Date(u.created_at)
    return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
  }).length

  const activeUsers = users.value.filter(u => {
    if (!u.last_login) return false
    const lastLogin = new Date(u.last_login)
    return lastLogin >= thirtyDaysAgo
  }).length

  stats.value = {
    totalUsers,
    verifiedUsers,
    newUsersThisMonth,
    activeUsers
  }
}





const exportUsers = () => {
  if (filteredUsers.value.length === 0) {
    error('No hay usuarios para exportar')
    return
  }
  
  try {
    const csvContent = generateCSV(filteredUsers.value)
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `usuarios_${timestamp}.csv`
    downloadCSV(csvContent, filename)
    success(`✅ Exportados ${filteredUsers.value.length} usuarios exitosamente`)
  } catch (err) {
    error('❌ Error al exportar la lista de usuarios')
  }
}

const generateCSV = (users) => {
  const headers = ['Nombre', 'Email', 'Rol', 'Teléfono', 'Dirección', 'Verificado', 'Fecha Registro', 'Última Actividad']
  const rows = users.map(user => [
    user.name || '',
    user.email || '',
    user.role || '',
    user.telefono || '',
    user.direccion || '',
    user.is_verified ? 'Sí' : 'No',
    formatDate(user.created_at),
    formatDate(user.last_login)
  ])
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

const viewUserDetails = async (user) => {
  try {
    // Cargar detalles completos del usuario desde el API
    if (user.id) {
      loading.value = true
      const response = await adminService.getUserById(user.id)
      selectedUser.value = response.data || user
    } else {
      selectedUser.value = user
    }
  } catch (err) {
    // Si falla, usar los datos que ya tenemos
    selectedUser.value = user
    error('Error al cargar detalles del usuario')
  } finally {
    loading.value = false
  }
}

const closeUserDetails = () => {
  selectedUser.value = null
}

const editUser = (user) => {
  userForm.value = {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    role: user.role || 'user',
    is_verified: user.is_verified || false
  }
  showEditModal.value = true
}

const editUserFromDetails = () => {
  if (selectedUser.value) {
    editUser(selectedUser.value)
    closeUserDetails()
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  userForm.value = {
    id: null,
    name: '',
    email: '',
    telefono: '',
    direccion: '',
    role: 'user',
    is_verified: false
  }
}

const submitUserEdit = async () => {
  submitting.value = true
  try {
    if (!userForm.value.id) {
      error('Error: ID de usuario no encontrado')
      return
    }

    // Prepare update data, ensuring no undefined values are sent
    const updateData = {}
    
    // Always include required fields
    if (userForm.value.name !== undefined && userForm.value.name !== null) {
      updateData.name = userForm.value.name
    }
    if (userForm.value.email !== undefined && userForm.value.email !== null) {
      updateData.email = userForm.value.email
    }
    if (userForm.value.role !== undefined && userForm.value.role !== null) {
      updateData.role = userForm.value.role
    }
    if (userForm.value.is_verified !== undefined && userForm.value.is_verified !== null) {
      updateData.is_verified = Boolean(userForm.value.is_verified)
    }

    // Handle telefono - send null if empty, otherwise send the value
    if (userForm.value.telefono !== undefined) {
      updateData.telefono = (userForm.value.telefono && userForm.value.telefono.trim() !== '') 
        ? userForm.value.telefono.trim() 
        : null
    }

    // Handle direccion - send null if empty, otherwise send the value
    if (userForm.value.direccion !== undefined) {
      updateData.direccion = (userForm.value.direccion && userForm.value.direccion.trim() !== '') 
        ? userForm.value.direccion.trim() 
        : null
    }

    await adminService.updateUser(userForm.value.id, updateData)

    success('Usuario actualizado correctamente')
    await loadUsers()
    closeEditModal()
  } catch (err) {
    error(err.message || 'Error al actualizar usuario')
  } finally {
    submitting.value = false
  }
}

const deleteUser = async (user) => {
  if (!user.id) {
    error('Error: ID de usuario no encontrado')
    return
  }

  if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.name || user.email}"?\n\nEsta acción realizará un soft delete.`)) {
    return
  }

  try {
    await adminService.deleteUser(user.id)
    success('Usuario eliminado correctamente')
    await loadUsers()
  } catch (err) {
    error(err.message || 'Error al eliminar usuario')
  }
}

const reactivateUser = async (user) => {
  if (!user.id) {
    error('Error: ID de usuario no encontrado')
    return
  }

  if (!confirm(`¿Estás seguro de que quieres reactivar al usuario "${user.name || user.email}"?`)) {
    return
  }

  reactivatingUser.value = user.id
  try {
    await adminService.reactivateUser(user.id)
    success('Usuario reactivado correctamente')
    await loadUsers()
  } catch (err) {
    error(err.message || 'Error al reactivar usuario')
  } finally {
    reactivatingUser.value = null
  }
}

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.admin-users {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: #f8f9fa;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.users-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
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
}

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

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.875rem;
}

.filter-input, .filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.filter-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  margin-top: 1.5rem;
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007bff;
}

.loading {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.users-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #555;
}

/* Columnas de fecha - Registro y Última Actividad */
th:nth-child(6),
td:nth-child(6) {
  min-width: 180px;
  white-space: nowrap;
}

th:nth-child(7),
td:nth-child(7) {
  min-width: 180px;
  white-space: nowrap;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: 2px solid #007bff;
}

.avatar-icon {
  color: white;
  font-size: 1.2rem;
}

.user-details h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 0.95rem;
}

.user-details p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.user-email {
  color: #666;
  font-size: 0.875rem;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
  min-width: 60px;
}

.role-badge.role-admin {
  background: #dc3545;
  color: white;
}

.role-badge.role-user {
  background: #28a745;
  color: white;
}

.role-status-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  display: inline-block;
}

.status-badge.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}


.contact-info {
  color: #666;
  font-size: 0.875rem;
}

.address-info {
  color: #666;
  font-size: 0.875rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-info {
  color: #666;
  font-size: 0.875rem;
}

.btn-export {
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-export:hover:not(:disabled) {
  background: #218838;
}

.btn-export:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-back {
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s;
  text-decoration: none;
}

.btn-back:hover {
  background: #5a6268;
  color: white;
  text-decoration: none;
}

.btn-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 0.25rem;
}


.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-icon {
  font-size: 0.875rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-success:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.no-users {
  padding: 4rem;
  text-align: center;
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  color: #666;
}


/* Responsive */
@media (max-width: 768px) {
  .users-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }
  
  .btn-export, .btn-back {
    flex: 1;
    padding: 0.6rem 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-input, .filter-select {
    min-width: auto;
  }
  
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  color: #dc3545;
  transform: scale(1.1);
}

.close-icon {
  font-size: 1rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.user-details-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f8f9fa;
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 1rem;
  border: 4px solid #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.avatar-icon-large {
  color: white;
  font-size: 4rem;
}

.user-details-section h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.user-info-section {
  margin-top: 2rem;
}

.user-info-section h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f8f9fa;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.info-item span {
  color: #333;
  font-size: 0.95rem;
}

.status-verified {
  color: #28a745;
  font-weight: 600;
}

.status-unverified {
  color: #dc3545;
  font-weight: 600;
}

/* Form Styles */
.user-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea {
  resize: vertical;
}

.form-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #007bff;
}

.verification-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.verification-display .verified {
  color: #28a745;
}

.verification-display .unverified {
  color: #dc3545;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-icon {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
