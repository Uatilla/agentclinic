import { expect, test } from 'vitest'
import { app } from './app.tsx'

test('GET / returns 200', async () => {
  const res = await app.request('/')
  expect(res.status).toBe(200)
})
