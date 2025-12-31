import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { colorTheme } from '@/models/Shop';

import {
  Sun,
  Moon,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  lightTheme: colorTheme;
  darkTheme: colorTheme;
  hasThemeChanges: boolean;
  resetThemeToDefaults: () => void;
  handleThemeColorChange: (mode: "light" | "dark", property: keyof colorTheme, value: string) => void;
}

const ThemeCustomizer = ({ lightTheme, darkTheme, hasThemeChanges, resetThemeToDefaults, handleThemeColorChange }: Props) => {
  const [activeThemeMode, setActiveThemeMode] = useState<'light' | 'dark'>('light');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const ColorInput = ({ 
    label, 
    property, 
    value, 
    placeholder,
    description,
    optional = false
  }: { 
    label: string; 
    property: keyof colorTheme;
    value?: string; 
    placeholder: string;
    description: string;
    optional?: boolean;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {optional && <Badge variant="secondary" className="text-xs">Optional</Badge>}
      </div>
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
          style={{ backgroundColor: value || placeholder }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = (value && value.startsWith('#')) ? value : placeholder;
            input.addEventListener('change', (e) => {
              handleThemeColorChange(activeThemeMode, property, (e.target as HTMLInputElement).value);
            });
            input.click();
          }}
        />
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => handleThemeColorChange(activeThemeMode, property, e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  const currentTheme = activeThemeMode === 'light' ? lightTheme : darkTheme;
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <div className="flex items-center justify-between mb-4">
        <Label className="text-base font-medium">Theme Colors</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetThemeToDefaults}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
      
      <Tabs value={activeThemeMode} onValueChange={(value) => setActiveThemeMode(value as 'light' | 'dark')}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="light" className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Light Mode
          </TabsTrigger>
          <TabsTrigger value="dark" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Dark Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="light" className="space-y-6">
          {/* Core Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Core Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Primary"
                property="primary"
                value={lightTheme.primary}
                placeholder="#171717"
                description="Main brand color for buttons and links"
              />
              <ColorInput
                label="Secondary"
                property="secondary"
                value={lightTheme.secondary}
                placeholder="#f5f5f5"
                description="Secondary backgrounds and muted elements"
              />
              <ColorInput
                label="Background"
                property="background"
                value={lightTheme.background}
                placeholder="#ffffff"
                description="Main page background color"
              />
              <ColorInput
                label="Text"
                property="text"
                value={lightTheme.text}
                placeholder="#171717"
                description="Primary text color"
              />
              <ColorInput
                label="Accent"
                property="accent"
                value={lightTheme.accent}
                placeholder="#f5f5f5"
                description="Accent color for highlights and special elements"
              />
            </div>
          </div>

          {/* Advanced Colors Toggle */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 p-0 h-auto font-normal"
            >
              {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Advanced Color Options
            </Button>
          </div>

          {/* Advanced Colors */}
          {showAdvanced && (
            <div className="space-y-6">
              {/* Foreground Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Foreground Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Primary Foreground"
                    property="primaryForeground"
                    value={lightTheme.primaryForeground}
                    placeholder="#ffffff"
                    description="Text color on primary backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Secondary Foreground"
                    property="secondaryForeground"
                    value={lightTheme.secondaryForeground}
                    placeholder="#171717"
                    description="Text color on secondary backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Accent Foreground"
                    property="accentForeground"
                    value={lightTheme.accentForeground}
                    placeholder="#171717"
                    description="Text color on accent backgrounds"
                    optional
                  />
                </div>
              </div>

              {/* UI Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">UI Elements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Card"
                    property="card"
                    value={lightTheme.card}
                    placeholder="#ffffff"
                    description="Card backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Card Foreground"
                    property="cardForeground"
                    value={lightTheme.cardForeground}
                    placeholder="#171717"
                    description="Text color on cards"
                    optional
                  />
                  <ColorInput
                    label="Popover"
                    property="popover"
                    value={lightTheme.popover}
                    placeholder="#ffffff"
                    description="Popover and dropdown backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Popover Foreground"
                    property="popoverForeground"
                    value={lightTheme.popoverForeground}
                    placeholder="#171717"
                    description="Text color in popovers"
                    optional
                  />
                  <ColorInput
                    label="Muted"
                    property="muted"
                    value={lightTheme.muted}
                    placeholder="#f5f5f5"
                    description="Muted backgrounds and subtle elements"
                    optional
                  />
                  <ColorInput
                    label="Muted Foreground"
                    property="mutedForeground"
                    value={lightTheme.mutedForeground}
                    placeholder="#6b7280"
                    description="Muted text color"
                    optional
                  />
                  <ColorInput
                    label="Border"
                    property="border"
                    value={lightTheme.border}
                    placeholder="#e5e5e5"
                    description="Border color for components"
                    optional
                  />
                  <ColorInput
                    label="Input"
                    property="input"
                    value={lightTheme.input}
                    placeholder="#e5e5e5"
                    description="Input field border color"
                    optional
                  />
                  <ColorInput
                    label="Ring"
                    property="ring"
                    value={lightTheme.ring}
                    placeholder="#171717"
                    description="Focus ring color"
                    optional
                  />
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Semantic Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Success"
                    property="success"
                    value={lightTheme.success}
                    placeholder="#16a34a"
                    description="Success messages and positive actions"
                    optional
                  />
                  <ColorInput
                    label="Success Foreground"
                    property="successForeground"
                    value={lightTheme.successForeground}
                    placeholder="#ffffff"
                    description="Text color on success backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Warning"
                    property="warning"
                    value={lightTheme.warning}
                    placeholder="#ea580c"
                    description="Warning messages and cautions"
                    optional
                  />
                  <ColorInput
                    label="Warning Foreground"
                    property="warningForeground"
                    value={lightTheme.warningForeground}
                    placeholder="#171717"
                    description="Text color on warning backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Error"
                    property="error"
                    value={lightTheme.error}
                    placeholder="#dc2626"
                    description="Error messages and destructive actions"
                    optional
                  />
                  <ColorInput
                    label="Error Foreground"
                    property="errorForeground"
                    value={lightTheme.errorForeground}
                    placeholder="#ffffff"
                    description="Text color on error backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Info"
                    property="info"
                    value={lightTheme.info}
                    placeholder="#0ea5e9"
                    description="Informational messages"
                    optional
                  />
                  <ColorInput
                    label="Info Foreground"
                    property="infoForeground"
                    value={lightTheme.infoForeground}
                    placeholder="#ffffff"
                    description="Text color on info backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Destructive"
                    property="destructive"
                    value={lightTheme.destructive}
                    placeholder="#dc2626"
                    description="Destructive actions and dangerous operations"
                    optional
                  />
                  <ColorInput
                    label="Destructive Foreground"
                    property="destructiveForeground"
                    value={lightTheme.destructiveForeground}
                    placeholder="#ffffff"
                    description="Text color on destructive backgrounds"
                    optional
                  />
                </div>
              </div>

              {/* Sidebar Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Sidebar Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Sidebar"
                    property="sidebar"
                    value={lightTheme.sidebar}
                    placeholder="#f8fafc"
                    description="Sidebar background"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Foreground"
                    property="sidebarForeground"
                    value={lightTheme.sidebarForeground}
                    placeholder="#171717"
                    description="Sidebar text color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Primary"
                    property="sidebarPrimary"
                    value={lightTheme.sidebarPrimary}
                    placeholder="#171717"
                    description="Sidebar primary accent"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Primary Foreground"
                    property="sidebarPrimaryForeground"
                    value={lightTheme.sidebarPrimaryForeground}
                    placeholder="#ffffff"
                    description="Text on sidebar primary"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Accent"
                    property="sidebarAccent"
                    value={lightTheme.sidebarAccent}
                    placeholder="#f5f5f5"
                    description="Sidebar accent color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Accent Foreground"
                    property="sidebarAccentForeground"
                    value={lightTheme.sidebarAccentForeground}
                    placeholder="#171717"
                    description="Text on sidebar accent"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Border"
                    property="sidebarBorder"
                    value={lightTheme.sidebarBorder}
                    placeholder="#e5e5e5"
                    description="Sidebar border color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Ring"
                    property="sidebarRing"
                    value={lightTheme.sidebarRing}
                    placeholder="#171717"
                    description="Sidebar focus ring"
                    optional
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dark" className="space-y-6">
          {/* Core Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Core Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorInput
                label="Primary"
                property="primary"
                value={darkTheme.primary}
                placeholder="#f5f5f5"
                description="Main brand color for buttons and links"
              />
              <ColorInput
                label="Secondary"
                property="secondary"
                value={darkTheme.secondary}
                placeholder="#404040"
                description="Secondary backgrounds and muted elements"
              />
              <ColorInput
                label="Background"
                property="background"
                value={darkTheme.background}
                placeholder="#171717"
                description="Main page background color"
              />
              <ColorInput
                label="Text"
                property="text"
                value={darkTheme.text}
                placeholder="#f5f5f5"
                description="Primary text color"
              />
              <ColorInput
                label="Accent"
                property="accent"
                value={darkTheme.accent}
                placeholder="#404040"
                description="Accent color for highlights and special elements"
              />
            </div>
          </div>

          {/* Advanced Colors Toggle */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 p-0 h-auto font-normal"
            >
              {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Advanced Color Options
            </Button>
          </div>

          {/* Advanced Colors */}
          {showAdvanced && (
            <div className="space-y-6">
              {/* Foreground Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Foreground Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Primary Foreground"
                    property="primaryForeground"
                    value={darkTheme.primaryForeground}
                    placeholder="#171717"
                    description="Text color on primary backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Secondary Foreground"
                    property="secondaryForeground"
                    value={darkTheme.secondaryForeground}
                    placeholder="#f5f5f5"
                    description="Text color on secondary backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Accent Foreground"
                    property="accentForeground"
                    value={darkTheme.accentForeground}
                    placeholder="#f5f5f5"
                    description="Text color on accent backgrounds"
                    optional
                  />
                </div>
              </div>

              {/* UI Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">UI Elements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Card"
                    property="card"
                    value={darkTheme.card}
                    placeholder="#262626"
                    description="Card backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Card Foreground"
                    property="cardForeground"
                    value={darkTheme.cardForeground}
                    placeholder="#f5f5f5"
                    description="Text color on cards"
                    optional
                  />
                  <ColorInput
                    label="Popover"
                    property="popover"
                    value={darkTheme.popover}
                    placeholder="#262626"
                    description="Popover and dropdown backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Popover Foreground"
                    property="popoverForeground"
                    value={darkTheme.popoverForeground}
                    placeholder="#f5f5f5"
                    description="Text color in popovers"
                    optional
                  />
                  <ColorInput
                    label="Muted"
                    property="muted"
                    value={darkTheme.muted}
                    placeholder="#404040"
                    description="Muted backgrounds and subtle elements"
                    optional
                  />
                  <ColorInput
                    label="Muted Foreground"
                    property="mutedForeground"
                    value={darkTheme.mutedForeground}
                    placeholder="#9ca3af"
                    description="Muted text color"
                    optional
                  />
                  <ColorInput
                    label="Border"
                    property="border"
                    value={darkTheme.border}
                    placeholder="#404040"
                    description="Border color for components"
                    optional
                  />
                  <ColorInput
                    label="Input"
                    property="input"
                    value={darkTheme.input}
                    placeholder="#404040"
                    description="Input field background"
                    optional
                  />
                  <ColorInput
                    label="Ring"
                    property="ring"
                    value={darkTheme.ring}
                    placeholder="#d4d4d4"
                    description="Focus ring color"
                    optional
                  />
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Semantic Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Success"
                    property="success"
                    value={darkTheme.success}
                    placeholder="#22c55e"
                    description="Success messages and positive actions"
                    optional
                  />
                  <ColorInput
                    label="Success Foreground"
                    property="successForeground"
                    value={darkTheme.successForeground}
                    placeholder="#ffffff"
                    description="Text color on success backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Warning"
                    property="warning"
                    value={darkTheme.warning}
                    placeholder="#f97316"
                    description="Warning messages and cautions"
                    optional
                  />
                  <ColorInput
                    label="Warning Foreground"
                    property="warningForeground"
                    value={darkTheme.warningForeground}
                    placeholder="#171717"
                    description="Text color on warning backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Error"
                    property="error"
                    value={darkTheme.error}
                    placeholder="#ef4444"
                    description="Error messages and destructive actions"
                    optional
                  />
                  <ColorInput
                    label="Error Foreground"
                    property="errorForeground"
                    value={darkTheme.errorForeground}
                    placeholder="#ffffff"
                    description="Text color on error backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Info"
                    property="info"
                    value={darkTheme.info}
                    placeholder="#3b82f6"
                    description="Informational messages"
                    optional
                  />
                  <ColorInput
                    label="Info Foreground"
                    property="infoForeground"
                    value={darkTheme.infoForeground}
                    placeholder="#ffffff"
                    description="Text color on info backgrounds"
                    optional
                  />
                  <ColorInput
                    label="Destructive"
                    property="destructive"
                    value={darkTheme.destructive}
                    placeholder="#ef4444"
                    description="Destructive actions and dangerous operations"
                    optional
                  />
                  <ColorInput
                    label="Destructive Foreground"
                    property="destructiveForeground"
                    value={darkTheme.destructiveForeground}
                    placeholder="#ffffff"
                    description="Text color on destructive backgrounds"
                    optional
                  />
                </div>
              </div>

              {/* Sidebar Colors */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground">Sidebar Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorInput
                    label="Sidebar"
                    property="sidebar"
                    value={darkTheme.sidebar}
                    placeholder="#262626"
                    description="Sidebar background"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Foreground"
                    property="sidebarForeground"
                    value={darkTheme.sidebarForeground}
                    placeholder="#f5f5f5"
                    description="Sidebar text color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Primary"
                    property="sidebarPrimary"
                    value={darkTheme.sidebarPrimary}
                    placeholder="#8b5cf6"
                    description="Sidebar primary accent"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Primary Foreground"
                    property="sidebarPrimaryForeground"
                    value={darkTheme.sidebarPrimaryForeground}
                    placeholder="#ffffff"
                    description="Text on sidebar primary"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Accent"
                    property="sidebarAccent"
                    value={darkTheme.sidebarAccent}
                    placeholder="#404040"
                    description="Sidebar accent color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Accent Foreground"
                    property="sidebarAccentForeground"
                    value={darkTheme.sidebarAccentForeground}
                    placeholder="#f5f5f5"
                    description="Text on sidebar accent"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Border"
                    property="sidebarBorder"
                    value={darkTheme.sidebarBorder}
                    placeholder="#404040"
                    description="Sidebar border color"
                    optional
                  />
                  <ColorInput
                    label="Sidebar Ring"
                    property="sidebarRing"
                    value={darkTheme.sidebarRing}
                    placeholder="#d4d4d4"
                    description="Sidebar focus ring"
                    optional
                  />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>

    {/* Theme Preview */}
    <div className="mt-6 border rounded-lg p-4" style={{
      backgroundColor: currentTheme.background,
      color: currentTheme.text
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Preview</h3>
        <Eye className="w-5 h-5" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: currentTheme.primary, 
            color: currentTheme.primaryForeground ?? currentTheme.background 
          }}
        >
          <p className="font-medium text-sm">Primary</p>
        </div>
        
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: currentTheme.secondary, 
            color: currentTheme.secondaryForeground || currentTheme.text 
          }}
        >
          <p className="font-medium text-sm">Secondary</p>
        </div>
        
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: currentTheme.accent, 
            color: currentTheme.accentForeground || currentTheme.text 
          }}
        >
          <p className="font-medium text-sm">Accent</p>
        </div>
      </div>
      
      {/* Additional Preview Elements */}
      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 rounded-md font-medium text-sm"
            style={{ 
              backgroundColor: currentTheme.primary, 
              color: currentTheme.primaryForeground || currentTheme.background 
            }}
          >
            Primary Button
          </button>
          <button 
            className="px-4 py-2 rounded-md font-medium text-sm border"
            style={{ 
              backgroundColor: 'transparent', 
              color: currentTheme.primary,
              borderColor: currentTheme.border || currentTheme.primary
            }}
          >
            Secondary Button
          </button>
          <button 
            className="px-4 py-2 rounded-md font-medium text-sm"
            style={{ 
              backgroundColor: currentTheme.destructive, 
              color: currentTheme.destructiveForeground || '#ffffff'
            }}
          >
            Delete
          </button>
        </div>

        {/* Semantic Messages */}
        {showAdvanced && (
          <>
            {/* Semantic Color Messages */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Message Examples</h4>
              <div className="grid grid-cols-1 gap-2">
                {currentTheme.success && (
                  <div 
                    className="p-3 rounded-lg border-l-4 text-sm"
                    style={{ 
                      backgroundColor: `${currentTheme.success}15`,
                      borderLeftColor: currentTheme.success,
                      color: currentTheme.text
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: currentTheme.success, 
                          color: currentTheme.successForeground || '#ffffff'
                        }}
                      >
                        SUCCESS
                      </span>
                      <span>Your changes have been saved successfully!</span>
                    </div>
                  </div>
                )}
                
                {currentTheme.warning && (
                  <div 
                    className="p-3 rounded-lg border-l-4 text-sm"
                    style={{ 
                      backgroundColor: `${currentTheme.warning}15`,
                      borderLeftColor: currentTheme.warning,
                      color: currentTheme.text
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: currentTheme.warning, 
                          color: currentTheme.warningForeground || '#000000'
                        }}
                      >
                        WARNING
                      </span>
                      <span>Please review your settings before proceeding.</span>
                    </div>
                  </div>
                )}
                
                {currentTheme.error && (
                  <div 
                    className="p-3 rounded-lg border-l-4 text-sm"
                    style={{ 
                      backgroundColor: `${currentTheme.error}15`,
                      borderLeftColor: currentTheme.error,
                      color: currentTheme.text
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: currentTheme.error, 
                          color: currentTheme.errorForeground || '#ffffff'
                        }}
                      >
                        ERROR
                      </span>
                      <span>Something went wrong. Please try again.</span>
                    </div>
                  </div>
                )}
                
                {currentTheme.info && (
                  <div 
                    className="p-3 rounded-lg border-l-4 text-sm"
                    style={{ 
                      backgroundColor: `${currentTheme.info}15`,
                      borderLeftColor: currentTheme.info,
                      color: currentTheme.text
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: currentTheme.info, 
                          color: currentTheme.infoForeground || '#ffffff'
                        }}
                      >
                        INFO
                      </span>
                      <span>Here&apos;s some helpful information for you.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced UI Components */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">UI Component Examples</h4>
              
              {/* Sample Card */}
              <div 
                className="p-4 rounded-lg border shadow-sm"
                style={{ 
                  backgroundColor: currentTheme.card || currentTheme.background,
                  color: currentTheme.cardForeground || currentTheme.text,
                  borderColor: currentTheme.border || currentTheme.secondary
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Product Card</h4>
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: currentTheme.muted || currentTheme.secondary,
                      color: currentTheme.mutedForeground || currentTheme.text
                    }}
                  >
                    In Stock
                  </span>
                </div>
                <p 
                  className="text-xs mb-3"
                  style={{ color: currentTheme.mutedForeground || currentTheme.text }}
                >
                  A sample product description that shows how text appears on cards.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold">$29.99</span>
                  <button 
                    className="px-3 py-1.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: currentTheme.primary, 
                      color: currentTheme.primaryForeground || currentTheme.background 
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Sample Sidebar */}
              {currentTheme.sidebar && (
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: currentTheme.sidebar,
                    color: currentTheme.sidebarForeground || currentTheme.text,
                    borderColor: currentTheme.sidebarBorder || currentTheme.border
                  }}
                >
                  <h4 className="font-medium text-sm mb-3">Navigation Menu</h4>
                  <div className="space-y-2">
                    <div 
                      className="px-3 py-2 rounded cursor-pointer hover:opacity-80"
                      style={{ 
                        backgroundColor: currentTheme.sidebarPrimary || currentTheme.primary,
                        color: currentTheme.sidebarPrimaryForeground || currentTheme.primaryForeground
                      }}
                    >
                      <span className="text-sm">Dashboard</span>
                    </div>
                    <div 
                      className="px-3 py-2 rounded cursor-pointer hover:opacity-80"
                      style={{ 
                        backgroundColor: currentTheme.sidebarAccent || currentTheme.accent,
                        color: currentTheme.sidebarAccentForeground || currentTheme.accentForeground
                      }}
                    >
                      <span className="text-sm">Products</span>
                    </div>
                    <div className="px-3 py-2 text-sm cursor-pointer hover:opacity-70">
                      Orders
                    </div>
                    <div className="px-3 py-2 text-sm cursor-pointer hover:opacity-70">
                      Settings
                    </div>
                  </div>
                </div>
              )}

              {/* Sample Popup/Modal */}
              <div 
                className="p-4 rounded-lg border shadow-lg"
                style={{ 
                  backgroundColor: currentTheme.popover || currentTheme.card || currentTheme.background,
                  color: currentTheme.popoverForeground || currentTheme.cardForeground || currentTheme.text,
                  borderColor: currentTheme.border || currentTheme.secondary
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Confirmation Dialog</h4>
                  <button 
                    className="w-6 h-6 rounded flex items-center justify-center hover:opacity-70"
                    style={{ 
                      backgroundColor: currentTheme.muted || currentTheme.secondary,
                      color: currentTheme.mutedForeground || currentTheme.text
                    }}
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs mb-4" style={{ color: currentTheme.mutedForeground || currentTheme.text }}>
                  Are you sure you want to delete this item? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <button 
                    className="px-3 py-1.5 rounded text-xs border"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: currentTheme.text,
                      borderColor: currentTheme.border || currentTheme.secondary
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-3 py-1.5 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: currentTheme.destructive || currentTheme.error || '#dc2626', 
                      color: currentTheme.destructiveForeground || currentTheme.errorForeground || '#ffffff'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Input Examples */}
              <div className="space-y-3">
                <h5 className="text-xs font-medium">Form Elements</h5>
                
                {/* Text Input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Email Address</label>
                  <div 
                    className="px-3 py-2 rounded border text-sm"
                    style={{
                      color: currentTheme.text,
                      borderColor: currentTheme.input || currentTheme.border || currentTheme.secondary
                    }}
                  >
                    user@example.com
                  </div>
                </div>

                {/* Focused Input (with ring) */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Focused Input</label>
                  <div 
                    className="px-3 py-2 rounded border text-sm"
                    style={{
                      color: currentTheme.text,
                      borderColor: currentTheme.ring || currentTheme.primary,
                      boxShadow: `0 0 0 2px ${currentTheme.ring || currentTheme.primary}20`
                    }}
                  >
                    Type here...
                  </div>
                </div>

                {/* Select/Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category</label>
                  <div 
                    className="px-3 py-2 rounded border text-sm flex items-center justify-between cursor-pointer"
                    style={{
                      color: currentTheme.text,
                      borderColor: currentTheme.input || currentTheme.border || currentTheme.secondary
                    }}
                  >
                    <span>Electronics</span>
                    <span>▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Usage Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Color Reference</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: currentTheme.ring,
                        borderColor: currentTheme.border
                      }}
                    />
                    <span>Focus Ring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: currentTheme.border }}
                    />
                    <span>Border</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: currentTheme.muted }}
                    />
                    <span>Muted</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {currentTheme.destructive && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: currentTheme.destructive }}
                      />
                      <span>Destructive</span>
                    </div>
                  )}
                  {currentTheme.input && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ 
                          backgroundColor: currentTheme.input,
                          borderColor: currentTheme.border
                        }}
                      />
                      <span>Input</span>
                    </div>
                  )}
                  {currentTheme.mutedForeground && (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ 
                          backgroundColor: currentTheme.mutedForeground,
                          borderColor: currentTheme.border
                        }}
                      />
                      <span>Muted Text</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    {hasThemeChanges && (
      <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
        <p className="text-sm text-info-foreground">
          You have unsaved theme changes. Click &quot;Save Settings&quot; to apply them.
        </p>
      </div>
    )}
  </div>
};

export default ThemeCustomizer;