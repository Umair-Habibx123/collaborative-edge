import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx';
import { installCredentialedHttp } from './lib/httpCredentials.js';

// Make every request to our backend carry the auth cookie automatically.
installCredentialedHttp();

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);
