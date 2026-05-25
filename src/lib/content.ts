import { getDb } from './db'

export function getContent(key: string, fallback = ''): string {
  const row = getDb().prepare('SELECT value FROM site_content WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value ?? fallback
}

export function setContent(key: string, value: string): void {
  getDb().prepare('INSERT OR REPLACE INTO site_content (key, value) VALUES (?, ?)').run(key, value)
}

export function getAllContent(): Record<string, string> {
  const rows = getDb().prepare('SELECT key, value FROM site_content').all() as { key: string; value: string }[]
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}
