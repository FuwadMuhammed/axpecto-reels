// The scene library. Claude picks a type per scene and fills its fields (see episode.schema.json); nothing here
// is specific to one video. Layout is absolute on the 1080 × 1920 board, clear of the Reels UI (top ~220 px,
// bottom ~420 px, right ~140 px). Element timing comes from `on` words, else spreads across the voice line.
import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { BRAND } from './brand'
import { Avatar, Crawler, Thought } from './characters'
import { logoFor } from './logos'
import { look } from './look'
import { progress, useSpring } from './motion'
import { Bar, Card, Chip, Connector, Logo, Spark, Sparkle, Txt } from './premium'
import { FPS, useScene } from './timing'
import type { Icon, Mood, Scene } from './types'

type Of<T extends Scene['type']> = Extract<Scene, { type: T }>
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const S = (sec: number) => Math.round(sec * FPS)

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>{children}</svg>
)
const usePop = (at: number) => useSpring(at, 14, 180)
const Pop: React.FC<{ at: number, cx: number, cy: number, from?: number, dy?: number, children: React.ReactNode }> = ({ at, cx, cy, from = 0.86, dy = 30, children }) => {
  const p = usePop(at)
  return <g opacity={Math.min(1, p * 1.6)} transform={`translate(0 ${(1 - Math.min(p, 1)) * dy}) translate(${cx} ${cy}) scale(${from + (1 - from) * p}) translate(${-cx} ${-cy})`}>{children}</g>
}
const wrap = (s: string, n: number) => {
  const out: string[] = []; let cur = ''
  for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w } else cur += ' ' + w }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export const Kicker: React.FC<{ text: string, at?: number }> = ({ text, at = 0 }) => {
  const frame = useCurrentFrame(); const p = progress(frame, at, 12)
  const t = text.toUpperCase(), w = t.length * 21 + 96
  return (
    <g transform={`translate(540 ${268 + (1 - p) * 12})`} opacity={p}>
      <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill="url(#inkCard)" />
      <Txt x={0} y={11} size={30} weight={800} color="#fff" textAnchor="middle" style={{ letterSpacing: '0.16em' }}>{t}</Txt>
    </g>
  )
}

const Browser: React.FC<{ x: number, y: number, w: number, h: number, url?: string, back?: boolean, children?: React.ReactNode }> = ({ x, y, w, h, url, back = true, children }) => (
  <Card x={x} y={y} w={w} h={h} r={38} back={back}>
    {[0, 1, 2].map(i => <circle key={i} cx={40 + i * 28} cy={38} r={8} fill={['#FF6159', '#FFBD2E', '#28C941'][i]} opacity={0.9} />)}
    {url && <>
      <rect x={140} y={18} width={w - 180} height={40} rx={20} fill={look.bg} />
      <Txt x={164} y={46} size={22} weight={600} color={look.muted}>{url}</Txt>
    </>}
    {children}
  </Card>
)

