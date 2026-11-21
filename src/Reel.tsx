// One video: scenes in sequence, word-by-word captions (with brand logos), voice and light sound design.
import React, { useMemo } from 'react'
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from 'remotion'
import { BRAND } from './brand'
import { CAPTION_Y, look } from './look'
import { LOGOS, logoFor } from './logos'
import { progress } from './motion'
import { Defs } from './premium'
import { SCENES } from './scenes'
import { FPS, SceneContext, findWord, makeSceneCtx, norm, sceneStart } from './timing'
import type { Reel as ReelData, Timing } from './types'

type W = { text: string, start: number, emph: boolean }

/** The current phrase (≤ 4 words, broken at punctuation). Spoken words turn ink, emphasis words light up on a blue
 *  pill, and a word naming a known brand (Google, ChatGPT, Perplexity, Gemini…) gets its real logo beside it. */
const Captions: React.FC<{ reel: ReelData, timing: Timing }> = ({ reel, timing }) => {
  const frame = useCurrentFrame(), t = frame / FPS
  const phrases = useMemo(() => {
    const out: Array<{ start: number, end: number, words: W[] }> = []
    reel.scenes.forEach((s, i) => {
      const st = timing.scenes[i]
      const emph = new Set((s.emph ?? []).map(norm))
      const tokens = s.voice.split(/\s+/).filter(w => norm(w))
      let cur: W[] = []
      tokens.forEach((text, k) => {
        const tw = st.words[k] ?? st.words[st.words.length - 1]
        cur.push({ text, start: st.start + tw.start, emph: emph.has(norm(text)) })
        if (cur.length >= 4 || /[.,?!:]$/.test(text) || k === tokens.length - 1) {
          out.push({ start: cur[0].start, end: st.start + tw.end, words: cur }); cur = []
        }
      })
    })
    out.forEach((p, i) => { p.end = Math.min(out[i + 1]?.start ?? p.end + 0.6, p.end + 0.6) })
    return out
  }, [reel, timing])
  const p = phrases.find(x => t >= x.start - 0.05 && t < x.end)
  if (!p) return null
  const o = progress(frame, Math.round((p.start - 0.05) * FPS), 5)
  const runs: Array<{ emph: boolean, words: W[] }> = []
  for (const w of p.words) {
    const last = runs[runs.length - 1]
    if (last && last.emph && w.emph) last.words.push(w); else runs.push({ emph: w.emph, words: [w] })
  }
  const word = (w: W, onPill: boolean) => {
    const logo = logoFor(w.text)
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: onPill ? '#FFFFFF' : t >= w.start ? look.ink : look.soft }}>
        {logo && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 66, height: 66, borderRadius: 20, background: '#fff',
          boxShadow: '0 6px 16px rgba(30,42,102,0.16)', opacity: t >= w.start - 0.1 ? 1 : 0.45 }}>
          <Img src={staticFile(`logos/${LOGOS[logo].file}`)} style={{ height: 42, width: 42 * LOGOS[logo].aspect }} />
        </span>}
        {w.text}
      </span>
    )
  }
  return (
    <div style={{ position: 'absolute', top: CAPTION_Y, left: 80, width: 880, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
      gap: '8px 18px', opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: look.font, fontWeight: 800, fontSize: 66, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
      {runs.map((r, i) => {
        if (!r.emph) return <React.Fragment key={i}>{r.words.map((w, j) => <span key={j}>{word(w, false)}</span>)}</React.Fragment>
        const on = progress(frame, Math.round(r.words[0].start * FPS) - 2, 6)
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-flex', gap: 16, padding: '2px 26px 8px', borderRadius: 999 }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'linear-gradient(#3D68FF, #2449F0)',
              boxShadow: '0 14px 30px rgba(47,91,255,0.28)', opacity: on, transform: `scale(${0.85 + 0.15 * on})` }} />
            {r.words.map((w, j) => <span key={j} style={{ position: 'relative' }}>{word(w, on > 0.5)}</span>)}
          </span>
        )
      })}
    </div>
  )
}

const SceneFrame: React.FC<{ dur: number, first: boolean, last: boolean, children: React.ReactNode }> = ({ dur, first, last, children }) => {
  const frame = useCurrentFrame()
  const i = first ? 1 : progress(frame, 0, 12), o = last ? 1 : 1 - progress(frame, dur - 10, 10)
  const push = 1 + 0.025 * progress(frame, 0, dur)
  return <AbsoluteFill style={{ opacity: i * o, filter: `blur(${(1 - i) * 10 + (1 - o) * 10}px)`,
    transform: `translateY(${(1 - i) * 24 - (1 - o) * 24}px) scale(${push})`, transformOrigin: '50% 45%' }}>{children}</AbsoluteFill>
}

type Sfx = { at: number, file: 'click' | 'tick' | 'swoosh' | 'success', volume: number }
function sounds(reel: ReelData, timing: Timing): Sfx[] {
  const out: Sfx[] = []
  reel.scenes.forEach((s, i) => {
    const g = sceneStart(timing, i), st = timing.scenes[i]
    if (i > 0) out.push({ at: g - 5, file: 'swoosh', volume: 0.12 })
    for (const w of s.emph ?? []) {
      const at = findWord(st, w)
      if (at !== undefined) out.push({ at: g + Math.round(at * FPS), file: 'click', volume: 0.26 })
    }
    if (s.type === 'cta') {
      const at = findWord(st, s.on?.brand ?? BRAND.name)
      if (at !== undefined) out.push({ at: g + Math.round(at * FPS), file: 'success', volume: 0.35 })
    }
  })
  return out
}

export const Reel: React.FC<{ reel: ReelData, timing: Timing | null }> = ({ reel, timing }) => {
  const sfx = useMemo(() => (timing ? sounds(reel, timing) : []), [reel, timing])
  if (!timing) throw new Error(`no timing for this reel: run tools/voice.py first`)
  return (
    <AbsoluteFill style={{ background: look.bg }}>
      <Defs />
      <AbsoluteFill style={{ background: 'radial-gradient(1200px 900px at 85% 8%, rgba(210,217,255,0.55), transparent 60%), radial-gradient(900px 800px at 0% 95%, rgba(255,226,204,0.45), transparent 60%)' }} />
      {reel.scenes.map((scene, i) => {
        const ctx = makeSceneCtx(scene, timing.scenes[i], i), Comp = SCENES[scene.type]
        const last = i === reel.scenes.length - 1
        return (
          <Sequence key={i} from={sceneStart(timing, i)} durationInFrames={last ? Infinity : ctx.durationInFrames} name={`${i + 1} ${scene.type}`}>
            <SceneContext.Provider value={ctx}>
              <SceneFrame dur={ctx.durationInFrames} first={i === 0} last={last}><Comp /></SceneFrame>
            </SceneContext.Provider>
          </Sequence>
        )
      })}
      <Captions reel={reel} timing={timing} />
      {timing.scenes.map((t, i) => (
        <Sequence key={`vo${i}`} from={Math.round((t.start + t.audioStart) * FPS)} name={`voice ${i + 1}`}>
          <Audio src={staticFile(t.audio)} />
        </Sequence>
      ))}
      {sfx.map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.max(0, s.at)} durationInFrames={20} name={`sfx ${s.file}`}>
          <Audio src={staticFile(`audio/sfx/${s.file}.wav`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
