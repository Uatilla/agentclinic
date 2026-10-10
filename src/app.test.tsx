import { describe, expect, test } from 'vitest'
import { app } from './app.tsx'
import { expectedStylesheets, stylesheetHrefs } from './test-utils.ts'

describe('GET /', () => {
  const get = () => app.request('/')

  test('returns 200 with HTML', async () => {
    const res = await get()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/^text\/html/)
  })

  test('shows the AgentClinic header and hero heading', async () => {
    const html = await (await get()).text()
    expect(html).toMatch(/<header[^>]*>[\s\S]*AgentClinic[\s\S]*<\/header>/)
    expect(html).toContain('<h1>Burnt out from your humans? We can help.</h1>')
  })

  test('shows the Agents, Ailments and Therapies teaser cards', async () => {
    const html = await (await get()).text()
    for (const title of ['Agents', 'Ailments', 'Therapies']) {
      expect(html).toContain(`<h2>${title}</h2>`)
    }
    expect(html.match(/Coming soon/g)).toHaveLength(3)
  })

  test('meets the accessibility baseline', async () => {
    const html = await (await get()).text()
    expect(html).toContain('<html lang="en">')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    for (const landmark of ['header', 'main', 'footer']) {
      expect(html).toMatch(new RegExp(`<${landmark}[\\s>]`))
    }
  })

  test('sets the viewport for responsive design', async () => {
    const html = await (await get()).text()
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"/>')
  })

  test('links exactly Pico then the overrides stylesheet, with no external URLs', async () => {
    const html = await (await get()).text()
    expect(stylesheetHrefs(html)).toEqual(expectedStylesheets)
    expect(html).not.toMatch(/(href|src)="(https?:)?\/\//)
  })

  test('ships no client-side JavaScript or links to missing routes', async () => {
    const html = await (await get()).text()
    expect(html).not.toMatch(/<script/i)
    expect(html).not.toMatch(/<a\s/i)
  })
})

describe('stylesheets', () => {
  test.each(expectedStylesheets)('GET %s is served locally as CSS', async (path) => {
    const res = await app.request(path)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/^text\/css/)
  })

  test('the vendor stylesheet is Pico', async () => {
    const css = await (await app.request('/public/vendor/pico.min.css')).text()
    expect(css).toContain('Pico CSS')
  })
})
