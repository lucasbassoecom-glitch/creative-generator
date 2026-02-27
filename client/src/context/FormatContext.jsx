import { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_FORMAT } from '../utils/formats';

const FormatContext = createContext(null);

export function FormatProvider({ children }) {
  const [selectedFormat, setSelectedFormat] = useState(DEFAULT_FORMAT);
  const [customFormat, setCustomFormat] = useState(null);

  // The active format is either a custom one or a preset
  const activeFormat = customFormat || selectedFormat;

  const selectPreset = useCallback((format) => {
    setSelectedFormat(format);
    setCustomFormat(null);
  }, []);

  const selectCustom = useCallback((width, height, label = 'Personnalisé') => {
    setCustomFormat({ id: 'custom', label, width, height, description: `${width}×${height} px`, tags: ['custom'] });
  }, []);

  const clearCustom = useCallback(() => setCustomFormat(null), []);

  return (
    <FormatContext.Provider value={{ activeFormat, selectedFormat, customFormat, selectPreset, selectCustom, clearCustom }}>
      {children}
    </FormatContext.Provider>
  );
}

export function useFormat() {
  const ctx = useContext(FormatContext);
  if (!ctx) throw new Error('useFormat must be used inside FormatProvider');
  return ctx;
}
