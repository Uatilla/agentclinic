import { existsSync, globSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const root = resolve(import.meta.dirname, '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const tsconfig = JSON.parse(readFileSync(resolve(root, 'tsconfig.json'), 'utf8'))

describe('project structure', () => {
  test('has no build step or dist/ output', () => {
    expect(pkg.scripts.build).toBeUndefined()
    expect(pkg.main).toBeUndefined()
    expect(tsconfig.compilerOptions.noEmit).toBe(true)
    expect(existsSync(resolve(root, 'dist'))).toBe(false)
  })

  test('keeps tests colocated in src/', () => {
    const tests = globSync('**/*.test.{ts,tsx}', {
      cwd: root,
      exclude: (path) => path.includes('node_modules'),
    })
    expect(tests.length).toBeGreaterThan(0)
    expect(tests.filter((path) => !path.startsWith('src/'))).toEqual([])
  })

  test('pins Node 24 locally and in engines', () => {
    expect(readFileSync(resolve(root, '.nvmrc'), 'utf8').trim()).toBe('24')
    expect(pkg.engines.node).toBe('>=24')
  })

  test('installs PicoCSS v2 from npm', () => {
    expect(pkg.dependencies['@picocss/pico']).toMatch(/^\^?2\./)
  })

  test('sets up Drizzle with better-sqlite3 and db scripts', () => {
    expect(pkg.dependencies).toHaveProperty('drizzle-orm')
    expect(pkg.dependencies).toHaveProperty('better-sqlite3')
    expect(pkg.devDependencies).toHaveProperty('drizzle-kit')
    expect(Object.keys(pkg.scripts)).toEqual(
      expect.arrayContaining(['db:generate', 'db:migrate', 'db:seed']),
    )
    expect(existsSync(resolve(root, 'drizzle.config.ts'))).toBe(true)
  })

  test('loads better-sqlite3 from its prebuilt binary, with no install script', () => {
    expect(pkg.allowScripts['better-sqlite3']).toBe(false)
    const Database = createRequire(import.meta.url)('better-sqlite3')
    expect(new Database(':memory:').prepare('select 1 as one').get()).toEqual({ one: 1 })
  })

  test('git-ignores the local database', () => {
    const ignored = readFileSync(resolve(root, '.gitignore'), 'utf8').split('\n')
    expect(ignored).toContain('/data')
  })

  test('exposes the validate script', () => {
    expect(pkg.scripts.validate).toBe('npm run typecheck && npm test')
  })
})
