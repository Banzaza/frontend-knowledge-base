import fs from 'node:fs'
import path from 'node:path'

import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skip = new Set(['node_modules', '.vitepress', 'scripts', '.git'])

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.name.endsWith('.md')) acc.push(full)
  }
  return acc
}

/** Triple-backtick pseudo code fences around HTML confuse VitePress/Vue HTML parser */
function fixContent(text) {
  return text.replace(/```([^`]+)```/g, (match, inner) => {
    if (/<[^>]+>/.test(inner)) return `\`${inner}\``
    return match
  })
}

let updated = 0
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8')
  const after = fixContent(before)
  if (after !== before) {
    fs.writeFileSync(file, after)
    updated++
    console.log('fixed:', path.relative(root, file))
  }
}
console.log(`Done. Updated ${updated} file(s).`)
