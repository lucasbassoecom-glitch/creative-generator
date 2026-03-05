import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { FormatProvider } from './context/FormatContext';
import { PersonaProvider } from './context/PersonaContext';
import { ProductProvider } from './context/ProductContext';
import Sidebar from './components/Common/Sidebar';
import Dashboard from './pages/Dashboard';
import PersonasPage from './pages/PersonasPage';
import ProductsPage from './pages/ProductsPage';
import TemplatesPage from './pages/TemplatesPage';
import GeneratorPage from './pages/GeneratorPage';
import LibraryPage from './pages/LibraryPage';
import BatchPage from './pages/BatchPage';
import FormatPage from './pages/FormatPage';
import AICreatorPage from './pages/AICreatorPage';
import IteratePage from './pages/IteratePage';
import AnalyticsPage from './pages/AnalyticsPage';
import QuickSessionPage from './pages/QuickSessionPage';

const PAGES = {
  dashboard: Dashboard,
  personas: PersonasPage,
  products: ProductsPage,
  templates: TemplatesPage,
  generator: GeneratorPage,
  library: LibraryPage,
  batch: BatchPage,
  formats: FormatPage,
  'ai-creator': AICreatorPage,
  iterate: IteratePage,
  analytics: AnalyticsPage,
  'quick-session': QuickSessionPage,
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setApiStatus)
      .catch(() => setApiStatus({ status: 'error' }));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case 'n': setCurrentPage('ai-creator'); break;
        case 'i': setCurrentPage('iterate'); break;
        case 's': setCurrentPage('quick-session'); break;
        case 'a': setCurrentPage('analytics'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const PageComponent = PAGES[currentPage] || Dashboard;

  return (
    <FormatProvider>
    <PersonaProvider>
    <ProductProvider>
    <div className="flex h-screen bg-[#0f0f11] text-zinc-100 overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} apiStatus={apiStatus} />
      <main className="flex-1 overflow-y-auto">
        <PageComponent onNavigate={setCurrentPage} />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#27272a',
            color: '#fafafa',
            border: '1px solid #3f3f46',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </div>
    </ProductProvider>
    </PersonaProvider>
    </FormatProvider>
  );
}
