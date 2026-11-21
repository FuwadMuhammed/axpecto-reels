// One video ("reel") as Claude writes it. Mirrors episode.schema.json, which is what actually checks it.
// Every scene has a voice line; `on` fields name a word of that line, and the element appears when it is spoken
// (left out, elements are spread evenly across the line). `emph` words light up on the blue caption pill.

export type Mood = 'smile' | 'happy' | 'surprised' | 'puzzled' | 'think' | 'wink'
export type Icon = 'memory' | 'page' | 'robot' | 'search' | 'chat' | 'link' | 'star' | 'warning' | 'check' | 'code' | 'quote' | 'map' | 'clock' | 'speed'
export type Assistant = 'ChatGPT' | 'Perplexity' | 'Gemini' | 'AI Overviews' | 'Claude' | 'Google' | 'YouTube'

interface Base { voice: string, kicker: string, emph?: string[], mood?: Mood }

export type Scene = Base & (
  | { type: 'hook', stamp?: string, headline: string, reveal: string }
  | { type: 'browser', url: string, title?: string, hidden?: string, badge?: string, visitor?: boolean, crawler?: boolean,
      reaction?: '?' | '!', on?: { page?: string, hidden?: string, visitor?: string, crawler?: string, badge?: string } }
  | { type: 'ranking', query: string, results: string[], highlight: number, to: number,
      tags?: Array<{ title: string, sub: string }>, on?: { list?: string, move?: string, tags?: string[] } }
  | { type: 'chat', question: string, assistants: Assistant[], answerTitle: string, answerSub: string, links?: boolean,
      on?: { links?: string, ask?: string, answer?: string } }
  | { type: 'cards', cards: Array<{ big: string, label: string, line: string }>, highlight?: number[], on?: { cards?: string[], highlight?: string } }
  | { type: 'versus', headline: { left: string, sign: '≠' | 'vs' | '→', right: string }, answer?: string,
      left: { title: string, sub: string, icon: Icon }, right: { title: string, sub: string, icon: Icon },
      on?: { headline?: string, answer?: string, left?: string, right?: string } }
  | { type: 'checklist', items: Array<{ title: string, detail: string, icon: Icon }>, on?: { items?: string[] } }
  | { type: 'timeline', events: Array<{ year: string, label: string }>, on?: { events?: string[] } }
  | { type: 'cta', question: string, rows: Array<{ assistant: Assistant, ok: boolean }>, on?: { brand?: string, rows?: string } }
)

export interface Reel {
  title: string
  category: string
  summary: string
  sources: string[]
  scenes: Scene[]
  post: { caption: string, hashtags: string[], youtubeTitle: string, xText: string }
}

/** public/runs/<id>/timing.json, written by tools/voice.py */
export interface Word { w: string, start: number, end: number }
export interface SceneTiming { type: string, start: number, duration: number, audio: string, audioStart: number, speech: number, words: Word[] }
export interface Timing { id: string, duration: number, scenes: SceneTiming[] }
