import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found. Failed to mount the App')
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
)

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service worker registered:', registration)
      })
      .catch(error => {
        console.error('Service worker registration failed:', error)
      })
  })
}
