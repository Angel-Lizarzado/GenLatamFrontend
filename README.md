# GenLatam: Frontend Ecosystem (Next.js)

Este repositorio contiene la arquitectura Frontend (Interfaz de Usuario) para el Hub de Proyectos y Casos de Éxito de "GenLatam". Ha sido codificado como el Rostro principal del sistema Headless acoplado al respectivo Backend (Strapi).

## 🚀 Filosofía de la Arquitectura
Apostamos por una experiencia premium y nativa B2B (Business to Business). El proyecto evita adrede los gestores de bloques tradicionales que inyectan CSS basura. Hemos modelado el código sobre Vanilla CSS puro (Módulos) y **Glassmorphism**, garantizando animaciones limpias, layouts corporativos inquebrantables, sin librerías estrafalarias arrastrando el rendimiento. 

### Multi-Tenant System
1. Este App router consume un solo ecosistema Strapi.
2. Contiene Rutas dinámicas e independientes de sub-marcas de los activistas (`/exit` y `/guarimba`). 
3. Pensado desde el día cero para que estas ramas de interfaz sean extraídas hacia repositorios aislados y sirvan dominios únicos (Ej. `guarimbadigital.com`) si se precisa **Arquitectura Escalable Multiple Tenant**, todos consumiendo de la misma API Centralizada GenLatam.

## 🛠 Features
- **Next.js 14** via App Router (Velocidad de compilación React Server Components).
- **TypeScript** tipado estricto previniendo errores en run-time.
- **SSR & Fallbacks** previniendo la página blanca (`500s`) incluso si el Backend estallara por picos vírales.
- **Glassmorphism B2B Interface**: Sombras fluidas, cápsulas de componentes interactivas enfocadas en retención de lector Ejecutivo/Corporativo.

## 💻 Entorno Local
Requerirás Node.JS v18+ y el enlace o IP de tu Strapi vivo.
```bash
# 1. Copia el archivo .env default y define la URL pública hacia el Strapi:
echo 'NEXT_PUBLIC_STRAPI_URL="URL-HACIA-EL-BACKEND"' > .env

# 2. Instala los paquetes:
npm install

# 3. Arranca el Server localmente
npm run dev
```

El proyecto estará listo para observarse por Vercel con "Cero Configuración" si se envía a la rama Principal, una vez seteado el `Environment Variable` en el panel de Vercel.
