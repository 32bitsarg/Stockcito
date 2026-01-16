---
description: Stockcito Design System & Theme Configuration
---

# Stockcito Design System

Estándares de diseño y configuración de temas para la aplicación. Aseguramos consistencia visual entre Light y Dark mode.

## Paleta de Colores (OKLCH)

Utilizamos el espacio de color `OKLCH` por su percepción uniforme y amplia gama.

### Modo Claro (Light)
El objetivo es limpieza, legibilidad y sensación de "papel digital".

- **Background:** `oklch(1 0 0)` (Blanco Puro #FFFFFF)
- **Foreground:** `oklch(0.145 0 0)` (Gris Oscuro #202020)
- **Primary:** `oklch(0.55 0.22 264)` (Violeta Intenso - Brand Color)
- **Surface/Card:** `oklch(1 0 0)` (Igual al fondo, diferenciado por borde)
- **Border:** `oklch(0.922 0 0)` (Gris muy suave)

### Modo Oscuro (Dark)
El objetivo es reducir fatiga visual y ofrecer una estética "Premium/Dev".

- **Background:** `oklch(0.10 0 0)` (Negro Profundo, casi #101010) - *Recomendado para alto contraste*
- **Foreground:** `oklch(0.985 0 0)` (Blanco Hueso #FAFAFA por suavidad)
- **Primary:** `oklch(0.922 0 0)` (Blanco Brillante en textos) o Brand Color para botones.
- **Surface/Card:** `oklch(0.145 0 0)` (Gris Oscuro, eleva el contenido sobre el fondo negro)
- **Border:** `oklch(1 0 0 / 15%)` (Blanco translúcido sutil)

## Tipografía
- **Sans:** Inter (Google Fonts) - Limpia y versátil.
- **Mono:** Roboto Mono (Google Fonts) - Para datos tabulares, tickets y código.

## Radius (Bordes Redondeados)
- **Default:** `0.75rem` (12px) - `rounded-xl`
- Esto da una sensación amigable y moderna, alejándose de los bordes rectos empresariales de los 2010s.

## Sombras
- **Light:** Sombras suaves y difusas (`shadow-sm`, `shadow-md`) para dar profundidad sin ensuciar.
- **Dark:** Las sombras no se ven bien sobre negro. Usamos bordes sutiles y diferencias de tono (Background vs Card) para la jerarquía.

## Componentes Clave
- **Botones:** `h-10` (40px) o `h-11` (44px) para áreas táctiles cómodas.
- **Inputs:** Fondo `transparent` o `bg-background` con borde. En dark mode NUNCA usar `bg-white`.

---
*Este documento debe ser la fuente de verdad al crear nuevos componentes o vistas.*
