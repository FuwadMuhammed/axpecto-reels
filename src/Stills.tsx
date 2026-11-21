// The two image formats made from each reel: a 4:5 carousel (cover, teaching slides, end card) and a 9:16 story.
import React from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import { BRAND } from './brand'
import { Avatar, Crawler } from './characters'
import { look } from './look'
import { LOGOS, logoFor } from './logos'
import { Defs, Sparkle } from './premium'
import type { Reel } from './types'

type P = { reel: Reel }
const backdrop = 'radial-gradient(1000px 760px at 88% 6%, rgba(210,217,255,0.62), transparent 62%), radial-gradient(820px 720px at 0% 98%, rgba(255,226,204,0.5), transparent 60%)'

/** Text in which a named brand (Google, ChatGPT, Perplexity…) gets its real logo. */
const Rich: React.FC<{ text: string, size: number }> = ({ text, size }) => (
  <>{text.split(' ').map((w, i) => {
    const logo = logoFor(w)
    return (
      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.16, marginRight: size * 0.26 }}>
        {logo && <Img src={staticFile(`logos/${LOGOS[logo].file}`)} style={{ height: size * 0.78, width: size * 0.78 * LOGOS[logo].aspect }} />}
        {w}
      </span>
    )
  })}</>
)
const Pill: React.FC<{ children: React.ReactNode, blue?: boolean, size?: number }> = ({ children, blue, size = 30 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', padding: `${size * 0.62}px ${size * 1.25}px`, borderRadius: 999, color: '#fff', fontFamily: look.font, fontWeight: 800,
    fontSize: size, letterSpacing: blue ? '-0.01em' : '0.14em', background: blue ? 'linear-gradient(#3D68FF, #2449F0)' : 'linear-gradient(#1B1C22, #0C0D10)',
    boxShadow: blue ? '0 16px 34px rgba(47,91,255,0.3)' : 'none' }}>{children}</div>
)
const Footer: React.FC<{ i: number, n: number }> = ({ i, n }) => (
  <div style={{ position: 'absolute', left: 80, right: 80, bottom: 58, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: look.font, fontWeight: 700, fontSize: 29, color: look.muted }}>
    <span>{BRAND.account}</span>
    <span style={{ display: 'flex', gap: 10 }}>{Array.from({ length: n }, (_, k) => <span key={k} style={{ width: k === i ? 38 : 12, height: 12, borderRadius: 6, background: k === i ? look.blue : look.bar }} />)}</span>
  </div>
)

export const Carousel: React.FC<P> = ({ reel }) => {
  const i = useCurrentFrame(), { cover, slides } = reel.carousel, n = slides.length + 2
  const page = (() => {
    if (i === 0) return (
      <>
        <div style={{ position: 'absolute', top: 92, left: 80 }}><Pill size={28}>{reel.story.kicker.toUpperCase() === 'NEW REEL' ? 'SEARCH, THEN AND NOW' : reel.story.kicker.toUpperCase()}</Pill></div>
        <div style={{ position: 'absolute', top: 245, left: 80, width: 900, fontFamily: look.font, fontWeight: 800, fontSize: cover.length > 34 ? 104 : 122, lineHeight: 1.04, letterSpacing: '-0.045em', color: look.ink }}><Rich text={cover} size={cover.length > 34 ? 104 : 122} /></div>
        <svg width={1080} height={1350} style={{ position: 'absolute', inset: 0 }}><Crawler still x={825} y={1190} s={1.05} lens={{ x: -140, y: -180 }} /><Sparkle x={130} y={1040} r={34} /></svg>
        <div style={{ position: 'absolute', left: 80, bottom: 150 }}><Pill blue size={36}>Swipe →</Pill></div>
      </>
    )
    if (i === n - 1) return (
      <>
        <svg width={1080} height={1350} style={{ position: 'absolute', inset: 0 }}><Avatar still x={540} y={560} s={1.05} expr="happy" variant="b" hood="lav" /><Sparkle x={830} y={210} r={36} /></svg>
        <div style={{ position: 'absolute', top: 610, left: 70, width: 940, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 70, lineHeight: 1.08, letterSpacing: '-0.035em', color: look.ink }}>What does AI say about you?</div>
        <div style={{ position: 'absolute', top: 800, width: 1080, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 136, letterSpacing: '-0.05em', color: look.ink }}>{BRAND.name}</div>
        <div style={{ position: 'absolute', top: 1000, width: 1080, display: 'flex', justifyContent: 'center' }}><Pill blue size={44}>{BRAND.url}</Pill></div>
      </>
    )
    const s = slides[i - 1]
    return (
      <>
        <div style={{ position: 'absolute', left: 108, top: 214, width: 890, height: 850, borderRadius: 64, background: 'linear-gradient(135deg, #DCE2FF, #BFC9FF)' }} />
        <div style={{ position: 'absolute', left: 80, top: 182, width: 890, height: 850, borderRadius: 64, background: '#fff', boxShadow: '0 28px 60px rgba(47,91,255,0.14)', padding: 72, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: 104, height: 104, borderRadius: 34, background: look.lav, color: look.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 54 }}>{i}</div>
          <div style={{ marginTop: 50, fontFamily: look.font, fontWeight: 800, fontSize: s.title.length > 26 ? 76 : 88, lineHeight: 1.06, letterSpacing: '-0.04em', color: look.ink }}><Rich text={s.title} size={s.title.length > 26 ? 76 : 88} /></div>
          <div style={{ marginTop: 38, fontFamily: look.font, fontWeight: 600, fontSize: 52, lineHeight: 1.3, letterSpacing: '-0.015em', color: '#5C5B65' }}><Rich text={s.body} size={52} /></div>
        </div>
      </>
    )
  })()
  return <AbsoluteFill style={{ background: look.bg }}><Defs /><AbsoluteFill style={{ background: backdrop }} />{page}<Footer i={i} n={n} /></AbsoluteFill>
}

export const Story: React.FC<P> = ({ reel }) => (
  <AbsoluteFill style={{ background: look.bg }}>
    <Defs /><AbsoluteFill style={{ background: backdrop }} />
    <div style={{ position: 'absolute', top: 290, width: 1080, display: 'flex', justifyContent: 'center' }}><Pill size={34}>{reel.story.kicker.toUpperCase()}</Pill></div>
    <div style={{ position: 'absolute', top: 440, left: 90, width: 900, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: reel.story.line.length > 42 ? 94 : 112, lineHeight: 1.06, letterSpacing: '-0.045em', color: look.ink }}><Rich text={reel.story.line} size={reel.story.line.length > 42 ? 94 : 112} /></div>
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}><Avatar still x={400} y={1290} s={1.05} expr="surprised" gaze={[0.5, -0.5]} /><Crawler still x={790} y={1275} s={0.95} lens={null} /><Sparkle x={870} y={880} r={36} /></svg>
    <div style={{ position: 'absolute', top: 1340, width: 1080, display: 'flex', justifyContent: 'center' }}><Pill blue size={46}>Watch the new reel</Pill></div>
    <div style={{ position: 'absolute', top: 1485, width: 1080, textAlign: 'center', fontFamily: look.font, fontWeight: 800, fontSize: 36, color: look.muted }}>{BRAND.url}</div>
  </AbsoluteFill>
)