/** Small line icons, drawn in blue, centred on (0, 0), ~90 px. */
export const Glyph: React.FC<{ icon: Icon, s?: number }> = ({ icon, s = 1 }) => {
  const B = look.blue, W = 7
  const st = { fill: 'none', stroke: B, strokeWidth: W, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const body = (() => {
    switch (icon) {
      case 'memory': return <><path d="M -40 22 C -62 22 -64 -6 -44 -10 C -44 -34 -12 -40 -2 -22 C 8 -44 44 -40 44 -14 C 66 -14 68 22 44 22 Z" fill="#fff" stroke={B} strokeWidth={6} />{[[-20, 2], [0, -10], [18, 4]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={B} />)}</>
      case 'page': return <><rect x={-30} y={-40} width={60} height={80} rx={10} fill="#fff" stroke={B} strokeWidth={6} /><path d="M -16 -18 H 16 M -16 0 H 16 M -16 18 H 6" {...st} strokeWidth={6} /></>
      case 'robot': return <g transform="translate(0 34) scale(0.36)"><Crawler x={0} y={0} lens={null} /></g>
      case 'search': return <><circle cx={-8} cy={-8} r={24} {...st} /><path d="M 10 10 L 30 30" {...st} strokeWidth={10} /></>
      case 'chat': return <path d="M -38 -28 H 38 Q 46 -28 46 -20 V 12 Q 46 20 38 20 H -6 L -24 36 V 20 H -38 Q -46 20 -46 12 V -20 Q -46 -28 -38 -28 Z" fill="#fff" stroke={B} strokeWidth={6} />
      case 'link': return <><path d="M -6 10 L 10 -6" {...st} /><path d="M -2 -18 L 8 -28 A 16 16 0 0 1 30 -6 L 20 4" {...st} /><path d="M 2 18 L -8 28 A 16 16 0 0 1 -30 6 L -20 -4" {...st} /></>
      case 'star': return <path d="M 0 -36 L 10 -12 L 36 -10 L 16 8 L 22 34 L 0 20 L -22 34 L -16 8 L -36 -10 L -10 -12 Z" fill={B} />
      case 'warning': return <><path d="M 0 -36 L 38 30 H -38 Z" fill="#fff" stroke={look.red} strokeWidth={6} strokeLinejoin="round" /><path d="M 0 -10 V 8" stroke={look.red} strokeWidth={7} strokeLinecap="round" /><circle cx={0} cy={20} r={4} fill={look.red} /></>
      case 'check': return <path d="M -24 0 L -6 18 L 26 -16" {...st} strokeWidth={10} />
      case 'code': return <Txt x={0} y={22} size={64} weight={800} color={B} textAnchor="middle">{'{ }'}</Txt>
      case 'quote': return <Txt x={0} y={56} size={140} weight={800} color={B} textAnchor="middle">“</Txt>
      case 'map': return <g transform="translate(0 -4)"><path d="M 0 40 C -28 6 -32 -6 -32 -16 A 32 32 0 1 1 32 -16 C 32 -6 28 6 0 40 Z" fill={B} /><circle cx={0} cy={-16} r={11} fill="#fff" /></g>
      case 'clock': return <><circle r={34} {...st} /><path d="M 0 -18 V 0 L 14 10" {...st} /></>
      case 'speed': return <><path d="M -34 14 A 36 36 0 1 1 34 14" {...st} /><path d="M 0 8 L 18 -16" {...st} strokeWidth={8} /></>
    }
  })()
  return <g transform={`scale(${s})`}>{body}</g>
}

// ── hook: a stamp, a headline, and one word revealed under a magnifying glass ─────────────────────────────────
export const Hook: React.FC = () => {
  const { scene, on, frac } = useScene(); const s = scene as Of<'hook'>
  const frame = useCurrentFrame()
  const reveal = on(s.reveal, 0.8)
  const words = s.headline.split(/\s+/)
  const h0 = s.stamp ? Math.max(S(1.2), frac(0.3)) : 3
  const headAt = (i: number) => Math.round(h0 + (Math.max(h0 + 6, reveal - S(0.35)) - h0) * (i / Math.max(1, words.length)))
  const stamp = s.stamp ? progress(frame, 2, 8) * (1 - progress(frame, h0 - 5, 6)) : 0
  const half = Math.min(400, s.reveal.length * (s.reveal.length > 9 ? 40 : 50))
  const lx = interpolate(frame, [reveal + 2, reveal + 20], [540 - half, 540 + half], clamp)
  const filled = progress(frame, reveal + 18, 8)
  const lensOut = 1 - progress(frame, reveal + 22, 8)
  const ly = 890 + Math.sin(frame / 7) * 8
  const lensIn = progress(frame, reveal, 10)
  const size = s.reveal.length > 9 ? 140 : 176
  return (
    <>
      {s.stamp && <div style={{ position: 'absolute', top: 640, width: 1080, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 170, lineHeight: 0.98,
        letterSpacing: '-0.05em', color: look.blue, opacity: stamp, transform: `scale(${1.2 - 0.2 * progress(frame, 2, 12)})` }}>{s.stamp}</div>}
      <div style={{ position: 'absolute', top: 430, left: 96, width: 888, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 108,
        lineHeight: 1.05, letterSpacing: '-0.045em', color: look.ink }}>
        {words.map((w, i) => {
          const p = progress(frame, headAt(i), 9)
          return <span key={i} style={{ display: 'inline-block', marginRight: 26, opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>{w}</span>
        })}
      </div>
      <Stage>
        <Kicker text={s.kicker} at={h0} />
        <defs><clipPath id="lens"><circle cx={lx} cy={ly} r={118 * lensIn} /></clipPath></defs>
        <Txt x={540} y={940} size={size} weight={800} textAnchor="middle" color="transparent" opacity={progress(frame, reveal, 12) * 0.9}
          style={{ stroke: look.soft, strokeWidth: 3, strokeDasharray: '12 9', letterSpacing: '-0.045em' }}>{s.reveal}</Txt>
        <g clipPath="url(#lens)" opacity={lensOut}>
          <circle cx={lx} cy={ly} r={118} fill={look.lav} />
          <Txt x={540} y={940} size={size} weight={800} textAnchor="middle" color={look.blue} style={{ letterSpacing: '-0.045em' }}>{s.reveal}</Txt>
        </g>
        <Txt x={540} y={940} size={size} weight={800} textAnchor="middle" color={look.blue} opacity={filled} style={{ letterSpacing: '-0.045em' }}>{s.reveal}</Txt>
        <g opacity={lensIn * lensOut} filter="url(#softSm)">
          <circle cx={lx} cy={ly} r={118} fill="url(#glass)" stroke={look.ink} strokeWidth={12} />
          <path d={`M ${lx + 84} ${ly + 84} L ${lx + 158} ${ly + 158}`} stroke={look.ink} strokeWidth={28} strokeLinecap="round" />
        </g>
        <Spark x={868} y={800} at={reveal + 22} rot={30} color={look.blue} />
        <Crawler x={820} y={1270} s={0.82} lens={null} />
      </Stage>
    </>
  )
}

// ── browser: a web page; optional hidden text the crawler reads, a visitor who reacts, a badge ─────────────────
export const BrowserScene: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'browser'>
  const frame = useCurrentFrame()
  const pageAt = Math.min(on(s.on?.page, 0), 4)
  const visitorAt = on(s.on?.visitor, 0.3)
  const crawlerAt = on(s.on?.crawler, 0.55, -0.3)
  const read = crawlerAt + S(0.6)
  const badgeAt = on(s.on?.badge, 0.88)
  const hiddenAt = on(s.on?.hidden, 0.2)
  const reactPop = usePop(visitorAt + S(0.7))
  const rank = usePop(badgeAt)
  const card = { x: 130, y: 380, w: 820, h: 520 }
  const kw = s.hidden ? wrap(s.hidden, 30).slice(0, 4) : []
  const sweep = interpolate(frame, [read, read + 22, read + 44, read + 66], [0, 1, 2, 3], clamp)
  const lx = card.x + 250 + (sweep % 2 < 1 ? sweep % 1 : 1 - (sweep % 1)) * 330
  const ly = card.y + 300 + Math.min(sweep, 2.6) * 54
  const lensOn = s.hidden && s.crawler ? progress(frame, read - 4, 8) : 0
  const crawlIn = progress(frame, crawlerAt, 22)
  const botX = s.visitor ? interpolate(crawlIn, [0, 1], [1220, 830]) : interpolate(crawlIn, [0, 1], [1220, 700])
  const hiddenFlash = s.hidden ? progress(frame, hiddenAt, 10) * (1 - progress(frame, read - 10, 12)) : 0
  const reacted = frame >= visitorAt + S(0.7)
  const mood: Mood = reacted ? (s.mood ?? (s.reaction === '!' ? 'surprised' : 'puzzled')) : 'smile'
  return (
    <Stage>
      <Kicker text={s.kicker} />
      <Pop at={pageAt} cx={540} cy={640}>
        <Browser {...card} url={s.url}>
          {s.title ? <Txt x={50} y={148} size={48} weight={800}>{s.title}</Txt> : <Bar x={50} y={110} w={430} h={42} c={look.ink} />}
          <Bar x={50} y={184} w={640} />
          <Bar x={50} y={216} w={540} />
          {s.hidden ? <>
            <rect x={36} y={258} width={card.w - 72} height={236} rx={22} fill="none" stroke={look.blue} strokeWidth={4} strokeDasharray="12 10" opacity={hiddenFlash} />
            {kw.map((l, i) => <Txt key={i} x={60} y={318 + i * 54} size={40} weight={700} color="#FFFFFF">{l}</Txt>)}
            {hiddenFlash > 0.01 && <g opacity={hiddenFlash}><Chip x={card.w - 170} y={258} label="hidden text" logo={null} size={22} fill={look.blue} color="#fff" /></g>}
          </> : <>
            {[0, 1, 2, 3, 4].map(i => <Bar key={i} x={50} y={290 + i * 40} w={[700, 620, 660, 520, 600][i]} p={progress(frame, pageAt + 6 + i * 3, 12)} />)}
          </>}
        </Browser>
        {s.hidden && <>
          <defs><clipPath id="kwlens"><circle cx={lx} cy={ly} r={110 * lensOn} /></clipPath></defs>
          <g clipPath="url(#kwlens)">
            <rect x={card.x} y={card.y + 70} width={card.w} height={card.h - 76} fill={look.lav} />
            {kw.map((l, i) => <Txt key={i} x={card.x + 60} y={card.y + 318 + i * 54} size={40} weight={800} color={look.blue}>{l}</Txt>)}
          </g>
        </>}
      </Pop>
      {s.badge && <>
        <g transform={`translate(${card.x + card.w - 24} ${card.y + 6}) scale(${rank})`}>
          <circle r={70} fill="url(#bluePill)" filter="url(#softSm)" />
          <Txt y={s.badge.length > 2 ? 16 : 22} size={s.badge.length > 2 ? 42 : 60} weight={800} color="#fff" textAnchor="middle">{s.badge}</Txt>
        </g>
        <Spark x={card.x + card.w + 30} y={card.y - 40} at={badgeAt + 3} rot={30} />
      </>}
      {s.visitor && <Pop at={visitorAt} cx={270} cy={1200} dy={60}>
        <Avatar x={270} y={1290} s={0.74} expr={mood} gaze={[0.5, -0.6]} tilt={reacted ? -6 : 0} />
        {s.reaction && <Thought x={420} y={960} mark={s.reaction} p={reactPop} />}
      </Pop>}
      {s.crawler && <Crawler x={botX} y={1275} s={0.8} walking={crawlIn > 0 && crawlIn < 1} lensR={lensOn > 0 ? 110 / 0.8 : 46}
        lens={lensOn > 0 ? { x: (lx - botX) / 0.8, y: (ly - 1275) / 0.8 } : { x: -110, y: -150 }} />}
    </Stage>
  )
}

// ── ranking: a results list; one site moves up or down; up to two tag cards ──────────────────────────────────
const TagCard: React.FC<{ title: string, sub: string, at: number, i: number }> = ({ title, sub, at, i }) => {
  const x = 140 + i * 420
  const logo = logoFor(sub.split(/[\s·]+/)[0])
  return (
    <Pop at={at} cx={x + 180} cy={1200} from={0.6}>
      <Card x={x} y={1140} w={360} h={124} r={30} tilt={i ? 3 : -3}>
        <Txt x={180} y={64} size={44} weight={800} textAnchor="middle">{title}</Txt>
        <Txt x={logo ? 196 : 180} y={100} size={22} weight={700} color={look.muted} textAnchor="middle" style={{ letterSpacing: '0.12em' }}>{sub.toUpperCase()}</Txt>
        {logo && <Logo name={logo} x={196 - sub.length * 9.4 - 18} y={92} size={26} />}
      </Card>
      <Spark x={x + (i ? 380 : -20)} y={1130} at={at + 4} rot={i ? 40 : -40} />
    </Pop>
  )
}

export const Ranking: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'ranking'>
  const frame = useCurrentFrame()
  const n = s.results.length, h = Math.min(s.highlight, n - 1), to = Math.min(s.to, n - 1)
  const moveAt = on(s.on?.move, 0.72)
  const p = progress(frame, moveAt, 26)
  const final = (i: number) => {
    if (i === h) return to
    if (h < to) return i > h && i <= to ? i - 1 : i
    if (h > to) return i >= to && i < h ? i + 1 : i
    return i
  }
  const down = to > h, moved = to !== h
  const rowH = 100, top = 120
  const cardH = 150 + n * rowH
  const color = down ? look.red : look.green
  return (
    <Stage>
      <Kicker text={s.kicker} />
      <Pop at={Math.min(on(s.on?.list, 0), 4)} cx={540} cy={700}>
        <Browser x={130} y={370} w={820} h={cardH} url={s.query}>
          {s.results.map((d, i) => ({ d, i })).sort((x, y) => Number(x.i === h) - Number(y.i === h)).map(({ d, i }) => {
            const pos = i + (final(i) - i) * p
            const hi = i === h
            const shake = hi && moved ? Math.sin(frame * 1.7) * 6 * progress(frame, moveAt - 6, 4) * (1 - p) : 0
            const logo = logoFor(d.split('.')[0])
            return (
              <g key={d + i} transform={`translate(${shake} ${top + pos * rowH})`} opacity={hi && down ? 1 - Math.max(0, p - 0.8) * 2 : 1}>
                {hi && <rect x={26} y={-12} width={768} height={rowH - 14} rx={22} fill={moved && p > 0.5 ? (down ? '#FDECEC' : '#EAF7EF') : look.lav} />}
                <Txt x={58} y={34} size={24} weight={800} color={look.muted}>{Math.round(pos) + 1}</Txt>
                {logo ? <Logo name={logo} x={112} y={26} size={34} /> : <circle cx={112} cy={26} r={18} fill={hi ? look.blue : look.line} />}
                <Txt x={146} y={36} size={32} weight={700} color={hi && moved && p > 0.5 ? color : look.ink}
                  style={{ textDecoration: hi && down && p > 0.6 ? 'line-through' : 'none' }}>{d}</Txt>
                <Bar x={146} y={56} w={hi ? 440 : 380 - (i % 4) * 22} h={12} />
              </g>
            )
          })}
        </Browser>
      </Pop>
      {(s.tags ?? []).slice(0, 2).map((t, i) => <TagCard key={i} title={t.title} sub={t.sub} i={i} at={on(s.on?.tags?.[i], 0.25 + i * 0.2)} />)}
      {moved && <g opacity={progress(frame, moveAt, 8) * (1 - progress(frame, moveAt + S(1.4), 10))}>
        {(() => {
          const y0 = 370 + top + h * rowH + 20, y1 = 370 + top + to * rowH + 20, y = y0 + (y1 - y0) * p, d = down ? 1 : -1
          return <>
            <path d={`M 990 ${y0} L 990 ${y1}`} stroke={color} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
            <path d={`M 967 ${y - 24 * d} L 990 ${y} L 1013 ${y - 24 * d}`} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          </>
        })()}
      </g>}
    </Stage>
  )
}

// ── chat: (ten blue links fold away) a question to AI assistants, one answer card ─────────────────────────────
export const Chat: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'chat'>
  const frame = useCurrentFrame()
  const linksAt = on(s.on?.links, 0)
  const askWord = on(s.on?.ask, s.links ? 0.45 : 0.04, -0.25)
  const ask = s.links ? askWord : Math.min(askWord, 4)
  const ans = on(s.on?.answer, 0.72, -0.35)
  const typed = Math.floor(interpolate(frame, [ask, ask + 16], [0, s.question.length], clamp))
  const qLines = wrap(s.question.slice(0, typed), 19)
  const n = s.assistants.length
  const cx = n === 1 ? [540] : n === 2 ? [360, 720] : [230, 520, 818]
  const chipY = 840
  const linksOut = progress(frame, ask - 8, 12)
  const mid = cx[Math.floor(n / 2)]
  return (
    <Stage>
      <Kicker text={s.kicker} />
      {s.links && <g opacity={1 - linksOut} transform={`translate(540 700) scale(${1 - 0.25 * linksOut}) translate(-540 -700)`}>
        <Card x={150} y={380} w={780} h={700} r={38} back={false}>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} opacity={progress(frame, linksAt + i * 1.5, 8)} transform={`translate(0 ${60 + i * 64})`}>
              <Txt x={48} y={20} size={22} weight={800} color={look.muted}>{i + 1}</Txt>
              <Bar x={96} y={2} w={380 - (i % 3) * 60} h={22} c={look.blue} />
              <Bar x={96} y={34} w={560 - (i % 4) * 50} h={11} />
            </g>
          ))}
        </Card>
      </g>}
      <Pop at={ask} cx={540} cy={520}>
        <rect x={160} y={420} width={760} height={200} rx={56} fill="url(#inkCard)" filter="url(#soft)" />
        {(qLines.length ? qLines : ['']).slice(0, 2).map((l, i, all) => (
          <Txt key={i} x={220} y={505 + i * 70} size={58} weight={800} color="#fff">{l}
            {i === all.length - 1 && <tspan fill={look.blue} fontWeight={500} opacity={typed < s.question.length || Math.floor(frame / 15) % 2 === 0 ? 1 : 0}>{' |'}</tspan>}
          </Txt>
        ))}
        <Avatar x={156} y={470} s={0.36} expr={frame > ans ? 'happy' : (s.mood ?? 'smile')} gaze={[0.6, 0.3]} variant="b" hood="lav" seed={2} />
      </Pop>
      <Spark x={905} y={410} at={ask + 8} rot={35} />
      {cx.map((x, i) => (
        <Connector key={i} d={x === 540 ? 'M 540 620 L 540 800' : `M 540 620 L 540 680 Q 540 720 ${x < 540 ? 500 : 580} 720 L ${x < 540 ? x + 40 : x - 40} 720 Q ${x} 720 ${x} 760 L ${x} 800`} at={ask + 18} />
      ))}
      {s.assistants.map((label, i) => (
        <Pop key={label} at={ask + 24 + i * 4} cx={cx[i]} cy={chipY}>
          <Chip x={cx[i]} y={chipY} label={label} size={30} w={Math.max(240, label.length * 18 + 110)} />
        </Pop>
      ))}
      <Connector d={`M ${mid} 892 L ${mid} 980`} at={ans - 6} dur={10} />
      <Pop at={ans} cx={540} cy={1090}>
        <Card x={140} y={980} w={780} h={250} r={44}>
          <rect x={28} y={28} width={210} height={194} rx={30} fill={look.lav} />
          <path d="M 48 120 Q 110 80 150 130 T 228 110" fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
          <path d="M 70 210 L 120 60" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
          <g transform="translate(140 118)">
            <path d="M 0 40 C -30 4 -34 -8 -34 -20 A 34 34 0 1 1 34 -20 C 34 -8 30 4 0 40 Z" fill="url(#bluePill)" filter="url(#softSm)" />
            <circle cx={0} cy={-20} r={12} fill="#fff" />
          </g>
          <g transform="translate(224 210)"><circle r={30} fill="#fff" filter="url(#softSm)" /><Sparkle x={0} y={0} r={17} /></g>
          <Txt x={276} y={92} size={40} weight={800}>{s.answerTitle}</Txt>
          {wrap(s.answerSub, 26).slice(0, 2).map((l, i) => <Txt key={i} x={276} y={138 + i * 36} size={28} weight={600} color={look.muted}>{l}</Txt>)}
          <Bar x={276} y={196} w={400} h={14} p={progress(frame, ans + 6, 12)} />
        </Card>
      </Pop>
      <Spark x={150} y={975} at={ans + 6} rot={-50} color={look.blue} />
    </Stage>
  )
}

