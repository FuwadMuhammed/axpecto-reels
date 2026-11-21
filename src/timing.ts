// Cues: a scene element appears on the frame where a word of its voice line is spoken.
import { createContext, useContext } from 'react'
import type { Reel, Scene, SceneTiming, Timing } from './types'

export const FPS = 30
export const norm = (w: string) => w.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9']/g, '')

export interface SceneCtx {
  scene: Scene
  timing: SceneTiming
  index: number
  durationInFrames: number
  /** frame (relative to the scene) where `word` is first spoken, + offset s. Unknown or missing word → fallback. */
  on: (word: string | undefined, fallback: number, offset?: number) => number
  /** frame at fraction f (0..1) of the spoken line */
  frac: (f: number) => number
  /** frame where the speech ends */
  speechEnd: number
}

export function findWord(t: SceneTiming, word: string): number | undefined {
  const [w, nth] = word.trim().split(/\s+/)[0].split('#')
  const hits = t.words.filter(x => x.w === norm(w) || (norm(w).length > 3 && x.w.startsWith(norm(w))))
  const hit = hits[(Number(nth) || 1) - 1]
  return hit?.start
}

export function makeSceneCtx(scene: Scene, timing: SceneTiming, index: number): SceneCtx {
  const sp0 = timing.audioStart, sp1 = timing.audioStart + timing.speech
  const frac = (f: number) => Math.round((sp0 + (sp1 - sp0) * f) * FPS)
  return {
    scene, timing, index,
    durationInFrames: Math.round(timing.duration * FPS),
    frac,
    speechEnd: Math.round(sp1 * FPS),
    on: (word, fallback, offset = 0) => {
      const s = word ? findWord(timing, word) : undefined
      return s === undefined ? frac(fallback) + Math.round(offset * FPS) : Math.round((s + offset) * FPS)
    },
  }
}

export const SceneContext = createContext<SceneCtx | null>(null)
export const useScene = () => {
  const c = useContext(SceneContext)
  if (!c) throw new Error('useScene outside a scene')
  return c
}
export const ReelContext = createContext<{ reel: Reel, timing: Timing } | null>(null)
export const sceneStart = (timing: Timing, i: number) => Math.round(timing.scenes[i].start * FPS)
