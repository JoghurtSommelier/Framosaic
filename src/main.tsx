import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyThemeClass, getInitialTheme } from './lib/theme'

// Applied before first render (not persisted) to minimize a light/dark flash.
applyThemeClass(getInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
