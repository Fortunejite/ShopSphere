export interface colorTheme {
  // Core colors
  primary: string;
  secondary: string;
  background: string;
  text: string; // maps to foreground
  accent: string;
  
  // Core foreground colors
  primaryForeground?: string;
  secondaryForeground?: string;
  accentForeground?: string;
  
  // UI colors
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  muted?: string;
  mutedForeground?: string;
  border?: string;
  input?: string;
  ring?: string;
  
  // Semantic colors
  destructive?: string;
  destructiveForeground?: string;
  success?: string;
  successForeground?: string;
  warning?: string;
  warningForeground?: string;
  error?: string;
  errorForeground?: string;
  info?: string;
  infoForeground?: string;
  
  // Chart colors
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  
  // Sidebar colors
  sidebar?: string;
  sidebarForeground?: string;
  sidebarPrimary?: string;
  sidebarPrimaryForeground?: string;
  sidebarAccent?: string;
  sidebarAccentForeground?: string;
  sidebarBorder?: string;
  sidebarRing?: string;
}