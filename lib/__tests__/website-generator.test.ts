import { analyzePrompt, buildWebAppAnalysis } from '../website-generator';

describe('Website Generator Utilities', () => {
  describe('analyzePrompt', () => {
    it('should identify a web app based on keywords', () => {
      const prompt = 'create a calculator app that works on mobile';
      const result = analyzePrompt(prompt);
      
      expect(result.isWebApp).toBe(true);
      expect(result.type).toBe('Calculator App');
      expect(result.features).toContain('Number input buttons (0-9)');
    });

    it('should identify an e-commerce website', () => {
      const prompt = 'I want an online store to sell my shoes with a shopping cart';
      const result = analyzePrompt(prompt);
      
      expect(result.isWebApp).toBe(false);
      expect(result.type).toBe('E-commerce / Online Store');
      expect(result.features).toContain('Shopping Cart');
    });

    it('should identify a portfolio website', () => {
      const prompt = 'build a personal portfolio website to showcase my design work';
      const result = analyzePrompt(prompt);
      
      expect(result.isWebApp).toBe(false);
      expect(result.type).toBe('Portfolio / Personal Website');
      expect(result.sections).toContain('Project Showcase');
    });

    it('should default to General Business Website if no specific type is detected', () => {
      const prompt = 'make a basic page with some information';
      const result = analyzePrompt(prompt);
      
      expect(result.isWebApp).toBe(false);
      expect(result.type).toBe('General Business Website');
    });
  });

  describe('buildWebAppAnalysis', () => {
    it('should return specific configs for known app types', () => {
      const type = 'Weather App';
      const result = buildWebAppAnalysis(type, 'make a weather app');
      
      expect(result.type).toBe(type);
      expect(result.isWebApp).toBe(true);
      expect(result.features).toContain('City search');
    });

    it('should return default config for unknown app types', () => {
      const type = 'Unknown App';
      const result = buildWebAppAnalysis(type, 'make an unknown app');
      
      expect(result.type).toBe(type);
      expect(result.isWebApp).toBe(true);
      expect(result.features).toContain('Interactive functionality');
    });
  });
});
