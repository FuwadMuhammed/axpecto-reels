// Writes one reel with ONE headless Claude Code call (your Claude subscription, no API key).
//
//   npm run write                              -> reels/<next slot>.json (scripts/slot.mjs)
//   npm run write -- --id 2026-11-22-1900      a given slot
//   npm run write -- --topic "the meta keywords tag"   a topic you choose
//   npm run check -- reels/<id>.json           run the checks on a file
//
// Claude gets the brief, the category used least recently and every past title, and returns JSON matching
// episode.schema.json. The result is checked; only if it fails is Claude asked once more, with the exact problems.
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import Ajv from 'ajv'
import { BRAND } from '../src/brand'
import type { Reel } from '../src/types'
import { nextSlot } from './slot.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')
const MODEL = process.env.CLAUDE_MODEL ?? 'sonnet'
const TRIES = 2

export interface HistoryEntry { date: string, title: string, category: string, summary: string, status: 'test' | 'rendered' | 'posted' | 'failed' }
export const HISTORY = join(ROOT, 'data/history.json')
export const loadHistory = (): HistoryEntry[] => (existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, 'utf8')) : [])

const SCHEMA = JSON.parse(read('episode.schema.json'))
const validate = new Ajv({ allErrors: true, strict: false }).compile(SCHEMA)
const SCENE_TYPES: string[] = SCHEMA.properties.scenes.items.oneOf.map((o: { properties: { type: { const: string } } }) => o.properties.type.const)
const SLOP = [/\bturns out\b/i, /\bgame[- ]?changer/i, /\bunbelievable\b/i, /\byou won'?t believe\b/i, /\bshocking\b/i, /\bjourney\b/i, /\bdelve/i, /\btestament\b/i, /—/, /\bdid you know\b/i, /\bin this video\b/i, /\bunlock\b/i, /\bsupercharge/i, /\bguarantee/i, /\bnumber one tool\b/i, /\bbest tool\b/i]
const norm = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9']+/g, '')
const count = (s: string) => s.split(/\s+/).filter(Boolean).length

export function checkReel(x: unknown): string[] {
  if (!validate(x)) {
    // oneOf reports every scene type's complaints: keep only those from the type this scene says it is
    const scenes = (x as { scenes?: Array<{ type?: string }> })?.scenes
    const errs = (validate.errors ?? []).filter(e => e.keyword !== 'oneOf').filter((e) => {
      const m = e.instancePath.match(/^\/scenes\/(\d+)/), o = e.schemaPath.match(/oneOf\/(\d+)/)
      if (!m || !o) return true
      return SCENE_TYPES[Number(o[1])] === scenes?.[Number(m[1])]?.type
    })
    return errs.slice(0, 12).map(e => `${e.instancePath || '/'} ${e.message}`)
  }
  const r = x as Reel
  const errors: string[] = []
  const words = r.scenes.reduce((n, s) => n + count(s.voice), 0)
  if (words < 105 || words > 165) errors.push(`the narration is ${words} words; write 120-150`)
  if (r.scenes[0].type !== 'hook') errors.push('the first scene must be a hook')
  const last = r.scenes[r.scenes.length - 1]
  if (last.type !== 'cta') errors.push('the last scene must be the cta')
  if (r.scenes.filter(s => s.type === 'cta').length !== 1) errors.push('exactly one cta scene')
  if (r.scenes.filter(s => s.type === 'hook').length !== 1) errors.push('exactly one hook scene')
  if (!new RegExp(`\\b${BRAND.name}\\b`).test(last.voice)) errors.push(`the cta voice line must say ${BRAND.name}`)
  r.scenes.slice(0, -1).forEach((s, i) => {
    if (new RegExp(`\\b${BRAND.name}\\b`, 'i').test(`${s.voice} ${JSON.stringify(s)}`))
      errors.push(`scene ${i + 1}: ${BRAND.name} may only appear in the cta; this is an explainer, not an ad`)
  })
  const types = r.scenes.map(s => s.type)
  if (new Set(types).size < 5) errors.push(`only ${new Set(types).size} different scene types; use at least 5`)
  types.forEach((t, i) => { if (i && t === types[i - 1]) errors.push(`scenes ${i} and ${i + 1} are both "${t}"; vary the pictures`) })
  r.scenes.forEach((s, i) => {
    const n = count(s.voice), label = `scene ${i + 1} (${s.type})`
    if (n > 34) errors.push(`${label}: ${n} words; 34 at most`)
    if (/\d/.test(s.voice)) errors.push(`${label}: write numbers as words in "voice" (digits are fine on screen)`)
    const said = s.voice.split(/\s+/).map(norm)
    const has = (w: string) => { const k = norm(w.split('#')[0]); return said.some(x => x === k || (k.length > 3 && x.startsWith(k))) }
    for (const w of s.emph ?? []) if (!has(w)) errors.push(`${label}: emph "${w}" is not a word of its voice line`)
    const on = (s as { on?: Record<string, string | string[]> }).on ?? {}
    for (const [k, v] of Object.entries(on))
      for (const w of Array.isArray(v) ? v : [v])
        if (!has(w)) errors.push(`${label}: on.${k} "${w}" is not a word of its voice line`)
    if (s.type === 'hook' && !has(s.reveal)) errors.push(`${label}: reveal "${s.reveal}" must be spoken in the line`)
    if (s.type === 'ranking' && (s.highlight >= s.results.length || s.to >= s.results.length)) errors.push(`${label}: highlight/to must be positions in results`)
    if (s.type === 'cards' && (s.highlight ?? []).some(h => h >= s.cards.length)) errors.push(`${label}: highlight is past the last card`)
    if (s.type === 'browser' && s.hidden && !s.crawler) errors.push(`${label}: hidden text needs crawler: true (the crawler reveals it)`)
    if (s.type === 'cta' && !s.rows.some(x => x.ok) ) errors.push(`${label}: at least one example row must be ok`)
    if (s.type === 'cta' && s.rows.every(x => x.ok)) errors.push(`${label}: at least one example row must name a competitor`)
  })
  if (!r.post.hashtags.some(h => h.toLowerCase() === BRAND.hashtag.toLowerCase())) errors.push(`hashtags must include ${BRAND.hashtag}`)
  if (!r.post.caption.toLowerCase().includes(BRAND.url)) errors.push(`the caption must mention ${BRAND.url}`)
  const all = [...r.scenes.map(s => s.voice), r.post.caption, r.post.youtubeTitle, r.post.xText].join('\n')
  for (const re of SLOP) { const m = all.match(re); if (m) errors.push(`"${m[0]}" sounds like clickbait or AI writing; say it plainly`) }
  if (/\bfree\b/i.test(all)) errors.push('do not mention anything being free')
  return errors
}

// ---- novelty -----------------------------------------------------------------------------------
const STOP = new Set('a an the and or but of to in on at for with who was were that this from by how why what your you it is are'.split(' '))
const bag = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)))
function similar(a: string, b: string) {
  const A = bag(a), B = bag(b)
  if (!A.size || !B.size) return 0
  let n = 0
  for (const w of A) if (B.has(w)) n++
  return n / (A.size + B.size - n)
}
const noveltyErrors = (r: Reel, history: HistoryEntry[]) => history.filter(h => similar(`${r.title} ${r.summary}`, `${h.title} ${h.summary}`) > 0.4)
  .map(h => `too close to a past video, "${h.title}" (${h.date}): pick a different angle`)

