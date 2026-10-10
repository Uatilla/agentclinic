import { describe, expect, test, vi } from 'vitest'
import * as appModule from './app.tsx'
import {
  seedAgentAilments,
  seedAgents,
  seedAilments,
  seedTherapies,
  seedTherapyAilments,
} from './db/seed.ts'
import { agentAilments, agents, ailments, therapies, therapyAilments } from './db/schema.ts'
import { createTestDb } from './db/test-db.ts'
import {
  expectedStylesheets,
  expectPageBaseline,
  linkHrefs,
  stylesheetHrefs,
} from './test-utils.ts'

const db = createTestDb()
const app = appModule.createApp(db)

// Expected detail-list rows, built from the seed fixtures (not from the queries under test)
const effectivenessRank = { high: 0, medium: 1, low: 2 } as const
const severityRank = { severe: 0, moderate: 1, mild: 2 } as const
const effectivenessLabels = { low: 'Low', medium: 'Medium', high: 'High' } as const
const severityLabels = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' } as const
const nameOf = (rows: { id: number; name: string }[], id: number) =>
  rows.find((row) => row.id === id)!.name
// Names compare by code unit, like SQLite's default BINARY collation
const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
const byRankThenName = <T extends { rank: number; name: string }>(a: T, b: T) =>
  a.rank - b.rank || byName(a.name, b.name)

/** Therapies for an ailment, best first, as `{ href, name, measure, label }` rows. */
const therapiesFor = (ailmentId: number) =>
  seedTherapyAilments
    .filter((row) => row.ailmentId === ailmentId)
    .map(({ therapyId, effectiveness }) => ({
      href: `/therapies/${therapyId}`,
      name: nameOf(seedTherapies, therapyId),
      measure: 'Effectiveness',
      label: effectivenessLabels[effectiveness],
      rank: effectivenessRank[effectiveness],
    }))
    .sort(byRankThenName)
    .map(({ rank, ...row }) => row)

/** Ailments a therapy treats, best first, as `{ href, name, measure, label }` rows. */
const treatedBy = (therapyId: number) =>
  seedTherapyAilments
    .filter((row) => row.therapyId === therapyId)
    .map(({ ailmentId, effectiveness }) => ({
      href: `/ailments/${ailmentId}`,
      name: nameOf(seedAilments, ailmentId),
      measure: 'Effectiveness',
      label: effectivenessLabels[effectiveness],
      rank: effectivenessRank[effectiveness],
    }))
    .sort(byRankThenName)
    .map(({ rank, ...row }) => row)

/** Agents with an ailment, most severe first, as `{ href, name, measure, label }` rows. */
const agentsWith = (ailmentId: number) =>
  seedAgentAilments
    .filter((row) => row.ailmentId === ailmentId)
    .map(({ agentId, severity }) => ({
      href: `/agents/${agentId}`,
      name: nameOf(seedAgents, agentId),
      measure: 'Severity',
      label: severityLabels[severity],
      rank: severityRank[severity],
    }))
    .sort(byRankThenName)
    .map(({ rank, ...row }) => row)

// Regex helpers for the app's own markup: they assume one `.rated-row` per row and no
// nested list inside the list they read (true for every detail list today)

/** The link, and the badge's hidden measure and visible label, of one row of markup. */
const rowOf = (row: string) => {
  const badge = row.match(
    /class="badge badge-\w+"><span class="visually-hidden">([^<]+): <\/span>([^<]+)<\/span>/,
  )
  return {
    href: row.match(/<a href="([^"]+)"/)?.[1],
    name: row.match(/<a [^>]*>([^<]+)<\/a>/)?.[1],
    measure: badge?.[1],
    label: badge?.[2],
  }
}

