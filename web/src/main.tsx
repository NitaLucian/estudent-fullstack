import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// QueryClient păstrează în memorie (cache) răspunsurile API-ului.
// staleTime: cât timp (ms) datele sunt considerate „proaspete” și nu se recer.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

// React preia controlul elementului <div id="root"> din index.html
// și desenează în el componenta App.
// BrowserRouter leagă aplicația de adresa din bara browserului.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
