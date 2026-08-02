import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { SessionProvider } from '@/session/SessionContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </LanguageProvider>
  </React.StrictMode>
);
