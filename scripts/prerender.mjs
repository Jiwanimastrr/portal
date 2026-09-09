import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

// Render the same public landing component used by the browser. Teacher tools
// remain closed, and no submitted form data or runtime credentials are read.
const output = resolve('dist/index.html')
const temporaryOutput = await mkdtemp(resolve('.prerender-'))
try {
  await build({
    publicDir: false,
    build: {
      ssr: resolve('src/entry-server.tsx'),
      outDir: temporaryOutput,
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
    },
  })
  const { render, academyStructuredData, renderProgramGuides } = await import(pathToFileURL(join(temporaryOutput, 'entry-server.mjs')).href)
  const copyrightYear = new Date().getFullYear()
  const html = await readFile(output, 'utf8')
  const placeholder = '<div id="root"><!--app-html--></div>'
  if (!html.includes(placeholder)) throw new Error('Missing public-page render placeholder')
  const rendered = render(copyrightYear)
  const schemaPlaceholder = '<!--structured-data-->'
  if (!html.includes(schemaPlaceholder)) throw new Error('Missing structured-data placeholder')
  const schema = JSON.stringify(academyStructuredData()).replace(/</g, '\\u003c')
  await writeFile(output, html.replace(placeholder, () =>
    `<div id="root" data-prerendered="true" data-build-year="${copyrightYear}">${rendered}</div>`)
    .replace(schemaPlaceholder, () => `<script type="application/ld+json">${schema}</script>`))
  console.log('Public homepage HTML rendered; teacher cards remain closed.')
  const escapeHtml = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  for (const guide of renderProgramGuides()) {
    const url = 'https://willgrow.pages.dev/programs/' + guide.slug + '/'
    const guideSchema = JSON.stringify(guide.schema).replace(/</g, '\\u003c')
    const page = html
      .replace(/<title>[^<]*<\/title>/, () => '<title>' + escapeHtml(guide.title) + '</title>')
      .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, (_, before, after) => before + escapeHtml(guide.description) + after)
      .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, (_, before, after) => before + url + after)
      .replace(/(<meta property="og:title" content=")[^"]*("\s*\/?>)/, (_, before, after) => before + escapeHtml(guide.title) + after)
      .replace(/(<meta property="og:description" content=")[^"]*("\s*\/?>)/, (_, before, after) => before + escapeHtml(guide.description) + after)
      .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, (_, before, after) => before + url + after)
      .replace(schemaPlaceholder, () => '<script type="application/ld+json">' + guideSchema + '</script>')
      .replace(placeholder, () => '<div id="root">' + guide.body + '</div>')
      .replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, '')
    const directory = resolve('dist/programs', guide.slug)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.html'), page)
  }
  console.log('Public course guides rendered as complete static HTML.')
} finally {
  await rm(temporaryOutput, { recursive: true, force: true })
}
