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
