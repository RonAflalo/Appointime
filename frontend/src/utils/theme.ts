import { Theme } from '../types';

export const applyTheme = (theme: Theme) => {
  // Apply color scheme
  document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
  document.documentElement.style.setProperty('--background-color', theme.colors.background);
  document.documentElement.style.setProperty('--text-color', theme.colors.text);
  
  // Apply typography
  document.documentElement.style.setProperty('--font-family', theme.typography.fontFamily);
  document.documentElement.style.setProperty('--font-size', theme.typography.fontSize);
  
  // Apply spacing
  document.documentElement.style.setProperty('--spacing-unit', theme.spacing.unit);
  
  // Apply border radius
  document.documentElement.style.setProperty('--border-radius', theme.borderRadius);
  
  // Apply shadows
  document.documentElement.style.setProperty('--box-shadow', theme.shadows.box);
};

export const getDefaultTheme = (): Theme => ({
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529'
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '16px'
  },
  spacing: {
    unit: '8px'
  },
  borderRadius: '4px',
  shadows: {
    box: '0 2px 4px rgba(0,0,0,0.1)'
  }
}); 