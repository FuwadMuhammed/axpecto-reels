// Renders a reel to an MP4: voice (Kokoro) → word timing (Whisper) → frames (Remotion) → loudness → contact sheet.
//   npm run make -- reels/2026-11-22-1900.json   -> out/2026-11-22-1900.mp4 + -sheet.jpg
import { pathToFileURL } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const python = () => [process.env.PYTHON, join(ROOT, '.venv/bin/python')].find(p => p && existsSync(p)) ?? 'python3'
const seconds = (f: string) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim())

function run(cmd: string, args: string[]) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 })
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`
  if (r.status !== 0) throw new Error(`${cmd} ${args[0]} failed:\n${out.slice(-1800)}`)
  return out
}

export async function make(file: string): Promise<{ ok: true, mp4: string, duration: number, engine: string } | { ok: false, errors: string[] }> {
  const id = basename(file, '.json')
  const reel = JSON.parse(readFileSync(file, 'utf8'))
  try {
    mkdirSync(join(ROOT, 'out'), { recursive: true })
    console.log('  voice')
    run(python(), ['tools/voice.py', file])
    console.log('  render')
    const props = join(ROOT, 'out', `${id}.props.json`)
    writeFileSync(props, JSON.stringify({ id, reel, timing: null }))
    const raw = join(ROOT, 'out', `${id}.raw.mp4`)
    run('npx', ['remotion', 'render', 'src/index.ts', 'Reel', raw, `--props=${props}`, `--concurrency=${process.env.RENDER_CONCURRENCY ?? '50%'}`])
    console.log('  loudness')
    run('bash', ['tools/master.sh', raw])
    const mp4 = join(ROOT, 'out', `${id}.mp4`)
    renameSync(join(ROOT, 'out', `${id}.raw.final.mp4`), mp4)
    const duration = seconds(mp4)
    run('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `fps=${(18 / duration).toFixed(4)},scale=270:-1,tile=6x3`, '-frames:v', '1', join(ROOT, 'out', `${id}-sheet.jpg`)])
    const audio = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', mp4]).toString().trim()
    const errors: string[] = []
    if (duration < 30 || duration > 80) errors.push(`video is ${duration.toFixed(1)}s; expected 30-80s`)
    if (!audio) errors.push('video has no audio track')
    if (reel.scenes.at(-1)?.type !== 'cta') errors.push('the last scene must be the cta')
    return errors.length ? { ok: false, errors } : { ok: true, mp4, duration, engine: 'kokoro' }
  }
  catch (e) {
    return { ok: false, errors: [(e as Error).message] }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv.slice(2).find(a => !a.startsWith('--'))
  if (!file) { console.error('Usage: npm run make -- reels/<id>.json'); process.exit(1) }
  const r = await make(file)
  if (!r.ok) { console.error(`✗ ${r.errors.join('\n  ')}`); process.exit(1) }
  console.log(`✓ ${r.mp4} (${r.duration.toFixed(1)}s)`)
}
