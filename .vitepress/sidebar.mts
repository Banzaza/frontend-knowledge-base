import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKIP_FILES = new Set([
  'README.md',
  'api-examples.md',
  'markdown-examples.md',
])
const SKIP_DIRS = new Set(['.vitepress', 'node_modules', 'scripts', '.git'])

function mdLink(absPath: string): string {
  const rel = path.relative(ROOT, absPath).replace(/\\/g, '/')
  return `/${rel.replace(/\.md$/, '')}`
}

/** 侧栏展示名：优先使用 frontmatter title（如 Node-js.md → Node.js） */
function pageTitle(filePath: string): string {
  const fallback = path.basename(filePath, '.md')
  try {
    const head = fs.readFileSync(filePath, 'utf8').slice(0, 512)
    const fm = head.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!fm) return fallback
    const titleLine = fm[1].match(/^title:\s*(.+)\s*$/m)
    if (!titleLine) return fallback
    return titleLine[1].replace(/^['"]|['"]$/g, '').trim()
  } catch {
    return fallback
  }
}

function scan(dir: string): DefaultTheme.SidebarItem[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const items: DefaultTheme.SidebarItem[] = []

  const sorted = entries
    .filter((e) => !e.name.startsWith('.') && !SKIP_DIRS.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
      return a.name.localeCompare(b.name, 'zh')
    })

  for (const entry of sorted) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const children = scan(full)
      if (children.length) {
        items.push({ text: entry.name, collapsed: true, items: children })
      }
      continue
    }
    if (!entry.name.endsWith('.md') || entry.name === 'index.md') continue
    if (dir === ROOT && SKIP_FILES.has(entry.name)) continue
    items.push({ text: pageTitle(full), link: mdLink(full) })
  }
  return items
}

export const generatedSidebar: DefaultTheme.SidebarItem[] = scan(ROOT)
