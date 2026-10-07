import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// One-time migration: clear any stale localStorage tokens
// (we now use sessionStorage so sessions clear on browser close)
localStorage.removeItem('token');
localStorage.removeItem('user');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
