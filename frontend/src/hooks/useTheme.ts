import { useState, useEffect } from 'react';
import { Theme } from '../types';
import { getSiteSettings } from '../api/entities';
import { applyTheme } from '../utils/theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await getSiteSettings();
        setTheme(settings.theme);
        applyTheme(settings.theme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  return { theme, loading };
}; 