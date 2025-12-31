import { ShopWithOwner, colorTheme } from '@/models/Shop';

interface ShopThemeProps {
  shop: ShopWithOwner;
}

const convertColorToOklch = (color: string): string => {
  return color;
  // If already in oklch format, return as is
  // if (color.startsWith('oklch(')) return color;
  
  // // For hex colors, convert to oklch
  // if (color.startsWith('#')) {
  //   const hex = color.slice(1);
    
  //   // Handle 3-digit hex codes
  //   let r, g, b;
  //   if (hex.length === 3) {
  //     r = parseInt(hex[0] + hex[0], 16) / 255;
  //     g = parseInt(hex[1] + hex[1], 16) / 255;
  //     b = parseInt(hex[2] + hex[2], 16) / 255;
  //   } else if (hex.length === 6) {
  //     r = parseInt(hex.slice(0, 2), 16) / 255;
  //     g = parseInt(hex.slice(2, 4), 16) / 255;
  //     b = parseInt(hex.slice(4, 6), 16) / 255;
  //   } else {
  //     return color; // Invalid hex format
  //   }
    
  //   // Convert RGB to linear RGB
  //   const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  //   const rLin = toLinear(r);
  //   const gLin = toLinear(g);
  //   const bLin = toLinear(b);
    
  //   // Calculate lightness (Y component in XYZ)
  //   const lightness = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    
  //   // Simple chroma calculation
  //   const max = Math.max(r, g, b);
  //   const min = Math.min(r, g, b);
  //   const chroma = (max - min) * 0.5;
    
  //   // Hue calculation
  //   let hue = 0;
  //   if (chroma !== 0) {
  //     if (max === r) {
  //       hue = ((g - b) / (max - min)) % 6;
  //     } else if (max === g) {
  //       hue = (b - r) / (max - min) + 2;
  //     } else {
  //       hue = (r - g) / (max - min) + 4;
  //     }
  //     hue *= 60;
  //     if (hue < 0) hue += 360;
  //   }
    
  //   return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
  // }
  
  // // For rgb/rgba colors
  // if (color.startsWith('rgb')) {
  //   const values = color.match(/\d+/g);
  //   if (values && values.length >= 3) {
  //     const r = parseInt(values[0]) / 255;
  //     const g = parseInt(values[1]) / 255;
  //     const b = parseInt(values[2]) / 255;
      
  //     const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  //     const rLin = toLinear(r);
  //     const gLin = toLinear(g);
  //     const bLin = toLinear(b);
      
  //     const lightness = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  //     const max = Math.max(r, g, b);
  //     const min = Math.min(r, g, b);
  //     const chroma = (max - min) * 0.5;
      
  //     let hue = 0;
  //     if (chroma !== 0) {
  //       if (max === r) {
  //         hue = ((g - b) / (max - min)) % 6;
  //       } else if (max === g) {
  //         hue = (b - r) / (max - min) + 2;
  //       } else {
  //         hue = (r - g) / (max - min) + 4;
  //       }
  //       hue *= 60;
  //       if (hue < 0) hue += 360;
  //     }
      
  //     return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
  //   }
  // }
  
  // // Fallback to original color if conversion fails
  // return color;
};

