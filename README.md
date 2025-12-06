# Silverthorne Holdings - Frontend

Aplicación web frontend para Silverthorne Holdings, empresa dedicada a la prestación de servicios informáticos y venta de insumos tecnológicos. Desarrollada con Vue.js 3 y Vite.

## Características

- ✨ Diseño moderno y responsive
- 🚀 Vue.js 3 con Composition API
- ⚡ Vite para desarrollo rápido
- 📱 Completamente responsive
- 🎨 CSS puro sin dependencias externas
- 📧 Formulario de contacto funcional
- 🔄 Navegación suave entre secciones

## Secciones Incluidas

- **Header**: Barra de navegación fija con links suaves
- **Hero**: Sección principal con call-to-action
- **Acerca**: Información sobre la empresa/proyecto
- **Servicios**: Tarjetas con servicios ofrecidos
- **Contacto**: Formulario de contacto funcional
- **Footer**: Pie de página simple

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd silverthorne-holdings-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. **Configurar variables de entorno** (opcional para desarrollo)
   
   Para desarrollo local, las variables de entorno son opcionales ya que el frontend usa `http://localhost:4005` por defecto.
   
   Para producción, crea un archivo `.env.production` basándote en `.env.production.example`:
   ```env
    VITE_API_BASE_URL=https://tu-backend.vercel.app
    VITE_EMAILJS_SERVICE_ID=service_dsadsa
    VITE_EMAILJS_TEMPLATE_ID=template_dsadsad
    VITE_EMAILJS_PUBLIC_KEY=dsadsadsadfasdsa
   ```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador en `http://localhost:5173`

## Configuración para Despliegue

### Variables de Entorno en Vercel

Para desplegar el frontend en Vercel con un nombre diferente:

1. En el dashboard de Vercel, ve a Settings > Environment Variables
2. Agrega la variable `VITE_API_BASE_URL` con la URL de tu backend:
   - Ejemplo: `https://tu-backend-nombre.vercel.app`

### Auto-detección de Backend

El frontend intenta detectar automáticamente la URL del backend en producción basándose en el nombre del proyecto. Sin embargo, se recomienda configurar explícitamente `VITE_API_BASE_URL` para mayor control.

## Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Preview de la build de producción

## Personalización

### Colores
Los colores principales se pueden cambiar en el archivo `src/App.vue` en la sección de estilos:
- Color primario: `#007bff`
- Color de hover: `#0056b3`

### Contenido
El contenido principal de Silverthorne Holdings se encuentra en:
- `src/components/Header.vue` - Navegación y logo
- `src/components/Footer.vue` - Información de contacto y enlaces
- `src/views/Home.vue` - Página principal con información de servicios e insumos
- `src/views/Shop.vue` - Catálogo de insumos informáticos

### Estilos
Todos los estilos están en `src/App.vue` usando CSS puro. Puedes:
- Modificar la tipografía
- Cambiar colores y espaciados
- Ajustar el diseño responsive

## Estructura del Proyecto

```
src/
├── App.vue          # Componente principal con todo el contenido
├── main.js          # Punto de entrada de la aplicación
└── assets/          # Recursos estáticos (puedes agregar imágenes aquí)
```

## Tecnologías

- [Vue.js 3](https://vuejs.org/) - Framework JavaScript
- [Vite](https://vitejs.dev/) - Build tool
- CSS Grid y Flexbox para layouts
- CSS puro para estilos

## Licencia

Este proyecto es de uso libre. Puedes modificarlo y usarlo para tus propios proyectos.

---

---

**Silverthorne Holdings** - Servicios e Insumos Informáticos de calidad 🚀