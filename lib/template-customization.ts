export interface TemplateCustomization {
  id?: string;
  user_id: string;
  template_id: string;
  customization_name: string;
  color_scheme: ColorScheme;
  font_settings: FontSettings;
  layout_settings: LayoutSettings;
  created_at?: string;
  updated_at?: string;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  heading: string;
}

export interface FontSettings {
  heading_font: string;
  body_font: string;
  heading_size: number;
  body_size: number;
  line_height: number;
}

export interface LayoutSettings {
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  spacing: number;
  columns: number;
  section_spacing: number;
}

// Predefined color schemes
export const COLOR_SCHEMES: Record<string, ColorScheme> = {
  professional: {
    primary: '#2563EB',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    text: '#1F2937',
    background: '#FFFFFF',
    heading: '#111827',
  },
  modern: {
    primary: '#7C3AED',
    secondary: '#6D28D9',
    accent: '#A78BFA',
    text: '#374151',
    background: '#FFFFFF',
    heading: '#1F2937',
  },
  elegant: {
    primary: '#000000',
    secondary: '#374151',
    accent: '#6B7280',
    text: '#1F2937',
    background: '#FFFFFF',
    heading: '#000000',
  },
  creative: {
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F472B6',
    text: '#1F2937',
    background: '#FFFFFF',
    heading: '#BE185D',
  },
  tech: {
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#38BDF8',
    text: '#1E293B',
    background: '#FFFFFF',
    heading: '#0F172A',
  },
};

// Predefined font combinations
export const FONT_COMBINATIONS: Record<string, FontSettings> = {
  classic: {
    heading_font: 'Georgia, serif',
    body_font: 'Arial, sans-serif',
    heading_size: 24,
    body_size: 11,
    line_height: 1.6,
  },
  modern: {
    heading_font: 'Inter, sans-serif',
    body_font: 'Inter, sans-serif',
    heading_size: 22,
    body_size: 10,
    line_height: 1.5,
  },
  elegant: {
    heading_font: 'Playfair Display, serif',
    body_font: 'Source Sans Pro, sans-serif',
    heading_size: 26,
    body_size: 11,
    line_height: 1.7,
  },
  tech: {
    heading_font: 'Roboto, sans-serif',
    body_font: 'Roboto, sans-serif',
    heading_size: 20,
    body_size: 10,
    line_height: 1.5,
  },
  creative: {
    heading_font: 'Montserrat, sans-serif',
    body_font: 'Open Sans, sans-serif',
    heading_size: 24,
    body_size: 11,
    line_height: 1.6,
  },
};

// Default layout settings
export const DEFAULT_LAYOUT: LayoutSettings = {
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  spacing: 12,
  columns: 1,
  section_spacing: 16,
};

export class TemplateCustomizationService {
  /**
   * Apply customization to template
   */
  applyCustomization(
    baseTemplate: any,
    customization: TemplateCustomization
  ): any {
    return {
      ...baseTemplate,
      colors: customization.color_scheme,
      fonts: customization.font_settings,
      layout: customization.layout_settings,
    };
  }

  /**
   * Generate CSS variables from customization
   */
  generateCSSVariables(customization: TemplateCustomization): string {
    const { color_scheme, font_settings, layout_settings } = customization;

    return `
      :root {
        --color-primary: ${color_scheme.primary};
        --color-secondary: ${color_scheme.secondary};
        --color-accent: ${color_scheme.accent};
        --color-text: ${color_scheme.text};
        --color-background: ${color_scheme.background};
        --color-heading: ${color_scheme.heading};
        
        --font-heading: ${font_settings.heading_font};
        --font-body: ${font_settings.body_font};
        --font-size-heading: ${font_settings.heading_size}px;
        --font-size-body: ${font_settings.body_size}px;
        --line-height: ${font_settings.line_height};
        
        --margin-top: ${layout_settings.margins.top}mm;
        --margin-right: ${layout_settings.margins.right}mm;
        --margin-bottom: ${layout_settings.margins.bottom}mm;
        --margin-left: ${layout_settings.margins.left}mm;
        --spacing: ${layout_settings.spacing}px;
        --section-spacing: ${layout_settings.section_spacing}px;
      }
    `;
  }

  /**
   * Create default customization
   */
  createDefaultCustomization(
    userId: string,
    templateId: string,
    name: string = 'Default'
  ): TemplateCustomization {
    return {
      user_id: userId,
      template_id: templateId,
      customization_name: name,
      color_scheme: COLOR_SCHEMES.professional,
      font_settings: FONT_COMBINATIONS.modern,
      layout_settings: DEFAULT_LAYOUT,
    };
  }
}

export const templateCustomizationService = new TemplateCustomizationService();