const generateThemeVariables = (theme: colorTheme, isDark: boolean = false) => {
  const primary = convertColorToOklch(theme.primary);
  const secondary = convertColorToOklch(theme.secondary);
  const background = convertColorToOklch(theme.background);
  const text = convertColorToOklch(theme.text);
  const accent = convertColorToOklch(theme.accent);

  // Use provided foreground colors or calculate appropriate ones
  const primaryForeground = theme.primaryForeground ? 
    convertColorToOklch(theme.primaryForeground) : background;
  const secondaryForeground = theme.secondaryForeground ? 
    convertColorToOklch(theme.secondaryForeground) : text;
  const accentForeground = theme.accentForeground ? 
    convertColorToOklch(theme.accentForeground) : text;
  
  // UI colors with fallbacks
  const card = theme.card ? convertColorToOklch(theme.card) : background;
  const cardForeground = theme.cardForeground ? convertColorToOklch(theme.cardForeground) : text;
  const popover = theme.popover ? convertColorToOklch(theme.popover) : background;
  const popoverForeground = theme.popoverForeground ? convertColorToOklch(theme.popoverForeground) : text;
  const muted = theme.muted ? convertColorToOklch(theme.muted) : secondary;
  const mutedForeground = theme.mutedForeground ? convertColorToOklch(theme.mutedForeground) : text;
  const border = theme.border ? convertColorToOklch(theme.border) : secondary;
  const input = theme.input ? convertColorToOklch(theme.input) : border;
  const ring = theme.ring ? convertColorToOklch(theme.ring) : primary;
  
  // Semantic colors with fallbacks
  const destructive = theme.destructive ? convertColorToOklch(theme.destructive) : 
    (isDark ? 'oklch(0.704 0.191 22.216)' : 'oklch(0.577 0.245 27.325)');
  const destructiveForeground = theme.destructiveForeground ? 
    convertColorToOklch(theme.destructiveForeground) : 'oklch(0.985 0 0)';
    
  const success = theme.success ? convertColorToOklch(theme.success) : 
    (isDark ? 'oklch(0.578 0.151 142.495)' : 'oklch(0.533 0.151 142.495)');
  const successForeground = theme.successForeground ? 
    convertColorToOklch(theme.successForeground) : 'oklch(0.985 0 0)';
    
  const warning = theme.warning ? convertColorToOklch(theme.warning) : 
    (isDark ? 'oklch(0.769 0.188 70.08)' : 'oklch(0.828 0.189 84.429)');
  const warningForeground = theme.warningForeground ? 
    convertColorToOklch(theme.warningForeground) : (isDark ? 'oklch(0.145 0 0)' : 'oklch(0.145 0 0)');
    
  const error = theme.error ? convertColorToOklch(theme.error) : destructive;
  const errorForeground = theme.errorForeground ? 
    convertColorToOklch(theme.errorForeground) : 'oklch(0.985 0 0)';
    
  const info = theme.info ? convertColorToOklch(theme.info) : 
    (isDark ? 'oklch(0.696 0.17 162.48)' : 'oklch(0.6 0.118 184.704)');
  const infoForeground = theme.infoForeground ? 
    convertColorToOklch(theme.infoForeground) : 'oklch(0.985 0 0)';

  // Chart colors with fallbacks
  const chart1 = theme.chart1 ? convertColorToOklch(theme.chart1) : 
    (isDark ? 'oklch(0.488 0.243 264.376)' : 'oklch(0.646 0.222 41.116)');
  const chart2 = theme.chart2 ? convertColorToOklch(theme.chart2) : info;
  const chart3 = theme.chart3 ? convertColorToOklch(theme.chart3) : 
    (isDark ? 'oklch(0.769 0.188 70.08)' : 'oklch(0.398 0.07 227.392)');
  const chart4 = theme.chart4 ? convertColorToOklch(theme.chart4) : warning;
  const chart5 = theme.chart5 ? convertColorToOklch(theme.chart5) : 
    (isDark ? 'oklch(0.645 0.246 16.439)' : 'oklch(0.769 0.188 70.08)');

  // Sidebar colors with fallbacks
  const sidebar = theme.sidebar ? convertColorToOklch(theme.sidebar) : 
    (isDark ? 'oklch(0.205 0 0)' : 'oklch(0.985 0 0)');
  const sidebarForeground = theme.sidebarForeground ? 
    convertColorToOklch(theme.sidebarForeground) : text;
  const sidebarPrimary = theme.sidebarPrimary ? 
    convertColorToOklch(theme.sidebarPrimary) : primary;
  const sidebarPrimaryForeground = theme.sidebarPrimaryForeground ? 
    convertColorToOklch(theme.sidebarPrimaryForeground) : primaryForeground;
  const sidebarAccent = theme.sidebarAccent ? 
    convertColorToOklch(theme.sidebarAccent) : accent;
  const sidebarAccentForeground = theme.sidebarAccentForeground ? 
    convertColorToOklch(theme.sidebarAccentForeground) : accentForeground;
  const sidebarBorder = theme.sidebarBorder ? 
    convertColorToOklch(theme.sidebarBorder) : border;
  const sidebarRing = theme.sidebarRing ? 
    convertColorToOklch(theme.sidebarRing) : ring;

  return {
    '--background': background,
    '--foreground': text,
    '--card': card,
    '--card-foreground': cardForeground,
    '--popover': popover,
    '--popover-foreground': popoverForeground,
    '--primary': primary,
    '--primary-foreground': primaryForeground,
    '--secondary': secondary,
    '--secondary-foreground': secondaryForeground,
    '--muted': muted,
    '--muted-foreground': mutedForeground,
    '--accent': accent,
    '--accent-foreground': accentForeground,
    '--destructive': destructive,
    '--destructive-foreground': destructiveForeground,
    '--success': success,
    '--success-foreground': successForeground,
    '--warning': warning,
    '--warning-foreground': warningForeground,
    '--error': error,
    '--error-foreground': errorForeground,
    '--info': info,
    '--info-foreground': infoForeground,
    '--border': border,
    '--input': input,
    '--ring': ring,
    '--chart-1': chart1,
    '--chart-2': chart2,
    '--chart-3': chart3,
    '--chart-4': chart4,
    '--chart-5': chart5,
    '--sidebar': sidebar,
    '--sidebar-foreground': sidebarForeground,
    '--sidebar-primary': sidebarPrimary,
    '--sidebar-primary-foreground': sidebarPrimaryForeground,
    '--sidebar-accent': sidebarAccent,
    '--sidebar-accent-foreground': sidebarAccentForeground,
    '--sidebar-border': sidebarBorder,
    '--sidebar-ring': sidebarRing,
  };
};

export default function ShopTheme({ shop }: ShopThemeProps) {
  // Default theme fallback in case shop themes are not defined
  const defaultLightTheme: colorTheme = {
    primary: '#171717',
    secondary: '#f5f5f5',
    background: '#ffffff',
    text: '#171717',
    accent: '#f5f5f5',
    card: '#ffffff',
    popover: '#ffffff',
    muted: '#f5f5f5',
    border: '#e5e5e5',
    input: '#e5e5e5',
    ring: '#171717',
    destructive: '#dc2626',
    success: '#16a34a',
    warning: '#ea580c',
    error: '#dc2626',
    info: '#0ea5e9'
  };

  const defaultDarkTheme: colorTheme = {
    primary: '#f5f5f5',
    secondary: '#404040',
    background: '#171717',
    text: '#f5f5f5',
    accent: '#404040',
    card: '#262626',
    popover: '#262626',
    muted: '#404040',
    border: '#404040',
    input: '#404040',
    ring: '#d4d4d4',
    destructive: '#ef4444',
    success: '#22c55e',
    warning: '#f97316',
    error: '#ef4444',
    info: '#3b82f6'
  };

  const lightTheme = shop.light_theme || defaultLightTheme;
  const darkTheme = shop.dark_theme || defaultDarkTheme;

  const lightVars = generateThemeVariables(lightTheme, false);
  const darkVars = generateThemeVariables(darkTheme, true);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          /* Shop Theme Override: ${shop.name} */
          :root {
            ${Object.entries(lightVars)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
          }
          
          .dark {
            ${Object.entries(darkVars)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
          }
        `,
      }}
    />
  );
}