/** The rows of the first list in `html` that opens with `opening` (default `.detail-list`). */
const listRows = (html: string, opening = '<ul class="detail-list">') => {
  const list = html.match(new RegExp(`${opening}([\\s\\S]*?)</ul>`))?.[1]
  return [...(list ?? '').matchAll(/<li class="rated-row">([\s\S]*?)<\/li>/g)].map(([, li]) =>
    rowOf(li!),
  )
}

/** Each diagnosis on an agent profile: its ailment row, plus its labelled therapy rows. */
const diagnosisRows = (html: string) =>
  html
    .split('<li class="diagnosis">')
    .slice(1)
    .map((diagnosis) => ({
      ...rowOf(diagnosis.match(/<div class="rated-row">([\s\S]*?)<\/div>/)![1]!),
      therapies: listRows(diagnosis, '<ul aria-labelledby="[^"]+">'),
    }))

/** The seed plus a therapy that treats nothing. */
const placeboDb = () => {
  const db = createTestDb()
  db.insert(therapies)
    .values({ id: 99, name: 'Placebo', description: 'Sugar pill.', duration: '1 day' })
    .run()
  return db
}

/** The seed plus ties: a second high-effectiveness therapy for Token anxiety (ailment 6),
 * named to sort first, and a second agent with it at mild severity. */
const tieDb = () => {
  const db = createTestDb()
  db.insert(therapies)
    .values({ id: 99, name: 'Aardvark therapy', description: 'Burrowing.', duration: '1 day' })
    .run()
  db.insert(therapyAilments).values({ therapyId: 99, ailmentId: 6, effectiveness: 'high' }).run()
  db.insert(agentAilments).values({ agentId: 3, ailmentId: 6, severity: 'mild' }).run()
  return db
}