// ── cards: two or three stacked cards (a big word, a label, a line); some light up ───────────────────────────
export const Cards: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'cards'>
  const frame = useCurrentFrame()
  const n = s.cards.length
  const hl = progress(frame, on(s.on?.highlight, 0.9), 12)
  const gap = n === 2 ? 320 : 262
  const y0 = n === 2 ? 470 : 380
  return (
    <Stage>
      <Kicker text={s.kicker} />
      {s.cards.map((c, i) => {
        const y = y0 + i * gap
        const on1 = (s.highlight ?? []).includes(i) ? hl : 0
        const cue = on(s.on?.cards?.[i], (i / n) * 0.75)
        const at = i === 0 ? Math.min(cue, 4) : cue
        const big = c.big.length > 3 ? 70 : 92
        return (
          <Pop key={i} at={at} cx={540} cy={y + 105}>
            <Card x={140} y={y} w={800} h={212} r={44} back={i > 0}>
              {on1 > 0 && <rect width={800} height={212} rx={44} fill="none" stroke={look.blue} strokeWidth={5} opacity={on1} />}
              <rect x={30} y={30} width={240} height={152} rx={32} fill={i === 0 ? look.bg : look.lav} />
              <Txt x={150} y={106 + big * 0.33} size={big} weight={800} color={i === 0 ? look.ink : look.blue} textAnchor="middle">{c.big}</Txt>
              <Txt x={308} y={88} size={25} weight={700} color={look.muted}>{c.label}</Txt>
              <Txt x={308} y={142} size={44} weight={800}>{c.line}</Txt>
            </Card>
            {i < n - 1 && <Connector d={`M 540 ${y + 214} L 540 ${y + gap}`} at={on(s.on?.cards?.[i + 1], ((i + 1) / n) * 0.75) - 4} dur={8} width={5} />}
          </Pop>
        )
      })}
      <g opacity={hl}><Sparkle x={905} y={y0 + n * gap - 40} r={26} rot={frame * 2} /></g>
    </Stage>
  )
}

