<template>
  <div class="contact">
    <section class="contact-hero">
      <div class="container">
        <div class="hero-content">
          <h1>
            <font-awesome-icon icon="envelope" class="hero-icon" />
            Contáctanos
          </h1>
          <p>Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.</p>
        </div>
      </div>
    </section>

    <section class="contact-form-section">
      <div class="container">
        <div class="form-container">
          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="form-group">
              <label for="name">Nombre *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Tu nombre completo"
                required
                :class="{ 'error': errors.name }"
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="tu@email.com"
                required
                :class="{ 'error': errors.email }"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="subject">Asunto *</label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                placeholder="¿Sobre qué quieres contactarnos?"
                required
                :class="{ 'error': errors.subject }"
              />
              <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
            </div>

            <div class="form-group">
              <label for="message">Mensaje *</label>
              <textarea
                id="message"
                v-model="form.message"
                rows="6"
                placeholder="Escribe tu mensaje aquí..."
                required
                :class="{ 'error': errors.message }"
              ></textarea>
              <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
              <span class="char-count">{{ form.message.length }}/5000</span>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary btn-submit"
              :disabled="loading"
            >
              <font-awesome-icon 
                v-if="loading" 
                icon="spinner" 
                :spin="loading" 
                class="btn-icon" 
              />
              <font-awesome-icon 
                v-else 
                icon="envelope" 
                class="btn-icon" 
              />
              {{ loading ? 'Enviando...' : 'Enviar Mensaje' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { contactService } from '../services/api'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()
const { success, error, warning } = notificationStore

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const loading = ref(false)

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Validate name
  if (!form.name.trim()) {
    errors.name = 'El nombre es requerido'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  } else if (form.name.trim().length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres'
    isValid = false
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'El email es requerido'
    isValid = false
  } else if (!emailRegex.test(form.email.trim())) {
    errors.email = 'El formato del email no es válido'
    isValid = false
  }

  // Validate subject
  if (!form.subject.trim()) {
    errors.subject = 'El asunto es requerido'
    isValid = false
  } else if (form.subject.trim().length < 3) {
    errors.subject = 'El asunto debe tener al menos 3 caracteres'
    isValid = false
  } else if (form.subject.trim().length > 200) {
    errors.subject = 'El asunto no puede exceder 200 caracteres'
    isValid = false
  }

  // Validate message
  if (!form.message.trim()) {
    errors.message = 'El mensaje es requerido'
    isValid = false
  } else if (form.message.trim().length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres'
    isValid = false
  } else if (form.message.trim().length > 5000) {
    errors.message = 'El mensaje no puede exceder 5000 caracteres'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    warning('Por favor, corrige los errores en el formulario')
    return
  }

  loading.value = true

  try {
    const response = await contactService.submitContactForm({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim()
    })

    success(response.message || 'Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.')

    // Reset form
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    Object.keys(errors).forEach(key => {
      errors[key] = ''
    })
  } catch (err) {
    const errorMessage = err.error || err.message || 'Error al enviar el mensaje. Por favor, intenta de nuevo.'
    error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact {
  margin-top: var(--header-height);
}

/* Hero Section */
.contact-hero {
  background: linear-gradient(135deg, var(--color-tertiary) 0%, var(--color-quaternary) 100%);
  color: var(--color-white);
  padding: var(--spacing-6xl) 0 var(--spacing-5xl);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.contact-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-extrabold);
  margin: 0 0 var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hero-icon {
  color: var(--icon-home-hero);
  font-size: 1.1em;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.hero-content p {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-normal);
  margin: 0;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: var(--line-height-relaxed);
}

/* Form Section */
.contact-form-section {
  padding: var(--spacing-6xl) 0;
  background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-primary-light) 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.form-container {
  max-width: 700px;
  margin: 0 auto;
  background: var(--color-white);
  padding: var(--spacing-5xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-tertiary);
  font-size: var(--font-size-base);
}

.form-group input,
.form-group textarea {
  padding: var(--spacing-md);
  border: var(--border-width-thin) solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
  transition: all var(--transition-normal);
  background: var(--color-white);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.form-group textarea {
  resize: vertical;
  min-height: 150px;
}

.error-message {
  color: #ef4444;
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  text-align: right;
  margin-top: var(--spacing-xs);
}

.btn-submit {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-3xl);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  min-height: 50px;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1em;
}

@media (max-width: 768px) {
  .contact-hero {
    padding: var(--spacing-4xl) 0 var(--spacing-3xl);
  }
  .hero-content h1 {
    font-size: var(--font-size-3xl);
  }
  .hero-content p {
    font-size: var(--font-size-lg);
  }
  .contact-form-section {
    padding: var(--spacing-4xl) 0;
  }
  .container {
    padding: 0 var(--spacing-lg);
  }
  .form-container {
    padding: var(--spacing-3xl);
  }
  .contact-form {
    gap: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .contact {
    margin-top: var(--header-height);
  }
  .contact-hero {
    padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  }
  .hero-content h1 {
    font-size: var(--font-size-xl);
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  .hero-icon {
    font-size: 1em;
  }
  .hero-content p {
    font-size: var(--font-size-base);
    padding: 0 var(--spacing-md);
  }
  .contact-form-section {
    padding: var(--spacing-2xl) 0;
  }
  .container {
    padding: 0 var(--spacing-md);
  }
  .form-container {
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
  }
  .contact-form {
    gap: var(--spacing-md);
  }
  .form-group {
    gap: var(--spacing-xs);
  }
  .form-group label {
    font-size: var(--font-size-sm);
  }
  .form-group input,
  .form-group textarea {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
  .form-group textarea {
    min-height: 120px;
    rows: 5;
  }
  .error-message {
    font-size: var(--font-size-xs);
  }
  .char-count {
    font-size: var(--font-size-xs);
  }
  .btn-submit {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    width: 100%;
    min-height: 44px;
  }
}
</style>

