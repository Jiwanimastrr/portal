import { StrictMode } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import App from './App'
import { ProgramGuidePage } from './components/ProgramGuidePage'
import { PROGRAM_GUIDES } from './programContent'
import { programStructuredData } from './academySchema'
export { academyStructuredData } from './academySchema'

export function render(copyrightYear: number) {
  return renderToString(<StrictMode><App copyrightYear={copyrightYear} /></StrictMode>)
}

export function renderProgramGuides() {
  return PROGRAM_GUIDES.map(guide => ({
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    body: renderToStaticMarkup(<ProgramGuidePage guide={guide} />),
    schema: programStructuredData(guide),
  }))
}
