<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3><font-awesome-icon icon="shopping-cart" class="footer-brand-icon" /> Silverthorne Holdings</h3>
          <p>Servicios informáticos profesionales e insumos tecnológicos de calidad</p>
        </div>
        <div class="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><router-link to="/">Inicio</router-link></li>
            <li><router-link to="/shop">Tienda</router-link></li>
            <li><router-link to="/cart">Carrito</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p><font-awesome-icon icon="envelope" class="contact-icon" /> info@silverthorneholdings.com</p>
          <p><font-awesome-icon icon="phone" class="contact-icon" /> +1 (555) 123-4567</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Silverthorne Holdings. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// No necesita lógica adicional por ahora
</script>

<style scoped>
/* Footer */
.footer {
  background: linear-gradient(135deg, var(--color-quaternary) 0%, var(--color-tertiary) 100%);
  color: var(--color-white);
  padding: var(--spacing-5xl) 0 var(--spacing-lg);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-3xl);
  margin-bottom: var(--spacing-3xl);
}

.footer-section h3,
.footer-section h4 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.footer-section h3 {
  font-size: var(--font-size-xl);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-brand-icon {
  color: var(--icon-footer-brand);
  font-size: 1.2rem;
  transition: color var(--transition-normal);
}

.footer-section h3:hover .footer-brand-icon {
  color: var(--icon-footer-brand-hover);
}

.footer-section h4 {
  font-size: var(--font-size-lg);
}

.footer-section p {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-gray-200);
  line-height: var(--line-height-relaxed);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-icon {
  color: var(--icon-footer-contact);
  font-size: 0.9rem;
  transition: color var(--transition-normal);
  min-width: 16px;
}

.footer-section p:hover .contact-icon {
  color: var(--icon-footer-contact-hover);
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: var(--spacing-sm);
}

.footer-section ul li a {
  color: var(--color-gray-200);
  text-decoration: none;
  transition: all var(--transition-normal);
  padding: var(--spacing-xs) 0;
  display: inline-block;
}

.footer-section ul li a:hover {
  color: var(--color-primary);
  transform: translateX(var(--spacing-xs));
}

.footer-bottom {
  text-align: center;
  padding-top: var(--spacing-3xl);
  border-top: var(--border-width-thin) solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
  margin: 0;
  color: var(--color-gray-300);
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .footer {
    padding: var(--spacing-4xl) 0 var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .footer {
    padding: var(--spacing-2xl) 0 var(--spacing-md);
  }
  
  .footer-content {
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }
  
  .footer-section {
    margin-bottom: var(--spacing-lg);
  }
  
  .footer-section h3 {
    font-size: var(--font-size-lg);
    justify-content: center;
    margin-bottom: var(--spacing-md);
  }
  
  .footer-brand-icon {
    font-size: 1rem;
  }
  
  .footer-section h4 {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-sm);
  }
  
  .footer-section p {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .contact-icon {
    font-size: 0.85rem;
  }
  
  .footer-section ul {
    margin-top: var(--spacing-sm);
  }
  
  .footer-section ul li {
    margin-bottom: var(--spacing-xs);
  }
  
  .footer-section ul li a {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) 0;
    display: block;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .footer-bottom {
    padding-top: var(--spacing-lg);
    margin-top: var(--spacing-lg);
  }
  
  .footer-bottom p {
    font-size: var(--font-size-xs);
    line-height: 1.5;
  }
}
</style> 