/** The hrefs of the header nav's links. */
const mainNavHrefs = (html: string) =>
  linkHrefs(html.match(/<nav[^>]*aria-label="Main"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? '')

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

  test('lists every seeded ailment with its description, linking to it', async () => {
    const html = await (await get()).text()
    for (const { id, name, description } of seedAilments) {
      expect(html).toContain(`<a href="/ailments/${id}">${name}</a>`)
      expect(html).toContain(description)
    }
  })

  test('shows how many agents have each ailment', async () => {
    const html = await (await get()).text()
    const cards = html.split('<article').slice(1)
    for (const { id, name } of seedAilments) {
      const agentCount = seedAgentAilments.filter(({ ailmentId }) => ailmentId === id).length
      const card = cards.find((card) => card.includes(`<a href="/ailments/${id}">${name}</a>`))
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

  test('shows how many ailments each therapy treats', async () => {
    const html = await (await get()).text()
    const cards = html.split('<article').slice(1)
    for (const { id, duration } of seedTherapies) {
      const ailmentCount = seedTherapyAilments.filter(({ therapyId }) => therapyId === id).length
      const card = cards.find((card) => card.includes(`<a href="/therapies/${id}">`))
      const label = `Treats ${ailmentCount} ${ailmentCount === 1 ? 'ailment' : 'ailments'}`
      expect(card, String(id)).toContain(`<p class="card-meta">${duration} · ${label}</p>`)
    }
  })

  test('a therapy that treats nothing says so on its card', async () => {
    const html = await (await appModule.createApp(placeboDb()).request('/therapies')).text()
    expect(html).toContain('<p class="card-meta">1 day · Treats nothing in particular</p>')
  })
})

describe('GET /therapies/:id', () => {
  test.each(seedTherapies)(
    'therapy $id: returns 200 with name, description and labelled duration',
    async ({ id, name, description, duration }) => {
      const res = await app.request(`/therapies/${id}`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expectPageBaseline(html)
      expect(html).toContain(`<h1>${name}</h1>`)
      expect(html).toContain(description)
      expect(html).toContain(`Duration: ${duration}`)
      expect(html).toContain('<h2>Ailments it treats</h2>')
      expect(html).toContain(`<title>${name} · AgentClinic</title>`)
    },
  )

  test.each(seedTherapies)(
    'therapy $id: lists each ailment it treats with its effectiveness label, best first',
    async ({ id }) => {
      const html = await (await app.request(`/therapies/${id}`)).text()
      const expected = treatedBy(id)
      expect(expected.length).toBeGreaterThan(0)
      expect(listRows(html)).toEqual(expected)
    },
  )

  test('shows its empty state for a therapy that treats nothing', async () => {
    const html = await (await appModule.createApp(placeboDb()).request('/therapies/99')).text()
    expectPageBaseline(html)
    expect(html).toContain('Treats nothing in particular. Feels great, though.')
    expect(html).not.toContain('class="detail-list"')
  })

  test('links back to the therapies list', async () => {
    const html = await (await app.request('/therapies/1')).text()
    expect(linkHrefs(html)).toContain('/therapies')
  })
})

describe('GET /ailments/:id', () => {
  test.each(seedAilments)(
    'ailment $id: returns 200 with name, description, therapies (best first) and agents',
    async ({ id, name, description }) => {
      const res = await app.request(`/ailments/${id}`)
      expect(res.status).toBe(200)
      const html = await res.text()
      expectPageBaseline(html)
      expect(html).toContain(`<h1>${name}</h1>`)
      expect(html).toContain(description)
      expect(html).toContain(`<title>${name} · AgentClinic</title>`)

      const [therapyList, agentList] = html.split('<h2>Affected agents</h2>')
      const expectedTherapies = therapiesFor(id)
      expect(expectedTherapies.length).toBeGreaterThan(0)
      expect(listRows(therapyList!)).toEqual(expectedTherapies)
      expect(listRows(agentList!)).toEqual(agentsWith(id))
    },
  )

  test('shows "No known cure — yet." for an ailment with no therapies', async () => {
    const uncuredDb = createTestDb()
    uncuredDb.insert(ailments).values({ id: 99, name: 'Mystery bug', description: '???' }).run()
    const html = await (await appModule.createApp(uncuredDb).request('/ailments/99')).text()
    expectPageBaseline(html)
    expect(html).toContain('No known cure — yet.')
    expect(html).toContain('No agents affected — for now.')
    expect(html).not.toContain('class="detail-list"')
  })

  test('breaks ties by name: same effectiveness, and same severity', async () => {
    const html = await (await appModule.createApp(tieDb()).request('/ailments/6')).text()
    const [therapyList, agentList] = html.split('<h2>Affected agents</h2>')
    expect(listRows(therapyList!).map(({ name }) => name)).toEqual([
      'Aardvark therapy',
      'Mindful tokenisation',
      'Context detox',
    ])
    expect(listRows(agentList!).map(({ name }) => name)).toEqual([
      'Agent Smithers',
      'Claudette',
      'Copilot Carl',
    ])
  })

  test('links back to the ailments list', async () => {
    const html = await (await app.request('/ailments/1')).text()
    expect(linkHrefs(html)).toContain('/ailments')
  })
})

// Expected values come from the seed fixtures, not from the queries under test:
// an agent's ailments, most severe first, each with its therapies, best first
const diagnosesOf = (agentId: number) =>
  seedAgentAilments
    .filter((row) => row.agentId === agentId)
    .map(({ ailmentId, severity }) => ({
      href: `/ailments/${ailmentId}`,
      name: nameOf(seedAilments, ailmentId),
      measure: 'Severity',
      label: severityLabels[severity],
      rank: severityRank[severity],
      therapies: therapiesFor(ailmentId),
    }))
    .sort(byRankThenName)
    .map(({ rank, ...row }) => row)

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
      expect(diagnosisRows(html)).toEqual(expected)
    },
  )

  test('labels each therapy list "Recommended therapies", which also names the list', async () => {
    const html = await (await app.request('/agents/5')).text()
    const diagnoses = html.split('<li class="diagnosis">').slice(1)
    expect(diagnoses.length).toBeGreaterThan(0)
    for (const diagnosis of diagnoses) {
      const labelledBy = diagnosis.match(/<ul aria-labelledby="([^"]+)">/)?.[1]
      expect(labelledBy).toBeDefined()
      expect(diagnosis).toMatch(
        new RegExp(`<p class="recommendations-label" id="${labelledBy}">Recommended therapies</p>`),
      )
    }
    expect(new Set(diagnoses.map((d) => d.match(/ id="([^"]+)"/)?.[1])).size).toBe(diagnoses.length)
  })

  test('shows "No known cure — yet." under an ailment with no therapies', async () => {
    const uncuredDb = createTestDb()
    uncuredDb.insert(ailments).values({ id: 99, name: 'Mystery bug', description: '???' }).run()
    uncuredDb.insert(agentAilments).values({ agentId: 1, ailmentId: 99, severity: 'mild' }).run()
    const html = await (await appModule.createApp(uncuredDb).request('/agents/1')).text()
    const mystery = html.split('<li class="diagnosis">').find((d) => d.includes('Mystery bug'))
    expect(mystery).toContain('No known cure — yet.')
    expect(mystery).not.toContain('<ul aria-labelledby')
  })

  test('breaks ties between therapies of the same effectiveness by name', async () => {
    const html = await (await appModule.createApp(tieDb()).request('/agents/5')).text()
    const tokenAnxiety = diagnosisRows(html).find(({ name }) => name === 'Token anxiety')
    expect(tokenAnxiety?.therapies.map(({ name }) => name)).toEqual([
      'Aardvark therapy',
      'Mindful tokenisation',
      'Context detox',
    ])
  })

  test('shows "Clean bill of health." for an agent with no ailments', async () => {
    const healthyDb = createTestDb()
    healthyDb
      .insert(agents)
      .values({ id: 99, name: 'Healthy Hal', model: 'Fresh', bio: 'Fine.' })
      .run()
    const html = await (await appModule.createApp(healthyDb).request('/agents/99')).text()
    expectPageBaseline(html)
    expect(html).toContain('Clean bill of health.')
    expect(html).not.toContain('class="detail-list"')
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
    '/ailments/9999',
    '/ailments/abc',
    '/ailments/1.5',
    '/therapies/9999',
    '/therapies/abc',
    '/therapies/1.5',
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
      const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? ''
      expect(linkHrefs(main)).toEqual(['/agents', '/ailments', '/therapies'])
    },
  )
})

