import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/i18n/config'
import i18n from '@/i18n/config'
import App from './App.tsx'

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
)