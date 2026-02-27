import { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
  const [activeProduct, setActiveProductState] = useState(null);

  const setActiveProduct = useCallback((product) => {
    setActiveProductState(product);
  }, []);

  const clearProduct = useCallback(() => setActiveProductState(null), []);

  return (
    <ProductContext.Provider value={{ activeProduct, setActiveProduct, clearProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProduct must be used inside ProductProvider');
  return ctx;
}
