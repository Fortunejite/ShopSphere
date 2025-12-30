import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { colorTheme } from '@/models/Shop';

import {
  Sun,
  Moon,
  RefreshCw,
  Eye
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
  return <div>
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

      <TabsContent value="light" className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Primary Color */}
          <div>
            <Label className="text-sm font-medium">Primary Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: lightTheme.primary }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = lightTheme.primary.startsWith('#') ? lightTheme.primary : '#000000';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('light', 'primary', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={lightTheme.primary}
                onChange={(e) => handleThemeColorChange('light', 'primary', e.target.value)}
                placeholder="#171717"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main brand color for buttons and links</p>
          </div>

          {/* Secondary Color */}
          <div>
            <Label className="text-sm font-medium">Secondary Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: lightTheme.secondary }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = lightTheme.secondary.startsWith('#') ? lightTheme.secondary : '#f5f5f5';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('light', 'secondary', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={lightTheme.secondary}
                onChange={(e) => handleThemeColorChange('light', 'secondary', e.target.value)}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Secondary backgrounds and muted elements</p>
          </div>

          {/* Background Color */}
          <div>
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: lightTheme.background }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = lightTheme.background.startsWith('#') ? lightTheme.background : '#ffffff';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('light', 'background', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={lightTheme.background}
                onChange={(e) => handleThemeColorChange('light', 'background', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main page background color</p>
          </div>

          {/* Text Color */}
          <div>
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: lightTheme.text }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = lightTheme.text.startsWith('#') ? lightTheme.text : '#171717';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('light', 'text', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={lightTheme.text}
                onChange={(e) => handleThemeColorChange('light', 'text', e.target.value)}
                placeholder="#171717"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Primary text color</p>
          </div>

          {/* Accent Color */}
          <div>
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: lightTheme.accent }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = lightTheme.accent.startsWith('#') ? lightTheme.accent : '#f5f5f5';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('light', 'accent', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={lightTheme.accent}
                onChange={(e) => handleThemeColorChange('light', 'accent', e.target.value)}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Accent color for highlights and special elements</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="dark" className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Primary Color */}
          <div>
            <Label className="text-sm font-medium">Primary Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: darkTheme.primary }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = darkTheme.primary.startsWith('#') ? darkTheme.primary : '#f5f5f5';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('dark', 'primary', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={darkTheme.primary}
                onChange={(e) => handleThemeColorChange('dark', 'primary', e.target.value)}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main brand color for buttons and links</p>
          </div>

          {/* Secondary Color */}
          <div>
            <Label className="text-sm font-medium">Secondary Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: darkTheme.secondary }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = darkTheme.secondary.startsWith('#') ? darkTheme.secondary : '#404040';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('dark', 'secondary', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={darkTheme.secondary}
                onChange={(e) => handleThemeColorChange('dark', 'secondary', e.target.value)}
                placeholder="#404040"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Secondary backgrounds and muted elements</p>
          </div>

          {/* Background Color */}
          <div>
            <Label className="text-sm font-medium">Background Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: darkTheme.background }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = darkTheme.background.startsWith('#') ? darkTheme.background : '#171717';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('dark', 'background', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={darkTheme.background}
                onChange={(e) => handleThemeColorChange('dark', 'background', e.target.value)}
                placeholder="#171717"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main page background color</p>
          </div>

          {/* Text Color */}
          <div>
            <Label className="text-sm font-medium">Text Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: darkTheme.text }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = darkTheme.text.startsWith('#') ? darkTheme.text : '#f5f5f5';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('dark', 'text', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={darkTheme.text}
                onChange={(e) => handleThemeColorChange('dark', 'text', e.target.value)}
                placeholder="#f5f5f5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Primary text color</p>
          </div>

          {/* Accent Color */}
          <div>
            <Label className="text-sm font-medium">Accent Color</Label>
            <div className="flex items-center space-x-3 mt-2">
              <div 
                className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                style={{ backgroundColor: darkTheme.accent }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'color';
                  input.value = darkTheme.accent.startsWith('#') ? darkTheme.accent : '#404040';
                  input.addEventListener('change', (e) => {
                    handleThemeColorChange('dark', 'accent', (e.target as HTMLInputElement).value);
                  });
                  input.click();
                }}
              />
              <Input
                type="text"
                value={darkTheme.accent}
                onChange={(e) => handleThemeColorChange('dark', 'accent', e.target.value)}
                placeholder="#404040"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Accent color for highlights and special elements</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    {/* Theme Preview */}
    <div className="mt-6 border rounded-lg p-4" style={{
      backgroundColor: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background,
      color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Theme Preview</h3>
        <Eye className="w-5 h-5" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary, 
            color: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background 
          }}
        >
          <p className="font-medium text-sm">Primary</p>
        </div>
        
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: activeThemeMode === 'light' ? lightTheme.secondary : darkTheme.secondary, 
            color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text 
          }}
        >
          <p className="font-medium text-sm">Secondary</p>
        </div>
        
        <div 
          className="p-3 rounded-lg text-center"
          style={{ 
            backgroundColor: activeThemeMode === 'light' ? lightTheme.accent : darkTheme.accent, 
            color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text 
          }}
        >
          <p className="font-medium text-sm">Accent</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button 
          className="px-4 py-2 rounded-md font-medium text-sm"
          style={{ 
            backgroundColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary, 
            color: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background 
          }}
        >
          Primary Button
        </button>
        <button 
          className="px-4 py-2 rounded-md font-medium text-sm border"
          style={{ 
            backgroundColor: 'transparent', 
            color: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary,
            borderColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary
          }}
        >
          Secondary Button
        </button>
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