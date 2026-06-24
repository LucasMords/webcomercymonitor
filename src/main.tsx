import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress THREE.Clock deprecation (used internally by @react-three/fiber)
const origWarn = console.warn
console.warn = (...args: unknown[]) => {
  const msg = String(args[0])
  if (msg.includes('THREE.Clock') && msg.includes('deprecated')) return
  origWarn(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
