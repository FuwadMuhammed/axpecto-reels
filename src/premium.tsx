// Shared look for the premium board: one <Defs/> (shadows, gradients) and the pieces every scene uses.
import React from 'react'
import { staticFile, useCurrentFrame } from 'remotion'
import { progress } from './motion'
import { look } from './look'
import { LOGOS, logoFor, type LogoName } from './logos'

/** Gradients and filters, referenced by id from every SVG on the page. Render once. */
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx={0} dy={22} stdDeviation={26} floodColor="#2F5BFF" floodOpacity={0.13} />
        <feDropShadow dx={0} dy={4} stdDeviation={5} floodColor="#111216" floodOpacity={0.06} />
      </filter>
      <filter id="softSm" x="-40%" y="-40%" width="180%" height="200%">
        <feDropShadow dx={0} dy={12} stdDeviation={14} floodColor="#1E2A66" floodOpacity={0.16} />
      </filter>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation={4} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="backCard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DCE2FF" /><stop offset="1" stopColor="#BFC9FF" /></linearGradient>
      <linearGradient id="bluePill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3D68FF" /><stop offset="1" stopColor="#2449F0" /></linearGradient>
      <linearGradient id="inkCard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1B1C22" /><stop offset="1" stopColor="#0C0D10" /></linearGradient>
      {/* avatar */}
      <radialGradient id="skinA" cx="0.42" cy="0.36" r="0.7"><stop offset="0" stopColor="#FFDDC2" /><stop offset="0.6" stopColor="#F4B88F" /><stop offset="1" stopColor="#DE9468" /></radialGradient>
      <radialGradient id="skinB" cx="0.42" cy="0.36" r="0.7"><stop offset="0" stopColor="#D9A27A" /><stop offset="0.6" stopColor="#B87A52" /><stop offset="1" stopColor="#93593A" /></radialGradient>
      <linearGradient id="neckA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C97F57" /><stop offset="1" stopColor="#E9A67D" /></linearGradient>
      <linearGradient id="neckB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7E4A30" /><stop offset="1" stopColor="#A86C47" /></linearGradient>
      <linearGradient id="hairA" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#5A3A2A" /><stop offset="1" stopColor="#2A1A13" /></linearGradient>
      <linearGradient id="hairB" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#2C2A33" /><stop offset="1" stopColor="#0F0E13" /></linearGradient>
      <linearGradient id="hoodBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4C74FF" /><stop offset="1" stopColor="#2444D8" /></linearGradient>
      <linearGradient id="hoodLav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B9C4FF" /><stop offset="1" stopColor="#8B9BF2" /></linearGradient>
      <radialGradient id="iris" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#8A5A3A" /><stop offset="1" stopColor="#3B2214" /></radialGradient>
      <radialGradient id="faceShade" cx="0.5" cy="0.25" r="0.75"><stop offset="0.55" stopColor="#7A3E1E" stopOpacity={0} /><stop offset="1" stopColor="#7A3E1E" stopOpacity={0.22} /></radialGradient>
      <radialGradient id="blush" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FF8C8C" stopOpacity={0.55} /><stop offset="1" stopColor="#FF8C8C" stopOpacity={0} /></radialGradient>
      {/* crawler */}
      <linearGradient id="botBody" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#DCE2F5" /></linearGradient>
      <linearGradient id="botScreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#262A3A" /><stop offset="1" stopColor="#0E1018" /></linearGradient>
      <radialGradient id="botBall" cx="0.35" cy="0.3" r="0.7"><stop offset="0" stopColor="#8FA8FF" /><stop offset="1" stopColor="#2449F0" /></radialGradient>
      <radialGradient id="glass" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.55} /><stop offset="1" stopColor="#C9D5FF" stopOpacity={0.18} /></radialGradient>
    </defs>
  </svg>
)

