import { createContext, useContext, useState, useCallback } from 'react';

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  // Active personas (array — supports multi-select for comparison)
  const [activePersonas, setActivePersonas] = useState([]);

  const togglePersona = useCallback((persona) => {
    setActivePersonas(prev => {
      const exists = prev.find(p => p.id === persona.id);
      if (exists) return prev.filter(p => p.id !== persona.id);
      return [...prev, persona];
    });
  }, []);

  const setPersona = useCallback((persona) => {
    setActivePersonas(persona ? [persona] : []);
  }, []);

  const clearPersonas = useCallback(() => setActivePersonas([]), []);

  const isActive = useCallback((id) => activePersonas.some(p => p.id === id), [activePersonas]);

  // Primary persona (first selected)
  const primaryPersona = activePersonas[0] || null;

  return (
    <PersonaContext.Provider value={{ activePersonas, primaryPersona, togglePersona, setPersona, clearPersonas, isActive }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used inside PersonaProvider');
  return ctx;
}