// ── versus: "A ≠ B" with an optional AI answer line and two explained sides ──────────────────────────────────
export const Versus: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'versus'>
  const frame = useCurrentFrame()
  const hlAt = Math.min(on(s.on?.headline, 0.04), 4)
  const hl = progress(frame, hlAt, 10)
  const leftAt = on(s.on?.left, 0.4), rightAt = on(s.on?.right, 0.68)
  const answerAt = on(s.on?.answer, 0.15)
  const r = progress(frame, rightAt + S(0.6), 14)
  const top = s.answer ? 780 : 560
  const side = (x: number, d: Of<'versus'>['left'], at: number, accent: boolean) => (
    <Pop at={at} cx={x + 160} cy={top + 140}>
      <Card x={x} y={top} w={320} h={300} r={44} back={accent}>
        <rect x={84} y={34} width={152} height={130} rx={30} fill={look.lav} />
        <g transform="translate(160 100)"><Glyph icon={d.icon} /></g>
        {accent && <rect x={84} y={34} width={152} height={130} rx={30} fill="none" stroke={look.blue} strokeWidth={5} opacity={r} />}
        <Txt x={160} y={228} size={40} weight={800} textAnchor="middle" color={accent ? look.blue : look.ink}>{d.title}</Txt>
        <Txt x={160} y={266} size={24} weight={600} color={look.muted} textAnchor="middle">{d.sub}</Txt>
      </Card>
    </Pop>
  )
  return (
    <Stage>
      <Kicker text={s.kicker} />
      <g opacity={hl} transform={`translate(0 ${(1 - hl) * 16})`}>
        <Txt x={482} y={410} size={74} weight={800} textAnchor="end">{s.headline.left}</Txt>
        <rect x={502} y={348} width={96} height={80} rx={40} fill="url(#bluePill)" />
        <Txt x={550} y={s.headline.sign === 'vs' ? 402 : 410} size={s.headline.sign === 'vs' ? 40 : 64} weight={800} color="#fff" textAnchor="middle">{s.headline.sign}</Txt>
        <Txt x={618} y={410} size={74} weight={800} textAnchor="start">{s.headline.right}</Txt>
      </g>
      {s.answer && <Pop at={answerAt} cx={540} cy={560}>
        <Card x={130} y={470} w={820} h={190} r={44}>
          <Sparkle x={58} y={58} r={20} />
          <Txt x={92} y={66} size={24} weight={800} color={look.muted} style={{ letterSpacing: '0.14em' }}>AI ANSWER</Txt>
          <Txt x={44} y={138} size={s.answer.length > 32 ? 36 : 42} weight={600}>{s.answer}</Txt>
        </Card>
      </Pop>}
      {s.answer && <>
        <Connector d="M 360 668 Q 330 720 300 770" at={leftAt} dur={10} color={look.soft} width={5} />
        <Connector d="M 812 668 Q 830 720 800 770" at={rightAt} dur={10} />
      </>}
      {side(140, s.left, leftAt, false)}
      {side(620, s.right, rightAt, true)}
      <Spark x={950} y={top - 10} at={rightAt + S(0.6)} rot={40} color={look.blue} />
      <Pop at={leftAt + S(0.4)} cx={540} cy={1200} dy={50}>
        <Avatar x={540} y={1300} s={0.5} expr={frame >= rightAt + S(0.6) ? 'happy' : (s.mood ?? 'think')} variant="a" seed={5} />
      </Pop>
    </Stage>
  )
}

