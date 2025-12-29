import { ShopWithOwner, colorTheme } from '@/models/Shop';

interface ShopThemeProps {
  shop: ShopWithOwner;
}

const convertColorToOklch = (color: string): string => {
  // If already in oklch format, return as is
  if (color.startsWith('oklch(')) return color;
  
  // For hex colors, convert to oklch
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    
    // Handle 3-digit hex codes
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    } else {
      return color; // Invalid hex format
    }
    
    // Convert RGB to linear RGB
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rLin = toLinear(r);
    const gLin = toLinear(g);
    const bLin = toLinear(b);
    
    // Calculate lightness (Y component in XYZ)
    const lightness = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
    
    // Simple chroma calculation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = (max - min) * 0.5;
    
    // Hue calculation
    let hue = 0;
    if (chroma !== 0) {
      if (max === r) {
        hue = ((g - b) / (max - min)) % 6;
      } else if (max === g) {
        hue = (b - r) / (max - min) + 2;
      } else {
        hue = (r - g) / (max - min) + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }
    
    return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
  }
  
  // For rgb/rgba colors
  if (color.startsWith('rgb')) {
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      const r = parseInt(values[0]) / 255;
      const g = parseInt(values[1]) / 255;
      const b = parseInt(values[2]) / 255;
      
      const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      const rLin = toLinear(r);
      const gLin = toLinear(g);
      const bLin = toLinear(b);
      
      const lightness = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = (max - min) * 0.5;
      
      let hue = 0;
      if (chroma !== 0) {
        if (max === r) {
          hue = ((g - b) / (max - min)) % 6;
        } else if (max === g) {
          hue = (b - r) / (max - min) + 2;
        } else {
          hue = (r - g) / (max - min) + 4;
        }
        hue *= 60;
        if (hue < 0) hue += 360;
      }
      
      return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)})`;
    }
  }
  
  // Fallback to original color if conversion fails
  return color;
};

const generateThemeVariables = (theme: colorTheme, isDark: boolean = false) => {
  const primary = convertColorToOklch(theme.primary);
  const secondary = convertColorToOklch(theme.secondary);
  const background = convertColorToOklch(theme.background);
  const text = convertColorToOklch(theme.text);
  const accent = convertColorToOklch(theme.accent);

  // Calculate appropriate foreground colors based on the theme colors
  const primaryForeground = convertColorToOklch(theme.background); // Use background as contrast to primary
  const secondaryForeground = convertColorToOklch(theme.text);
  const accentForeground = convertColorToOklch(theme.text);
  
  // Generate muted colors based on secondary
  const muted = secondary;
  const mutedForeground = text;
  
  // Generate border and input colors based on secondary with opacity
  const border = secondary;
  const input = secondary;
  const ring = primary;

  // Card colors - use background or slightly different shade
  const card = background;
  const cardForeground = text;
  
  // Popover colors - same as card
  const popover = background;
  const popoverForeground = text;

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
    '--destructive': isDark ? 'oklch(0.704 0.191 22.216)' : 'oklch(0.577 0.245 27.325)',
    '--border': border,
    '--input': input,
    '--ring': ring,
    // Chart colors based on theme
    '--chart-1': primary,
    '--chart-2': secondary,
    '--chart-3': accent,
    '--chart-4': convertColorToOklch(theme.primary + '80'), // Primary with opacity
    '--chart-5': convertColorToOklch(theme.accent + '80'), // Accent with opacity
    // Sidebar colors
    '--sidebar': background,
    '--sidebar-foreground': text,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': primaryForeground,
    '--sidebar-accent': accent,
    '--sidebar-accent-foreground': accentForeground,
    '--sidebar-border': border,
    '--sidebar-ring': ring,
  };
};

export default function ShopTheme({ shop }: ShopThemeProps) {
  // Default theme fallback in case shop themes are not defined
  const defaultLightTheme: colorTheme = {
    primary: '#171717',
    secondary: '#f5f5f5',
    background: '#ffffff',
    text: '#171717',
    accent: '#f5f5f5'
  };

  const defaultDarkTheme: colorTheme = {
    primary: '#f5f5f5',
    secondary: '#404040',
    background: '#171717',
    text: '#f5f5f5',
    accent: '#404040'
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