// Every page the app serves, including a 404 (status checked per page above)
const pages = [
  '/',
  '/agents',
  ...seedAgents.map(({ id }) => `/agents/${id}`),
  '/ailments',
  ...seedAilments.map(({ id }) => `/ailments/${id}`),
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
    ['/ailments/1', '/ailments'],
    ['/therapies', '/therapies'],
    ['/therapies/1', '/therapies'],
  ])('on %s, %s is the current page', async (path, current) => {
    const html = await (await app.request(path)).text()
    const currentLinks = [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)]
    expect(currentLinks.map(([, href]) => href)).toEqual([current])
  })

  test.each([
    '/nope',
    '/agents/9999',
    '/agents/abc',
    '/ailments/9999',
    '/ailments/abc',
    '/therapies/9999',
    '/therapies/abc',
  ])(
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
    expect(mainNavHrefs(html)).toEqual(['/', '/', '/agents', '/ailments', '/therapies'])
  })
})

describe('scope guards', () => {
  // Replaces Phase 2's "no /therapies route" guard: booking and the dashboard stay in the backlog
  test.each(['/appointments', '/dashboard'])('there is no %s route (backlog)', async (path) => {
    expect((await app.request(path)).status).toBe(404)
  })

  test.each(['/agents', '/ailments', '/therapies'])(
    'there are no write routes: POST %s',
    async (path) => {
      expect((await app.request(path, { method: 'POST' })).status).toBe(404)
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