// ── checklist: two or three things to do, each ticked as it's said ──────────────────────────────────────────
const CheckRow: React.FC<{ i: number, n: number, title: string, detail: string, icon: Icon, a: number }> = ({ i, n, title, detail, icon, a }) => {
  const frame = useCurrentFrame()
  const tick = progress(frame, a + 8, 12)
  const tickPop = useSpring(a + 8, 10, 220)
  const y = (n === 2 ? 470 : 380) + i * (n === 2 ? 320 : 262)
  return (
    <Pop at={a - 8} cx={540} cy={y + 105}>
      <Card x={140} y={y} w={800} h={212} r={44} back={false}>
        <rect x={30} y={30} width={152} height={152} rx={34} fill={look.lav} />
        <g transform="translate(106 106)">
          {icon === 'robot' ? <>
            <rect x={-38} y={-52} width={76} height={104} rx={10} fill="#fff" />
            <path d={`M -38 -52 L ${-38 + 66 * (1 - progress(frame, a, 12))} -44 L ${-38 + 66 * (1 - progress(frame, a, 12))} 44 L -38 52 Z`} fill={look.blue} opacity={0.9} />
            <g transform={`translate(${interpolate(progress(frame, a + 4, 24), [0, 1], [70, -4])} 50) scale(0.3)`}><Crawler x={0} y={0} lens={null} walking /></g>
          </> : <Glyph icon={icon} />}
        </g>
        <Txt x={214} y={98} size={title.length > 22 ? 34 : 38} weight={800}>{title}</Txt>
        <Txt x={214} y={146} size={26} weight={600} color={look.muted}>{detail}</Txt>
        <g transform={`translate(178 34) scale(${tickPop})`}>
          <circle r={30} fill={look.green} filter="url(#softSm)" />
          <path d="M -13 1 L -3 11 L 15 -9" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - tick} />
        </g>
      </Card>
    </Pop>
  )
}

