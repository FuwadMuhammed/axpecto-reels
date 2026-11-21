// Genuine logo files (public/logos, unmodified, from Wikimedia Commons) for brands the videos mention.
// When a caption word or a chip names one of these, its logo is shown next to it. Add a brand by dropping its
// official SVG in public/logos and one line here; a brand with no genuine file is shown as text only.
export const LOGOS = {
  google: { file: 'google-g.svg', aspect: 1 },
  openai: { file: 'openai.svg', aspect: 1 },
  perplexity: { file: 'perplexity-symbol.svg', aspect: 29.1 / 37 },
  gemini: { file: 'gemini.svg', aspect: 1 },
  claude: { file: 'claude.svg', aspect: 1 },
  youtube: { file: 'youtube.svg', aspect: 28.57 / 20 },
  nike: { file: 'nike.svg', aspect: 1000 / 356.39 },
  adidas: { file: 'adidas.svg', aspect: 725 / 500 },
} as const
export type LogoName = keyof typeof LOGOS

// lower-case words (as spoken / written) → logo
const ALIASES: Record<string, LogoName> = {
  google: 'google', "google's": 'google', overviews: 'google', 'ai overviews': 'google',
  chatgpt: 'openai', "chatgpt's": 'openai', openai: 'openai', gpt: 'openai', gptbot: 'openai',
  perplexity: 'perplexity', "perplexity's": 'perplexity', perplexitybot: 'perplexity',
  gemini: 'gemini', "gemini's": 'gemini',
  claude: 'claude', "claude's": 'claude',
  youtube: 'youtube', "youtube's": 'youtube',
  nike: 'nike', "nike's": 'nike',
  adidas: 'adidas', "adidas'": 'adidas',
}

/** Search and AI platforms; every other logo is a consumer brand that can appear inside an answer card. */
const PLATFORMS: ReadonlySet<LogoName> = new Set<LogoName>(['google', 'openai', 'perplexity', 'gemini', 'claude', 'youtube'])
export const isConsumerBrand = (l: LogoName | undefined): l is LogoName => !!l && !PLATFORMS.has(l)

export function logoFor(text: string): LogoName | undefined {
  const k = text.toLowerCase().replace(/[^a-z0-9' ]/g, '').trim()
  return ALIASES[k]
}
