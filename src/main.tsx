import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

// ponytail: No StrictMode — Leaflet manipulates the DOM directly and
// can't survive the mount→unmount→remount cycle StrictMode forces in dev.
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