export const Checklist: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'checklist'>
  const n = s.items.length
  return (
    <Stage>
      <Kicker text={s.kicker} />
      {s.items.map((it, i) => <CheckRow key={i} i={i} n={n} title={it.title} detail={it.detail} icon={it.icon} a={i === 0 ? Math.min(on(s.on?.items?.[i], 0.08), 12) : on(s.on?.items?.[i], 0.08 + i * (0.8 / n))} />)}
    </Stage>
  )
}

// ── timeline: three or four dated moments on a vertical line ────────────────────────────────────────────────
export const Timeline: React.FC = () => {
  const { scene, on } = useScene(); const s = scene as Of<'timeline'>
  const frame = useCurrentFrame()
  const n = s.events.length
  const gap = n === 3 ? 280 : 215
  const y0 = 400
  const ats = s.events.map((_, i) => (i === 0 ? Math.min(on(s.on?.events?.[i], 0.04), 4) : on(s.on?.events?.[i], 0.04 + i * (0.8 / n))))
  const lineP = progress(frame, ats[0], Math.max(10, ats[n - 1] - ats[0] + 10))
  return (
    <Stage>
      <Kicker text={s.kicker} />
      <rect x={213} y={y0 + 50} width={14} height={(n - 1) * gap} rx={7} fill={look.line} />
      <rect x={213} y={y0 + 50} width={14} height={(n - 1) * gap * lineP} rx={7} fill="url(#bluePill)" />
      {s.events.map((e, i) => {
        const y = y0 + i * gap
        const last = i === n - 1
        const active = progress(frame, ats[i], 8)
        return (
          <Pop key={i} at={ats[i]} cx={560} cy={y + 50}>
            <circle cx={220} cy={y + 50} r={30} fill={active > 0.5 ? look.blue : look.line} filter="url(#softSm)" />
            <circle cx={220} cy={y + 50} r={11} fill="#fff" />
            <Card x={290} y={y - 30} w={650} h={160} r={38} back={last}>
              <Txt x={40} y={70} size={52} weight={800} color={last ? look.blue : look.ink}>{e.year}</Txt>
              <Txt x={40} y={120} size={32} weight={700} color={look.muted}>{e.label}</Txt>
            </Card>
            {last && <Spark x={950} y={y - 30} at={ats[i] + 4} rot={40} color={look.blue} />}
          </Pop>
        )
      })}
    </Stage>
  )
}

