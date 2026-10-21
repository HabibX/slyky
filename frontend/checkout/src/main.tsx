import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Legacy compatibility: /?id=xxx → /checkout/xxx
const params = new URLSearchParams(window.location.search);
const legacyId = params.get('id');
if (legacyId && window.location.pathname === '/') {
  window.history.replaceState({}, '', `/checkout/${legacyId}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);