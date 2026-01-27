import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import { AppRouter } from '@/app/components/AppRouter'
import { Toaster } from '@/app/components/ui/sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
    <Toaster />
  </StrictMode>,
)