// ── cta: the soft close. Brand, its URL, an example report, follow ──────────────────────────────────────────
export const Cta: React.FC = () => {
  const { scene, on, speechEnd } = useScene(); const s = scene as Of<'cta'>
  const frame = useCurrentFrame()
  const brandAt = on(s.on?.brand ?? BRAND.name, 0.3, -0.1)
  const rowsAt = on(s.on?.rows, 0.55)
  const rec = progress(frame, rowsAt + S(1.2), 12)
  const named = s.rows.filter(r => r.ok).length
  return (
    <Stage>
      <Pop at={2} cx={540} cy={330}>
        <rect x={150} y={262} width={790} height={124} rx={62} fill="url(#inkCard)" filter="url(#soft)" />
        <Txt x={575} y={343} size={s.question.length > 26 ? 40 : 44} weight={800} color="#fff" textAnchor="middle">{s.question}</Txt>
        <Avatar x={150} y={352} s={0.3} expr={frame > rowsAt + S(1.2) ? 'happy' : (s.mood ?? 'surprised')} variant="b" hood="lav" seed={2} />
      </Pop>
      <Pop at={brandAt} cx={540} cy={500} from={0.7}>
        <Txt x={540} y={530} size={124} weight={800} textAnchor="middle" style={{ letterSpacing: '-0.05em' }}>{BRAND.name}</Txt>
        <Sparkle x={540 + BRAND.name.length * 45} y={440} r={24} rot={frame * 1.5} />
      </Pop>
      <Pop at={brandAt + S(0.35)} cx={540} cy={590}>
        <rect x={540 - (BRAND.url.length * 19 + 110) / 2} y={556} width={BRAND.url.length * 19 + 110} height={68} rx={34} fill={look.lav} />
        <g transform={`translate(${540 - (BRAND.url.length * 19 + 110) / 2 + 42} 590)`}>
          <circle r={15} fill="none" stroke={look.blue} strokeWidth={4} />
          <ellipse rx={6.5} ry={15} fill="none" stroke={look.blue} strokeWidth={3.5} />
          <line x1={-15} y1={0} x2={15} y2={0} stroke={look.blue} strokeWidth={3.5} />
        </g>
        <Txt x={540 + 22} y={602} size={34} weight={800} color={look.blue} textAnchor="middle">{BRAND.url}</Txt>
      </Pop>
      <Pop at={rowsAt - S(0.2)} cx={540} cy={870}>
        <Card x={140} y={660} w={800} h={110 + s.rows.length * 76 + 50} r={44}>
          <Txt x={44} y={70} size={23} weight={800} color={look.muted} style={{ letterSpacing: '0.14em' }}>EXAMPLE · YOUR CUSTOMERS' QUESTIONS</Txt>
          {s.rows.map((r, i) => {
            const p = progress(frame, rowsAt + i * 5, 10)
            const logo = logoFor(r.assistant)
            return (
              <g key={i} opacity={p} transform={`translate(${(1 - p) * 30} ${104 + i * 76})`}>
                <rect x={30} y={0} width={740} height={64} rx={22} fill={r.ok ? '#EAF7EF' : look.bg} />
                {logo && <Logo name={logo} x={72} y={32} size={34} />}
                <Txt x={108} y={43} size={32} weight={700}>{r.assistant}</Txt>
                <Txt x={706} y={43} size={25} weight={700} color={r.ok ? look.green : look.muted} textAnchor="end">{r.ok ? 'recommends you' : 'names a competitor'}</Txt>
                <g transform="translate(740 32)">
                  <circle r={18} fill={r.ok ? look.green : look.soft} />
                  {r.ok ? <path d="M -8 1 L -2 7 L 9 -6" fill="none" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
                    : <path d="M -7 0 L 7 0" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" />}
                </g>
              </g>
            )
          })}
          <Txt x={400} y={104 + s.rows.length * 76 + 38} size={32} weight={800} color={look.blue} textAnchor="middle" opacity={rec}>Recommended by {named} of {s.rows.length} assistants</Txt>
        </Card>
      </Pop>
      <g opacity={progress(frame, speechEnd + 3, 12)}>
        <rect x={330} y={1222} width={420} height={88} rx={44} fill="url(#inkCard)" />
        <Txt x={540} y={1278} size={32} weight={800} color="#fff" textAnchor="middle" style={{ letterSpacing: '0.12em' }}>FOLLOW FOR MORE</Txt>
      </g>
    </Stage>
  )
}

export const SCENES: Record<Scene['type'], React.FC> = {
  hook: Hook, browser: BrowserScene, ranking: Ranking, chat: Chat, cards: Cards, versus: Versus, checklist: Checklist, timeline: Timeline, cta: Cta,
}
