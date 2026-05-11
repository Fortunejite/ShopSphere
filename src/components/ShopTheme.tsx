import { colorTheme } from '@/lib/customTheme';
import { ShopWithOwner } from '@/types';

interface ShopThemeProps {
  shop: ShopWithOwner;
}

const convertColorToOklch = (color: string): string => {
  return color;
};

const generateThemeVariables = (theme: colorTheme, isDark: boolean = false) => {
  const primary = convertColorToOklch(theme.primary);
  const secondary = convertColorToOklch(theme.secondary);
  const background = convertColorToOklch(theme.background);
  const text = convertColorToOklch(theme.text);
  const accent = convertColorToOklch(theme.accent);

  const primaryForeground = theme.primaryForeground ?
    convertColorToOklch(theme.primaryForeground) : background;
  const secondaryForeground = theme.secondaryForeground ?
    convertColorToOklch(theme.secondaryForeground) : text;
  const accentForeground = theme.accentForeground ?
    convertColorToOklch(theme.accentForeground) : text;

  const card = theme.card ? convertColorToOklch(theme.card) : background;
  const cardForeground = theme.cardForeground ? convertColorToOklch(theme.cardForeground) : text;
  const popover = theme.popover ? convertColorToOklch(theme.popover) : background;
  const popoverForeground = theme.popoverForeground ? convertColorToOklch(theme.popoverForeground) : text;
  const muted = theme.muted ? convertColorToOklch(theme.muted) : secondary;
  const mutedForeground = theme.mutedForeground ? convertColorToOklch(theme.mutedForeground) : text;
  const border = theme.border ? convertColorToOklch(theme.border) : secondary;
  const input = theme.input ? convertColorToOklch(theme.input) : border;
  const ring = theme.ring ? convertColorToOklch(theme.ring) : primary;

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

  const chart1 = theme.chart1 ? convertColorToOklch(theme.chart1) :
    (isDark ? 'oklch(0.488 0.243 264.376)' : 'oklch(0.646 0.222 41.116)');
  const chart2 = theme.chart2 ? convertColorToOklch(theme.chart2) : info;
  const chart3 = theme.chart3 ? convertColorToOklch(theme.chart3) :
    (isDark ? 'oklch(0.769 0.188 70.08)' : 'oklch(0.398 0.07 227.392)');
  const chart4 = theme.chart4 ? convertColorToOklch(theme.chart4) : warning;
  const chart5 = theme.chart5 ? convertColorToOklch(theme.chart5) :
    (isDark ? 'oklch(0.645 0.246 16.439)' : 'oklch(0.769 0.188 70.08)');

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

const isThemeEmpty = (theme: colorTheme) => {
  return Object.values(theme).every(value => value === '' || value === null);
};

export default function ShopTheme({ shop }: ShopThemeProps) {
  // ── Default themes mirror the ShopSphere "Meridian Commerce" global theme.
  //    Vendor-customised themes from the database override these when present.

  const defaultLightTheme: colorTheme = {
    // Core
    primary:    'oklch(0.44 0.13 156)',   // deep emerald
    secondary:  'oklch(0.96 0.022 84)',   // soft gold-tint surface
    background: 'oklch(0.99 0.008 84)',   // warm ivory
    text:       'oklch(0.15 0.015 258)',  // deep ink
    accent:     'oklch(0.95 0.045 84)',   // warm amber surface

    // Foregrounds
    primaryForeground:   'oklch(0.99 0 0)',
    secondaryForeground: 'oklch(0.38 0.09 78)',
    accentForeground:    'oklch(0.36 0.10 75)',

    // Surfaces
    card:             'oklch(1 0 0)',
    cardForeground:   'oklch(0.15 0.015 258)',
    popover:          'oklch(1 0 0)',
    popoverForeground:'oklch(0.15 0.015 258)',
    muted:            'oklch(0.96 0.007 84)',
    mutedForeground:  'oklch(0.52 0.008 258)',

    // Borders & inputs
    border: 'oklch(0.90 0.009 84)',
    input:  'oklch(0.90 0.009 84)',
    ring:   'oklch(0.44 0.13 156)',

    // Semantics
    destructive:          'oklch(0.577 0.245 27.325)',
    destructiveForeground:'oklch(0.985 0 0)',
    success:              'oklch(0.50 0.14 156)',
    successForeground:    'oklch(0.99 0 0)',
    warning:              'oklch(0.74 0.16 82)',
    warningForeground:    'oklch(0.15 0.015 258)',
    error:                'oklch(0.577 0.245 27.325)',
    errorForeground:      'oklch(0.985 0 0)',
    info:                 'oklch(0.58 0.11 210)',
    infoForeground:       'oklch(0.985 0 0)',

    // Charts: Emerald · Amber · Teal · Burnt Orange · Plum
    chart1: 'oklch(0.44 0.13 156)',
    chart2: 'oklch(0.72 0.16 82)',
    chart3: 'oklch(0.58 0.11 210)',
    chart4: 'oklch(0.62 0.19 38)',
    chart5: 'oklch(0.54 0.15 298)',

    // Sidebar: deep forest green with amber active items
    sidebar:                   'oklch(0.24 0.07 158)',
    sidebarForeground:         'oklch(0.96 0.010 84)',
    sidebarPrimary:            'oklch(0.72 0.16 82)',
    sidebarPrimaryForeground:  'oklch(0.15 0.015 258)',
    sidebarAccent:             'oklch(0.30 0.065 158)',
    sidebarAccentForeground:   'oklch(0.94 0.010 84)',
    sidebarBorder:             'oklch(0.32 0.055 158)',
    sidebarRing:               'oklch(0.72 0.16 82)',
  };

  const defaultDarkTheme: colorTheme = {
    // Core
    primary:    'oklch(0.60 0.14 157)',   // lighter emerald for dark surfaces
    secondary:  'oklch(0.22 0.018 258)',  // dark neutral surface
    background: 'oklch(0.12 0.018 258)',  // ink navy
    text:       'oklch(0.96 0.010 82)',   // warm cream
    accent:     'oklch(0.28 0.04 84)',    // subtle dark amber fill

    // Foregrounds
    primaryForeground:   'oklch(0.99 0 0)',
    secondaryForeground: 'oklch(0.84 0.008 82)',
    accentForeground:    'oklch(0.90 0.020 82)',

    // Surfaces
    card:             'oklch(0.17 0.018 258)',
    cardForeground:   'oklch(0.96 0.010 82)',
    popover:          'oklch(0.19 0.016 258)',
    popoverForeground:'oklch(0.96 0.010 82)',
    muted:            'oklch(0.21 0.016 258)',
    mutedForeground:  'oklch(0.60 0.008 82)',

    // Borders & inputs
    border: 'oklch(1 0 0 / 10%)',
    input:  'oklch(1 0 0 / 14%)',
    ring:   'oklch(0.60 0.14 157)',

    // Semantics
    destructive:          'oklch(0.704 0.191 22.216)',
    destructiveForeground:'oklch(0.985 0 0)',
    success:              'oklch(0.60 0.13 157)',
    successForeground:    'oklch(0.99 0 0)',
    warning:              'oklch(0.72 0.15 82)',
    warningForeground:    'oklch(0.12 0.018 258)',
    error:                'oklch(0.704 0.191 22.216)',
    errorForeground:      'oklch(0.985 0 0)',
    info:                 'oklch(0.62 0.11 205)',
    infoForeground:       'oklch(0.985 0 0)',

    // Charts: brightened for dark backgrounds
    chart1: 'oklch(0.60 0.14 157)',
    chart2: 'oklch(0.70 0.15 82)',
    chart3: 'oklch(0.62 0.12 205)',
    chart4: 'oklch(0.66 0.19 38)',
    chart5: 'oklch(0.60 0.15 298)',

    // Sidebar: deeper than page background
    sidebar:                  'oklch(0.10 0.020 258)',
    sidebarForeground:        'oklch(0.94 0.010 82)',
    sidebarPrimary:           'oklch(0.60 0.14 157)',
    sidebarPrimaryForeground: 'oklch(0.99 0 0)',
    sidebarAccent:            'oklch(0.17 0.018 258)',
    sidebarAccentForeground:  'oklch(0.84 0.008 82)',
    sidebarBorder:            'oklch(1 0 0 / 8%)',
    sidebarRing:              'oklch(0.60 0.14 157)',
  };

  const lightTheme = shop.light_theme && !isThemeEmpty(shop.light_theme) ? shop.light_theme : defaultLightTheme;
  const darkTheme = shop.dark_theme && !isThemeEmpty(shop.dark_theme) ? shop.dark_theme : defaultDarkTheme;

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
