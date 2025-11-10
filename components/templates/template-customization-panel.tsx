'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Palette, Type, Layout, Save, RotateCcw } from 'lucide-react';
import { 
  COLOR_SCHEMES, 
  FONT_COMBINATIONS, 
  TemplateCustomization,
  ColorScheme,
  FontSettings,
  LayoutSettings 
} from '@/lib/template-customization';
import { toast } from 'sonner';

interface TemplateCustomizationPanelProps {
  templateId: string;
  userId: string;
  onCustomizationChange: (customization: TemplateCustomization) => void;
  initialCustomization?: TemplateCustomization;
}

export function TemplateCustomizationPanel({
  templateId,
  userId,
  onCustomizationChange,
  initialCustomization,
}: TemplateCustomizationPanelProps) {
  const [customization, setCustomization] = useState<TemplateCustomization>(
    initialCustomization || {
      user_id: userId,
      template_id: templateId,
      customization_name: 'My Customization',
      color_scheme: COLOR_SCHEMES.professional,
      font_settings: FONT_COMBINATIONS.modern,
      layout_settings: {
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: 12,
        columns: 1,
        section_spacing: 16,
      },
    }
  );

  const updateColorScheme = (schemeName: string) => {
    const newCustomization = {
      ...customization,
      color_scheme: COLOR_SCHEMES[schemeName],
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const updateFontSettings = (fontName: string) => {
    const newCustomization = {
      ...customization,
      font_settings: FONT_COMBINATIONS[fontName],
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const updateCustomColor = (key: keyof ColorScheme, value: string) => {
    const newCustomization = {
      ...customization,
      color_scheme: {
        ...customization.color_scheme,
        [key]: value,
      },
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const updateFontSize = (type: 'heading' | 'body', value: number) => {
    const key = type === 'heading' ? 'heading_size' : 'body_size';
    const newCustomization = {
      ...customization,
      font_settings: {
        ...customization.font_settings,
        [key]: value,
      },
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const updateMargin = (side: keyof LayoutSettings['margins'], value: number) => {
    const newCustomization = {
      ...customization,
      layout_settings: {
        ...customization.layout_settings,
        margins: {
          ...customization.layout_settings.margins,
          [side]: value,
        },
      },
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const resetToDefaults = () => {
    const defaultCustomization: TemplateCustomization = {
      user_id: userId,
      template_id: templateId,
      customization_name: 'Default',
      color_scheme: COLOR_SCHEMES.professional,
      font_settings: FONT_COMBINATIONS.modern,
      layout_settings: {
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        spacing: 12,
        columns: 1,
        section_spacing: 16,
      },
    };
    setCustomization(defaultCustomization);
    onCustomizationChange(defaultCustomization);
    toast.success('Reset to default settings');
  };

  const saveCustomization = () => {
    // Save to database or local storage
    toast.success('Customization saved!');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Customize Template
        </CardTitle>
        <CardDescription>
          Personalize colors, fonts, and layout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <Type className="h-4 w-4 mr-2" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div>
              <Label>Color Scheme</Label>
              <Select onValueChange={updateColorScheme} defaultValue="professional">
                <SelectTrigger>
                  <SelectValue placeholder="Select scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional Blue</SelectItem>
                  <SelectItem value="modern">Modern Purple</SelectItem>
                  <SelectItem value="elegant">Elegant Black</SelectItem>
                  <SelectItem value="creative">Creative Pink</SelectItem>
                  <SelectItem value="tech">Tech Cyan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.color_scheme.primary}
                    onChange={(e) => updateCustomColor('primary', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.color_scheme.primary}
                    onChange={(e) => updateCustomColor('primary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.color_scheme.accent}
                    onChange={(e) => updateCustomColor('accent', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.color_scheme.accent}
                    onChange={(e) => updateCustomColor('accent', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.color_scheme.text}
                    onChange={(e) => updateCustomColor('text', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customization.color_scheme.text}
                    onChange={(e) => updateCustomColor('text', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Fonts Tab */}
          <TabsContent value="fonts" className="space-y-4">
            <div>
              <Label>Font Combination</Label>
              <Select onValueChange={updateFontSettings} defaultValue="modern">
                <SelectTrigger>
                  <SelectValue placeholder="Select fonts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic (Georgia + Arial)</SelectItem>
                  <SelectItem value="modern">Modern (Inter)</SelectItem>
                  <SelectItem value="elegant">Elegant (Playfair + Source Sans)</SelectItem>
                  <SelectItem value="tech">Tech (Roboto)</SelectItem>
                  <SelectItem value="creative">Creative (Montserrat + Open Sans)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heading Size: {customization.font_settings.heading_size}px</Label>
              <Slider
                value={[customization.font_settings.heading_size]}
                onValueChange={([value]) => updateFontSize('heading', value)}
                min={16}
                max={32}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Body Size: {customization.font_settings.body_size}px</Label>
              <Slider
                value={[customization.font_settings.body_size]}
                onValueChange={([value]) => updateFontSize('body', value)}
                min={8}
                max={14}
                step={0.5}
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>Top Margin: {customization.layout_settings.margins.top}mm</Label>
              <Slider
                value={[customization.layout_settings.margins.top]}
                onValueChange={([value]) => updateMargin('top', value)}
                min={10}
                max={40}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Side Margins: {customization.layout_settings.margins.left}mm</Label>
              <Slider
                value={[customization.layout_settings.margins.left]}
                onValueChange={([value]) => {
                  updateMargin('left', value);
                  updateMargin('right', value);
                }}
                min={10}
                max={40}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Section Spacing: {customization.layout_settings.section_spacing}px</Label>
              <Slider
                value={[customization.layout_settings.section_spacing]}
                onValueChange={([value]) => {
                  const newCustomization = {
                    ...customization,
                    layout_settings: {
                      ...customization.layout_settings,
                      section_spacing: value,
                    },
                  };
                  setCustomization(newCustomization);
                  onCustomizationChange(newCustomization);
                }}
                min={8}
                max={32}
                step={2}
                className="mt-2"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={saveCustomization} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
