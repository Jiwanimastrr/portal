import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
export { academyStructuredData } from './academySchema'

export function render(copyrightYear: number) {
  return renderToString(<StrictMode><App copyrightYear={copyrightYear} /></StrictMode>)
}
