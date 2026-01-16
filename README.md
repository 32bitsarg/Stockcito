# Stockcito 🚀

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-teal?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)

**Stockcito** es una solución integral de gestión de inventario y punto de venta (POS) diseñada para pequeñas y medianas empresas. Combina la potencia de una aplicación web moderna con la robustez de una base de datos PostgreSQL en la nube.

## ✨ Características Principales

*   **🛒 Punto de Venta (POS) Moderno**: Interfaz intuitiva y rápida para procesar ventas al instante.
*   **📦 Gestión de Inventario**: Control total de stock, productos, categorías y proveedores. Alertar de stock bajo.
*   **👥 Gestión de Clientes y Proveedores**: Base de datos centralizada para tus contactos comerciales.
*   **📊 Dashboard y Reportes**: Visualiza el rendimiento de tu negocio con métricas clave.
*   **🔒 Roles y Permisos**: Control de acceso granular para dueños, administradores y cajeros.
*   **☁️ Cloud Native**: Base de datos PostgreSQL alojada en **Supabase** para máxima escalabilidad y seguridad.
*   **🎨 Temas Personalizables**: Adapta la apariencia de la aplicación a tu marca (Premium).

## 🛠️ Tecnologías

*   **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn/UI.
*   **Backend**: Server Actions, Prisma ORM.
*   **Base de Datos**: PostgreSQL (via Supabase).
*   **Pago**: MercadoPago Integration.

## 🚀 Comenzando

Sigue estos pasos para configurar el proyecto localmente.

### Prerrequisitos

*   Node.js 18+
*   NPM o Bun
*   Cuenta en Supabase

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/tu-usuario/stockcito.git
    cd stockcito
    ```

2.  **Instalar dependencias**
    ```bash
    npm install
    # o
    bun install
    ```

3.  **Configurar Variables de Entorno**
    Copia el archivo de ejemplo y configúralo con tus credenciales.
    ```bash
    cp .env.example .env
    ```
    > **Nota:** Necesitarás obtener las credenciales de tu proyecto en Supabase (Database URL y claves API).

4.  **Inicializar Base de Datos**
    Ejecuta las migraciones para crear la estructura de la base de datos.
    ```bash
    npx prisma migrate dev
    ```

5.  **Iniciar Servidor de Desarrollo**
    ```bash
    npm run dev
    ```
    Visita `http://localhost:3000` en tu navegador.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un Pull Request para mejoras y correcciones.

## 📄 Licencia

Este proyecto es propietario y confidencial.

---
Hecho con ❤️ por [Tu Nombre/Empresa]
