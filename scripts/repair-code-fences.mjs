import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skip = new Set(['node_modules', '.vitepress', 'scripts', '.git'])
const LANG = /^(typescript|ts|javascript|js|html|css|tsx|jsx|json|bash|sh|vue|md)$/

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

function repair(text) {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.replace(/\r$/, '')
      const open = trimmed.match(/^`([a-z#]+)$/)
      if (open && LANG.test(open[1])) return '```' + open[1]
      if (trimmed === '``') return '```'
      return line
    })
    .join('\n')
}

let updated = 0
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8')
  const after = repair(before)
  if (after !== before) {
    fs.writeFileSync(file, after)
    updated++
    console.log('repaired:', path.relative(root, file))
  }
}
console.log(`Done. Repaired ${updated} file(s).`)