// ---- prompt --------------------------------------------------------------------------------------
function fill(text: string) {
  const vars: Record<string, string> = { name: BRAND.name, url: BRAND.url, hashtag: BRAND.hashtag, pitch: BRAND.pitch, audience: BRAND.audience, product: BRAND.product }
  return text.replace(/\{\{(\w+)\}\}/g, (all, k: string) => vars[k] ?? all)
}
function pickCategory(history: HistoryEntry[], date: string) {
  const cats: Array<{ id: string, brief: string }> = JSON.parse(read('brand/topics.json'))
  const last = (id: string) => history.filter(h => h.category === id).map(h => h.date).sort().at(-1) ?? ''
  const seed = Number(date.replaceAll('-', ''))
  return [...cats].sort((a, b) => last(a.id).localeCompare(last(b.id)) || ((cats.indexOf(a) + seed) % cats.length) - ((cats.indexOf(b) + seed) % cats.length))[0]
}
function buildPrompt(date: string, cat: { id: string, brief: string }, history: HistoryEntry[], topic?: string) {
  return [
    `# Today\n\nVideo: ${date}. Category: **${cat.id}**: ${cat.brief}\nSet "category" to exactly "${cat.id}".`,
    ...(topic ? [`Topic for this video: ${topic}`] : []),
    '# Past videos (never repeat these angles)',
    history.length ? history.slice(-300).reverse().map(h => `- ${h.title}`).join('\n') : '(none yet: this is the first one)',
  ].join('\n\n')
}