/** White card with a soft shadow and (optionally) the lavender card peeking out behind it. */
export const Card: React.FC<{ x: number, y: number, w: number, h: number, r?: number, back?: boolean, fill?: string, children?: React.ReactNode, tilt?: number }> = ({
  x, y, w, h, r = 40, back = true, fill = look.card, children, tilt = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt} ${w / 2} ${h / 2})`}>
    {back && <rect x={18} y={22} width={w} height={h} rx={r} fill="url(#backCard)" />}
    <rect width={w} height={h} rx={r} fill={fill} filter="url(#soft)" />
    {children}
  </g>
)

export const Txt: React.FC<React.SVGProps<SVGTextElement> & { size: number, weight?: number, color?: string, children: React.ReactNode }> = ({
  size, weight = 700, color = look.ink, children, style, ...rest
}) => (
  <text {...rest} fill={color} style={{ fontFamily: look.font, fontWeight: weight, fontSize: size, letterSpacing: size >= 60 ? '-0.035em' : '-0.01em', ...style }}>{children}</text>
)

export const Logo: React.FC<{ name: LogoName, x: number, y: number, size: number }> = ({ name, x, y, size }) => {
  const { file, aspect } = LOGOS[name]
  return <image href={staticFile(`logos/${file}`)} x={x - (size * aspect) / 2} y={y - size / 2} width={size * aspect} height={size} />
}

/** Lavender pill. Centred on (x, y). A label naming a known brand gets its logo automatically. */
export const Chip: React.FC<{ x: number, y: number, label: string, logo?: LogoName | null, size?: number, w?: number, fill?: string, color?: string }> = ({
  x, y, label, logo, size = 34, w, fill = look.lav, color = look.ink,
}) => {
  const mark = logo === null ? undefined : logo ?? logoFor(label)
  const width = w ?? label.length * size * 0.56 + (mark ? size * 2.4 : size * 1.4)
  const h = size * 2.5
  return (
    <g transform={`translate(${x - width / 2} ${y - h / 2})`}>
      <rect width={width} height={h} rx={h / 2} fill={fill} />
      {mark && <Logo name={mark} x={size * 1.35} y={h / 2} size={size * 1.25} />}
      <Txt x={mark ? size * 2.3 : width / 2} y={h / 2 + size * 0.36} size={size} weight={700} color={color} textAnchor={mark ? 'start' : 'middle'}>{label}</Txt>
    </g>
  )
}

/** Three little accent strokes ("!"-style sparks) that pop out from a corner. */
export const Spark: React.FC<{ x: number, y: number, at: number, rot?: number, color?: string, s?: number }> = ({ x, y, at, rot = 0, color = look.ink, s = 1 }) => {
  const frame = useCurrentFrame()
  const p = progress(frame, at, 10)
  if (p <= 0) return null
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={p}>
      {[-38, 0, 38].map((a, i) => {
        const r0 = 20 + (1 - p) * 10, r1 = r0 + 30 * p
        const rad = ((a - 90) * Math.PI) / 180
        return <line key={i} x1={Math.cos(rad) * r0} y1={Math.sin(rad) * r0} x2={Math.cos(rad) * r1} y2={Math.sin(rad) * r1}
          stroke={color} strokeWidth={7} strokeLinecap="round" />
      })}
    </g>
  )
}

/** Blue line that draws itself along `d`. */
export const Connector: React.FC<{ d: string, at: number, dur?: number, color?: string, width?: number }> = ({ d, at, dur = 14, color = look.blue, width = 6 }) => {
  const frame = useCurrentFrame()
  const p = progress(frame, at, dur)
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={p > 0 ? 1 : 0} />
}

/** Bars standing in for text lines. */
export const Bar: React.FC<{ x: number, y: number, w: number, h?: number, c?: string, p?: number }> = ({ x, y, w, h = 16, c = look.bar, p = 1 }) =>
  <rect x={x} y={y} width={Math.max(0, w * p)} height={h} rx={h / 2} fill={c} />

/** Four-point AI sparkle. */
export const Sparkle: React.FC<{ x: number, y: number, r?: number, color?: string, rot?: number }> = ({ x, y, r = 22, color = look.blue, rot = 0 }) => (
  <path transform={`translate(${x} ${y}) rotate(${rot})`} fill={color}
    d={`M 0 ${-r} C ${r * 0.14} ${-r * 0.3} ${r * 0.3} ${-r * 0.14} ${r} 0 C ${r * 0.3} ${r * 0.14} ${r * 0.14} ${r * 0.3} 0 ${r} C ${-r * 0.14} ${r * 0.3} ${-r * 0.3} ${r * 0.14} ${-r} 0 C ${-r * 0.3} ${-r * 0.14} ${-r * 0.14} ${-r * 0.3} 0 ${-r} Z`} />
)
