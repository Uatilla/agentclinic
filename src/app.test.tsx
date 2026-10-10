import { describe, expect, test, vi } from 'vitest'
import * as appModule from './app.tsx'
import { seedAgentAilments, seedAgents, seedAilments, seedTherapies } from './db/seed.ts'
import { agents } from './db/schema.ts'
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

  test('links all three cards; nothing is "Coming soon" any more', async () => {
    const html = await (await get()).text()
    expect(html).toContain('<h2><a href="/agents">Agents</a></h2>')
    expect(html).toContain('<h2><a href="/ailments">Ailments</a></h2>')
    expect(html).toContain('<h2><a href="/therapies">Therapies</a></h2>')
    expect(html).not.toContain('Coming soon')
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
    for (const { id, name } of seedAilments) {
      const agentCount = seedAgentAilments.filter(({ ailmentId }) => ailmentId === id).length
      const card = cards.find((card) => card.includes(`<h2>${name}</h2>`))
      const label = `${agentCount} ${agentCount === 1 ? 'agent' : 'agents'} affected`
      expect(card, name).toContain(label)
    }
  })
})

describe('GET /therapies', () => {
  const get = () => app.request('/therapies')

  test('returns 200 with HTML', async () => {
    const res = await get()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/^text\/html/)
  })

  test('meets the page baseline', async () => {
    expectPageBaseline(await (await get()).text())
  })

  test('lists every seeded therapy with description and duration, linking to it', async () => {
    const html = await (await get()).text()
    const cards = html.split('<article').slice(1)
    expect(cards).toHaveLength(seedTherapies.length)
    for (const { id, name, description, duration } of seedTherapies) {
      const card = cards.find((card) => card.includes(`<a href="/therapies/${id}">${name}</a>`))
      expect(card, name).toContain(description)
      expect(card, name).toContain(duration)
    }
  })
})

describe('GET /therapies/:id', () => {
  test.each(seedTherapies)(
    'therapy $id: returns 200 with name, description and duration',
    async ({ id, name, description, duration }) => {
      const res = await app.request(`/therapies/${id}`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expectPageBaseline(html)
      expect(html).toContain(`<h1>${name}</h1>`)
      expect(html).toContain(description)
      expect(html).toContain(duration)
      expect(html).toContain(`<title>${name} · AgentClinic</title>`)
    },
  )

  test('links back to the therapies list', async () => {
    const html = await (await app.request('/therapies/1')).text()
    expect(linkHrefs(html)).toContain('/therapies')
  })
})

// Expected values come from the seed fixtures, not from the queries under test
const severityLabels = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' } as const
const diagnosesOf = (agentId: number) =>
  seedAgentAilments
    .filter((row) => row.agentId === agentId)
    .map(({ ailmentId, severity }) => ({
      name: seedAilments.find(({ id }) => id === ailmentId)!.name,
      label: severityLabels[severity],
    }))

describe('GET /agents/:id', () => {
  test.each(seedAgents)(
    'agent $id: returns 200 with name, model, bio and each ailment with its severity label',
    async ({ id, name, model, bio }) => {
      const res = await app.request(`/agents/${id}`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expectPageBaseline(html)
      expect(html).toContain(`<h1>${name}</h1>`)
      expect(html).toContain(model)
      expect(html).toContain(bio)

      const expected = diagnosesOf(id)
      expect(expected.length).toBeGreaterThan(0)
      const rows = html.split('<li>').filter((li) => li.includes('class="badge badge-'))
      expect(rows).toHaveLength(expected.length)
      for (const { name: ailment, label } of expected) {
        const row = rows.find((li) => li.includes(`<span>${ailment}</span>`))
        expect(row, ailment).toContain(`>${label}</span>`)
      }
    },
  )

  test('shows "Clean bill of health." for an agent with no ailments', async () => {
    const healthyDb = createTestDb()
    healthyDb
      .insert(agents)
      .values({ id: 99, name: 'Healthy Hal', model: 'Fresh', bio: 'Fine.' })
      .run()
    const html = await (await appModule.createApp(healthyDb).request('/agents/99')).text()
    expectPageBaseline(html)
    expect(html).toContain('Clean bill of health.')
    expect(html).not.toContain('class="diagnoses"')
  })

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
  test.each([
    '/agents/9999',
    '/agents/abc',
    '/agents/1.5',
    '/therapies/9999',
    '/therapies/abc',
    '/nope',
  ])(
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
const pages = [
  '/',
  '/agents',
  ...seedAgents.map(({ id }) => `/agents/${id}`),
  '/ailments',
  '/therapies',
  ...seedTherapies.map(({ id }) => `/therapies/${id}`),
  '/nope',
]

describe('every page', () => {
  test.each(pages)('%s meets the page baseline', async (path) => {
    expectPageBaseline(await (await app.request(path)).text())
  })

  test.each(pages)('%s has the header nav: brand and the four sections', async (path) => {
    const html = await (await app.request(path)).text()
    const nav = html.match(/<nav[^>]*aria-label="Main"[^>]*>[\s\S]*?<\/nav>/)?.[0]
    expect(nav).toBeDefined()
    expect(linkHrefs(nav!)).toEqual(['/', '/', '/agents', '/ailments', '/therapies'])
    expect(nav).toMatch(/<a href="\/" class="brand">/)
  })

  // Replaces Phase 1's "no <a> links" guard: links are fine as long as they lead to a real page
  test.each(pages)('every internal link on %s resolves (not 404)', async (path) => {
    const html = await (await app.request(path)).text()
    const internal = linkHrefs(html).filter((href) => href.startsWith('/'))
    expect(internal.length).toBeGreaterThan(0)
    for (const href of internal) {
      expect((await app.request(href)).status, `${path} → ${href}`).toBe(200)
    }
  })
})

describe('nav marks the current section', () => {
  test.each([
    ['/', '/'],
    ['/agents', '/agents'],
    ['/agents/1', '/agents'],
    ['/ailments', '/ailments'],
    ['/therapies', '/therapies'],
    ['/therapies/1', '/therapies'],
  ])('on %s, %s is the current page', async (path, current) => {
    const html = await (await app.request(path)).text()
    const currentLinks = [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)]
    expect(currentLinks.map(([, href]) => href)).toEqual([current])
  })

  test.each(['/nope', '/agents/9999', '/agents/abc', '/ailments/1', '/therapies/9999'])(
    'no section is current on the 404 page at %s',
    async (path) => {
      const res = await app.request(path)
      expect(res.status).toBe(404)
      expect(await res.text()).not.toContain('aria-current')
    },
  )
})

describe('server errors', () => {
  test('an unexpected error returns 500 with an error page inside the layout', async () => {
    const brokenDb = createTestDb()
    brokenDb.$client.close()
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await appModule.createApp(brokenDb).request('/agents')
    errors.mockRestore()

    expect(res.status).toBe(500)
    const html = await res.text()
    expectPageBaseline(html)
    expect(html).toContain('500: we’ve lost our train of thought')
    expect(html).not.toContain('aria-current')
    expect(linkHrefs(html)).toContain('/')
  })
})

describe('scope guards', () => {
  // Replaces Phase 2's "no /therapies route" guard: booking and the dashboard stay in the backlog
  test.each(['/appointments', '/dashboard'])('there is no %s route (backlog)', async (path) => {
    expect((await app.request(path)).status).toBe(404)
  })

  test.each(['/agents', '/therapies'])('there are no write routes: POST %s', async (path) => {
    expect((await app.request(path, { method: 'POST' })).status).toBe(404)
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
