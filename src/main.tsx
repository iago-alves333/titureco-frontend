import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // 4xx won't fix itself on retry; retry once only for network errors and 5xx.
      retry: (count, err) => {
        const status = (err as { response?: { status?: number } }).response?.status
        return count < 1 && (status === undefined || status >= 500)
      },
    },
  },
})

// react-leaflet v5 handles StrictMode's mount→unmount→remount, so StrictMode is back on.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
)
