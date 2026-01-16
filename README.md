<div align="center">
  <img src="./public/banner.png" alt="Stockcito Banner" width="100%" style="border-radius: 10px; margin-bottom: 20px;" />

  # Stockcito 🚀
  
  **El Sistema Operativo para tu Comercio**
  
  [![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

  <p align="center">
    <br />
    <a href="#-características">Características</a> •
    <a href="#-stack-tecnológico">Tecnología</a> •
    <a href="#-instalación">Instalación</a> •
    <a href="#-roadmap">Roadmap</a>
  </p>
</div>

---

## ⚡ Sobre el Proyecto

**Stockcito** redefine la gestión para comercios locales. No es solo un POS; es una plataforma integral que combina la potencia de la nube con la agilidad de una app nativa. Diseñado para eliminar la fricción en ventas, automatizar el control de stock y proporcionar inteligencia de negocio en tiempo real.

> *"La herramienta definitiva para dueños de negocios que quieren dejar de jugar a las tienditas y empezar a escalar."*

## ✨ Características

<table>
  <tr>
    <td width="50%">
      <h3 align="center">🛒 Smart POS</h3>
      <p align="center">Interfaz de venta optimizada para velocidad. Soporte para lectores de código de barras, control de caja y múltiples medios de pago. Cálculo automático de vueltos y descuentos.</p>
    </td>
    <td width="50%">
      <h3 align="center">📦 Inventario Vivo</h3>
      <p align="center">Control de stock en tiempo real. Alertas automáticas de bajo stock, gestión de proveedores, costos y márgenes de ganancia. Historial de movimientos detallado.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3 align="center">📊 Business Intelligence</h3>
      <p align="center">Reportes detallados de ventas, productos más vendidos y rendimiento de empleados. Toma decisiones basadas en datos, no en intuición.</p>
    </td>
    <td width="50%">
      <h3 align="center">👥 Gestión de Equipo</h3>
      <p align="center">Roles granulares (Owner, Admin, Manager, Cajero). Auditoría completa de acciones y control de acceso seguro con PIN o contraseña.</p>
    </td>
  </tr>
</table>

## 🛠 Stack Tecnológico

Estamos a la vanguardia del desarrollo web moderno (Bleeding Edge):

- **Core:** [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) + Framer Motion
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Estado Server:** Server Actions & React Server Components (RSC)
- **Autenticación:** JWT Seguro (Session-based)

## 🚀 Instalación

Sigue estos pasos para desplegar tu propia instancia de Stockcito.

### Prerrequisitos
- Node.js 20+
- Base de datos PostgreSQL (Recomendado: Supabase)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/stockcito.git
   cd stockcito
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   Copia el archivo `.env.example` a `.env` y completa tus credenciales.
   ```bash
   cp .env.example .env
   ```

4. **Inicializar Base de Datos**
   ```bash
   npx prisma migrate dev
   ```

5. **Lanzar en Desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) y disfruta.

## 🤝 Contribución

¡Tu ayuda es bienvenida! Si tienes ideas para mejorar Stockcito:

1. Haz un Fork del proyecto.
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
3. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4. Push a la rama (`git push origin feature/AmazingFeature`).
5. Abre un Pull Request.

## 📄 Licencia y Créditos

© 2026 **32bitsarg**. Todos los derechos reservados.

<br />

<p align="center">
  Hecho con 💜, Next.js 16 y <i>Vibecoding de alta calidad</i>.
</p>