function askClaude(prompt: string, system: string): { out?: Reel, error?: string, tokens?: string } {
  const r = spawnSync('claude', ['-p', '--model', MODEL, '--tools', '', '--no-session-persistence', '--strict-mcp-config', '--disable-slash-commands',
    '--output-format', 'json', '--json-schema', JSON.stringify(SCHEMA), '--system-prompt', system],
  { input: prompt, encoding: 'utf8', cwd: ROOT, timeout: 300_000, maxBuffer: 20 * 1024 * 1024 })
  if (r.error) return { error: `could not run claude: ${r.error.message}` }
  let out: any
  try { out = JSON.parse(r.stdout) }
  catch { return { error: `claude exited ${r.status}: ${(r.stderr || r.stdout).slice(0, 400)}` } }
  if (out.is_error || !out.structured_output)
    return { error: `claude returned nothing usable (${out.subtype ?? 'error'}): ${String(out.result ?? '').slice(0, 300)}` }
  const u = out.usage ?? {}
  const n = (k: string) => u[k] ?? 0
  return { out: out.structured_output, tokens: `${n('input_tokens') + n('cache_creation_input_tokens') + n('cache_read_input_tokens') + n('output_tokens')} tokens, ${Math.round((out.duration_ms ?? 0) / 1000)}s` }
}

export async function write(date: string, topic?: string): Promise<{ ok: true, file: string, story: Reel } | { ok: false, errors: string[] }> {
  const history = loadHistory().filter(h => h.date < date)
  const cat = pickCategory(history, date)
  const base = buildPrompt(date, cat, history, topic)
  const system = fill(read('prompts/writer.md'))
  console.log(`Writing ${date}: category "${cat.id}" (${MODEL})`)
  let prompt = base
  let errors: string[] = []
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    const res = askClaude(prompt, system)
    if (!res.out) {
      errors = [res.error!]
      console.log(`  attempt ${attempt}: ${res.error}`)
      if (/authenticat|401|invalid api key|oauth|not logged in/i.test(res.error!)) break
      continue
    }
    const reel = res.out
    reel.category = cat.id
    errors = [...checkReel(reel), ...noveltyErrors(reel, history)]
    console.log(`  attempt ${attempt}: "${reel.title}" (${res.tokens})${errors.length ? `, rejected:\n    ${errors.join('\n    ')}` : ''}`)
    if (!errors.length) {
      mkdirSync(join(ROOT, 'reels'), { recursive: true })
      const file = join(ROOT, 'reels', `${date}.json`)
      writeFileSync(file, `${JSON.stringify(reel, null, 2)}\n`)
      return { ok: true, file, story: reel }
    }
    prompt = `${base}\n\n# Your previous attempt was rejected\n\n${errors.map(e => `- ${e}`).join('\n')}\n\nPrevious attempt:\n${JSON.stringify(reel)}\n\nFix every problem and return the complete reel.`
  }
  return { ok: false, errors }
}

export function record(date: string, r: Reel, status: HistoryEntry['status']) {
  const history = loadHistory().filter(h => h.date !== date)
  history.push({ date, title: r.title, category: r.category, summary: r.summary, status })
  history.sort((a, b) => a.date.localeCompare(b.date))
  mkdirSync(join(ROOT, 'data'), { recursive: true })
  writeFileSync(HISTORY, `${JSON.stringify(history, null, 2)}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--check')) {
    const errors = checkReel(JSON.parse(readFileSync(process.argv.at(-1)!, 'utf8')))
    console.log(errors.length ? `✗ ${errors.join('\n  ')}` : '✓ reel passes the checks')
    process.exit(errors.length ? 1 : 0)
  }
  const i = Math.max(process.argv.indexOf('--id'), process.argv.indexOf('--date'))
  const date = i > 0 ? process.argv[i + 1] : nextSlot({ any: true })
  const t = process.argv.indexOf('--topic')
  const r = await write(date, t > 0 ? process.argv[t + 1] : undefined)
  if (!r.ok) { console.error(`✗ no usable reel:\n  ${r.errors.join('\n  ')}`); process.exit(1) }
  console.log(`✓ ${r.file}`)
}
