import { expect, test } from 'vitest'
import { app } from './app.tsx'

test('GET / returns 200', async () => {
  const res = await app.request('/')
  expect(res.status).toBe(200)
})

test('GET /public/styles.css is served', async () => {
  const res = await app.request('/public/styles.css')
  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toMatch(/^text\/css/)
})
