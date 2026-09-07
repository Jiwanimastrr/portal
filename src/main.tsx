import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!
const copyrightYear = Number(container.dataset.buildYear) || new Date().getFullYear()
const app = (
  <StrictMode>
    <App copyrightYear={copyrightYear} />
  </StrictMode>
)

if (container.dataset.prerendered === 'true') {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
