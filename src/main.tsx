import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { purgeAllAppCaches } from './lib/custodySeed';

// Clear stale service worker and HTTP caches on startup to ensure mobile phones show latest data
if (typeof window !== 'undefined') {
  try {
    purgeAllAppCaches();
  } catch (e) {
    console.debug('Cache purge notice:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

