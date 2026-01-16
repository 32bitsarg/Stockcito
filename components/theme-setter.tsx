"use client"

import * as React from "react"
import { useTheme } from "next-themes"

// OKLCH values for the themes
// L C H (Lightness, Chroma, Hue)
const THEMES: Record<string, { primary: string; ring: string }> = {
    default: {
        primary: "0.55 0.22 264", // Violet/Indigo (Current Default)
        ring: "0.55 0.22 264",
    },
    blue: {
        primary: "0.55 0.22 250", // Blue
        ring: "0.55 0.22 250",
    },
    green: {
        primary: "0.60 0.18 145", // Green/Emerald
        ring: "0.60 0.18 145",
    },
    orange: {
        primary: "0.65 0.20 50", // Orange
        ring: "0.65 0.20 50",
    },
    red: {
        primary: "0.55 0.22 27", // Red
        ring: "0.55 0.22 27",
    },
}

interface ThemeSetterProps {
    theme?: string
}

export function ThemeSetter({ theme = "default" }: ThemeSetterProps) {
    const { resolvedTheme } = useTheme()

    React.useEffect(() => {
        const root = document.documentElement
        const targetTheme = THEMES[theme] || THEMES.default

        // In CSS we use oklch(L C H), so we pass the inner numbers
        // The globals.css variables are like: --primary: oklch(0.55 0.22 264);

        // We update the --primary and --ring variables dynamically
        // We also update --sidebar-primary to match

        // If we are in dark mode, we might want to adjust Lightness, 
        // but usually --primary is defined separately for .dark in globals.css.
        // However, since we are overriding via inline styles on :root, 
        // we need to be careful not to break dark/light contrast.

        // Our existing globals.css defines:
        // :root { --primary: oklch(0.55 0.22 264); ... }
        // .dark { --primary: oklch(0.922 0 0); ... } -> Wait, check globals.css

        // Analyzing globals.css again:
        // Light: --primary: oklch(0.55 0.22 264); (Violet)
        // Dark: --primary: oklch(0.922 0 0); (White/Light Grey?) -> No, typically dark mode primary is a lighter shade of the color
        // or sometimes just white text for high contrast.

        // Let's look at globals.css from the previous turn:
        // .dark { --primary: oklch(0.922 0 0); ... } -> This looks like it overrides primary to be white/grey in dark mode?
        // standard shadcn usually has "primary" as the background of the button.
        // If --primary is white in dark mode, then primary buttons are white with black text.

        // If we want to COLOR Branding in Dark Mode, we usually change the --primary to be the BRAND color.
        // But if the design expects white details in dark mode, changing it might break things.

        // However, if the user picks "Green", they expect Green buttons even in Dark Mode? 
        // Or maybe just colored accents?

        // Let's assume for now we primarily target Light Mode overriding, 
        // and for Dark mode we check if we should override it.

        // If I look at the defaults:
        // Light: --primary: oklch(0.55 0.22 264);
        // Dark: --primary: oklch(0.922 0 0); -> This is effectively white.
        // If I override --primary variables on :root, it cascades to .dark UNLESS .dark has high specificity or is applied later.
        // Usually inline styles on <html> override classes.

        // So if I set style="--primary: ..." on <html>, it kills the .dark override.
        // To fix this, I should only apply the color override if it's NOT dark mode?
        // OR, I should apply a different color for dark mode.

        // Let's keep it simple: The "Branding" usually affects the primary action color.
        // If the app uses White for primary in dark mode, that's a design choice.
        // But maybe we want the "Logo" or "Sidebar" to match the brand.

        // Let's stick to updating the numeric values but respecting the Light/Dark split logic if possible.
        // Actually, simply setting the property on the style attribute overrides everything.

        // Let's apply the color for BOTH, but maybe adjust lightness for Dark mode if needed.
        // For now, I will apply the EXACT color selected to --primary on ROOT. 
        // If it looks bad in Dark Mode (e.g. black text on dark violet background?), we can iterate.
        // Actually, shadcn buttons use --primary-foreground for text.
        // Light: primary-fg: white. Dark: primary-fg: black (usually).

        // Let's try applying the same color first.

        root.style.setProperty("--primary", `oklch(${targetTheme.primary})`)
        root.style.setProperty("--ring", `oklch(${targetTheme.ring})`)
        root.style.setProperty("--sidebar-primary", `oklch(${targetTheme.primary})`)

        // We clean up when component unmounts? No, we want it to persist.
    }, [theme, resolvedTheme])

    return null
}
