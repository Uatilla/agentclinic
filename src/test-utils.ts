// Shared assertions for rendered pages, reused by route tests in every phase.

export const expectedStylesheets = ['/public/vendor/pico.min.css', '/public/styles.css']

/** The `href` of every `<link rel="stylesheet">`, in document order. */
export const stylesheetHrefs = (html: string) =>
  [...html.matchAll(/<link\b[^>]*\brel="stylesheet"[^>]*>/g)].map(
    ([tag]) => tag.match(/\bhref="([^"]+)"/)?.[1],
  )
