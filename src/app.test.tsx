import { describe, expect, test } from 'vitest'
import * as appModule from './app.tsx'
import { getAgentWithAilments, listAilmentsWithCounts } from './db/queries.ts'
import { seedAgents, seedAilments } from './db/seed.ts'
import { createTestDb } from './db/test-db.ts'
import {
  expectedStylesheets,
  expectPageBaseline,
  linkHrefs,
  stylesheetHrefs,
} from './test-utils.ts'

const db = createTestDb()
const app = appModule.createApp(db)

test('the app module only exports createApp, so importing it opens no database', () => {
  expect(Object.keys(appModule)).toEqual(['createApp'])
})

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

  test('links the Agents and Ailments cards; Therapies is still coming soon', async () => {
    const html = await (await get()).text()
    expect(html).toContain('<h2><a href="/agents">Agents</a></h2>')
    expect(html).toContain('<h2><a href="/ailments">Ailments</a></h2>')
    expect(html).toContain('<h2>Therapies</h2>')
    expect(html.match(/Coming soon/g)).toHaveLength(1)
    const therapiesCard = html.split('<article').find((card) => card.includes('Therapies'))
    expect(therapiesCard).toContain('Coming soon')
    expect(therapiesCard).not.toMatch(/<a\s/)
  })
})

describe('GET /agents', () => {
  const get = () => app.request('/agents')

  test('returns 200 with HTML', async () => {
    const res = await get()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/^text\/html/)
  })

  test('meets the page baseline', async () => {
    expectPageBaseline(await (await get()).text())
  })

  test('lists every seeded agent with their model, linking to their profile', async () => {
    const html = await (await get()).text()
    for (const { id, name, model } of seedAgents) {
      expect(html).toContain(`<a href="/agents/${id}">${name}</a>`)
      expect(html).toContain(model)
    }
    const profileLinks = linkHrefs(html).filter((href) => href.startsWith('/agents/'))
    expect(profileLinks).toHaveLength(seedAgents.length)
  })
})

describe('GET /ailments', () => {
  const get = () => app.request('/ailments')

  test('returns 200 with HTML', async () => {
    const res = await get()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/^text\/html/)
  })

  test('meets the page baseline', async () => {
    expectPageBaseline(await (await get()).text())
  })

  test('lists every seeded ailment with its description', async () => {
    const html = await (await get()).text()
    for (const { name, description } of seedAilments) {
      expect(html).toContain(`<h2>${name}</h2>`)
      expect(html).toContain(description)
    }
  })

  test('shows how many agents have each ailment', async () => {
    const html = await (await get()).text()
    const cards = html.split('<article').slice(1)
    for (const { name, agentCount } of listAilmentsWithCounts(db)) {
      const card = cards.find((card) => card.includes(`<h2>${name}</h2>`))
      const label = `${agentCount} ${agentCount === 1 ? 'agent' : 'agents'} affected`
      expect(card, name).toContain(label)
    }
  })
})

describe('GET /agents/:id', () => {
  test.each(seedAgents.map(({ id }) => id))(
    'agent %i: returns 200 with name, model, bio and each ailment with its severity',
    async (id) => {
      const res = await app.request(`/agents/${id}`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expectPageBaseline(html)

      const agent = getAgentWithAilments(db, id)!
      expect(html).toContain(`<h1>${agent.name}</h1>`)
      expect(html).toContain(agent.model)
      expect(html).toContain(agent.bio)
      const diagnoses = html.split('<li>').slice(1)
      for (const { name, severity } of agent.ailments) {
        const row = diagnoses.find((li) => li.includes(`<span>${name}</span>`))
        expect(row, name).toContain(`badge-${severity}`)
      }
      expect(diagnoses.filter((li) => li.includes('class="badge badge-'))).toHaveLength(
        agent.ailments.length,
      )
    },
  )

  test('lists ailments most severe first', async () => {
    const html = await (await app.request('/agents/5')).text()
    const order = ['Infinite loops', 'Token anxiety', 'Hallucinations'].map((name) =>
      html.indexOf(`<span>${name}</span>`),
    )
    expect(order.every((at) => at > -1)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  test('links back to the agents list', async () => {
    const html = await (await app.request('/agents/1')).text()
    expect(linkHrefs(html)).toContain('/agents')
  })
})

describe('not found', () => {
  test.each(['/agents/9999', '/agents/abc', '/agents/1.5', '/nope'])(
    'GET %s returns 404 with the not-found page inside the layout',
    async (path) => {
      const res = await app.request(path)
      expect(res.status).toBe(404)
      expect(res.headers.get('content-type')).toMatch(/^text\/html/)
      const html = await res.text()
      expectPageBaseline(html)
      expect(html).toContain('404: this page has been hallucinated')
      expect(linkHrefs(html)).toContain('/agents')
    },
  )
})

// Every page the app serves, including a 404 (status checked per page above)
const pages = ['/', '/agents', ...seedAgents.map(({ id }) => `/agents/${id}`), '/ailments', '/nope']

describe('every page', () => {
  test.each(pages)('%s meets the page baseline', async (path) => {
    expectPageBaseline(await (await app.request(path)).text())
  })

  test.each(pages)('%s has the header nav to Home, Agents and Ailments', async (path) => {
    const html = await (await app.request(path)).text()
    const nav = html.match(/<nav[^>]*aria-label="Main"[^>]*>[\s\S]*?<\/nav>/)?.[0]
    expect(nav).toBeDefined()
    expect(linkHrefs(nav!)).toEqual(['/', '/agents', '/ailments'])
  })

  // Replaces Phase 1's "no <a> links" guard: links are fine as long as they lead somewhere
  test.each(pages)('every internal link on %s resolves (not 404)', async (path) => {
    const html = await (await app.request(path)).text()
    const internal = linkHrefs(html).filter((href) => href.startsWith('/'))
    expect(internal.length).toBeGreaterThan(0)
    for (const href of internal) {
      expect((await app.request(href)).status, `${path} → ${href}`).not.toBe(404)
    }
  })
})

describe('nav marks the current section', () => {
  test.each([
    ['/', '/'],
    ['/agents', '/agents'],
    ['/agents/1', '/agents'],
    ['/ailments', '/ailments'],
  ])('on %s, %s is the current page', async (path, current) => {
    const html = await (await app.request(path)).text()
    const currentLinks = [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)]
    expect(currentLinks.map(([, href]) => href)).toEqual([current])
  })

  test('no section is current on the 404 page', async () => {
    const html = await (await app.request('/nope')).text()
    expect(html).not.toContain('aria-current')
  })
})

describe('scope guards', () => {
  test('there is no /therapies route yet (Phase 3)', async () => {
    expect((await app.request('/therapies')).status).toBe(404)
  })

  test('there are no write routes', async () => {
    expect((await app.request('/agents', { method: 'POST' })).status).toBe(404)
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
