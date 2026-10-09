import { existsSync, globSync, readFileSync } from 'node:fs'
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

  test('exposes the validate script', () => {
    expect(pkg.scripts.validate).toBe('npm run typecheck && npm test')
  })
})
