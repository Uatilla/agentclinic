// Shared assertions for rendered pages, reused by route tests in every phase.
import { expect } from 'vitest'

export const expectedStylesheets = ['/public/vendor/pico.min.css', '/public/styles.css']

/** The `href` of every `<link rel="stylesheet">`, in document order. */
export const stylesheetHrefs = (html: string) =>
  [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(
    ([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1],
  )

/** The `href` of every `<a>`, in document order. */
export const linkHrefs = (html: string) =>
  [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(([, href]) => href)

/** The baseline every page meets: accessibility, responsive meta, local styles, no JS. */
export const expectPageBaseline = (html: string) => {
  expect(html).toContain('<html lang="en">')
  expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
  for (const landmark of ['header', 'main', 'footer']) {
    expect(html).toMatch(new RegExp(`<${landmark}[\\s>]`))
  }
  expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"/>')
  expect(stylesheetHrefs(html)).toEqual(expectedStylesheets)
  expect(html).not.toMatch(/(href|src)="(https?:)?\/\//)
  expect(html).not.toMatch(/<script/i)
}
