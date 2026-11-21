// Characters, drawn in SVG with soft shading and animated from the frame number alone.
//   <Avatar/>  an original memoji-style bust: blinks, breathes, tilts, looks around, six expressions
//   <Crawler/> the search crawler: a glossy little spider-legged bot with an antenna and a magnifying glass
// Both use gradients from <Defs/> in premium.tsx.
import React from 'react'
import { useCurrentFrame } from 'remotion'
import { look } from './look'

export type Expr = 'smile' | 'happy' | 'surprised' | 'puzzled' | 'think' | 'wink'

/** (x, y) = bottom centre of the bust; at s = 1 it is ~350 wide and ~400 tall. */
export const Avatar: React.FC<{
  x: number, y: number, s?: number, expr?: Expr, gaze?: [number, number], tilt?: number, variant?: 'a' | 'b', seed?: number, hood?: 'blue' | 'lav', still?: boolean,
}> = ({ x, y, s = 1, expr = 'smile', gaze = [0, 0], tilt = 0, variant = 'a', seed = 0, hood = 'blue', still = false }) => {
  const f = useCurrentFrame() + seed * 41
  const breathe = Math.sin(f / 16) * 3
  const sway = Math.sin(f / 23) * 2.2 + tilt
  const blinkT = f % 110
  const blink = still ? 1 : blinkT < 3 ? 0.1 : blinkT < 5 ? 0.5 : 1
  const skin = `url(#skin${variant.toUpperCase()})`, hair = `url(#hair${variant.toUpperCase()})`
  const [gx, gy] = expr === 'think' ? [0.7, -0.8] : gaze
  const brow = { smile: 0, happy: -6, surprised: -16, puzzled: 0, think: -4, wink: -4 }[expr]
  const browTilt = expr === 'puzzled' ? 9 : 0
  const eye = (cx: number, closed: boolean) => (
    <g transform={`translate(${cx} -246)`}>
      {closed ? (
        <path d="M -20 2 Q 0 -14 20 2" fill="none" stroke="#2A1A13" strokeWidth={7} strokeLinecap="round" />
      ) : (
        <g transform={`scale(1 ${blink * (expr === 'surprised' ? 1.12 : expr === 'happy' ? 0.82 : 1)})`}>
          <ellipse rx={25} ry={29} fill="#FFFFFF" />
          <circle cx={gx * 8} cy={gy * 8 + 3} r={17} fill="url(#iris)" />
          <circle cx={gx * 8} cy={gy * 8 + 3} r={8.5} fill="#120A06" />
          <circle cx={gx * 8 - 6} cy={gy * 8 - 4} r={5.5} fill="#FFFFFF" />
          <circle cx={gx * 8 + 6} cy={gy * 8 + 8} r={2.4} fill="#FFFFFF" opacity={0.8} />
        </g>
      )}
    </g>
  )
  const mouth = () => {
    switch (expr) {
      case 'happy': return (<g transform="translate(0 -186)">
        <path d="M -46 -8 Q 0 54 46 -8 Q 0 6 -46 -8 Z" fill="#6B1E22" />
        <path d="M -40 -4 Q 0 8 40 -4 L 36 6 Q 0 16 -36 6 Z" fill="#FFFFFF" />
        <ellipse cx={0} cy={26} rx={18} ry={8} fill="#E2626A" />
      </g>)
      case 'surprised': return <ellipse cx={0} cy={-178} rx={17} ry={22} fill="#6B1E22" />
      case 'puzzled': return <path d="M -30 -180 Q -14 -192 0 -182 Q 14 -172 30 -186" fill="none" stroke="#7A2A2A" strokeWidth={8} strokeLinecap="round" />
      case 'think': return <path d="M -18 -182 Q 8 -176 30 -192" fill="none" stroke="#7A2A2A" strokeWidth={8} strokeLinecap="round" />
      default: return (<g transform="translate(0 -188)">
        <path d="M -38 -4 Q 0 38 38 -4 Q 0 8 -38 -4 Z" fill="#6B1E22" />
        <path d="M -32 -1 Q 0 9 32 -1 L 29 6 Q 0 13 -29 6 Z" fill="#FFFFFF" />
      </g>)
    }
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={150} ry={14} fill="#1E2A66" opacity={0.08} />
      {/* hoodie */}
      <g transform={`translate(0 ${breathe * 0.4})`}>
        <path d="M -178 0 C -178 -84 -126 -118 -62 -126 L 62 -126 C 126 -118 178 -84 178 0 Z" fill={`url(#hood${hood === 'blue' ? 'Blue' : 'Lav'})`} />
        <path d="M -70 -126 C -54 -82 54 -82 70 -126" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={10} strokeLinecap="round" />
        <path d="M -30 -96 L -36 -40 M 30 -96 L 36 -40" stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" />
      </g>
      <g transform={`translate(0 ${breathe}) rotate(${sway} 0 -140)`}>
        <rect x={-38} y={-168} width={76} height={60} rx={18} fill={`url(#neck${variant.toUpperCase()})`} />
        {/* ears */}
        <ellipse cx={-110} cy={-236} rx={22} ry={30} fill={skin} />
        <ellipse cx={110} cy={-236} rx={22} ry={30} fill={skin} />
        {/* head */}
        <ellipse cx={0} cy={-246} rx={112} ry={126} fill={skin} />
        <ellipse cx={0} cy={-246} rx={112} ry={126} fill="url(#faceShade)" />
        <ellipse cx={-28} cy={-312} rx={44} ry={16} fill="#FFFFFF" opacity={0.28} />
        <ellipse cx={-60} cy={-200} rx={30} ry={18} fill="url(#blush)" />
        <ellipse cx={60} cy={-200} rx={30} ry={18} fill="url(#blush)" />
        {/* hair */}
        {variant === 'a' ? (
          <>
            <path d="M -122 -238 C -134 -348 -54 -402 18 -394 C 104 -388 140 -330 120 -246 C 112 -290 84 -318 44 -322 C 18 -300 -36 -296 -78 -300 C -100 -296 -114 -272 -122 -238 Z" fill={hair} />
            <path d="M -96 -300 C -70 -350 10 -356 58 -318 C 30 -330 -10 -318 -34 -296 C -52 -300 -78 -300 -96 -300 Z" fill={hair} />
            <path d="M -40 -372 C 0 -386 50 -380 80 -356" fill="none" stroke="#FFFFFF" strokeOpacity={0.22} strokeWidth={10} strokeLinecap="round" />
            <path d="M -60 -350 C -30 -366 10 -366 36 -352" fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={7} strokeLinecap="round" />
          </>
        ) : (
          <>
            {[[-90, -330, 46], [-40, -366, 52], [20, -372, 54], [76, -346, 48], [106, -296, 36], [-112, -284, 34]].map(([cx, cy, r], i) =>
              <circle key={i} cx={cx} cy={cy} r={r} fill={hair} />)}
            <path d="M -110 -268 C -90 -320 80 -330 112 -266 C 80 -300 -60 -306 -110 -268 Z" fill={hair} />
          </>
        )}
        {/* brows */}
        <g transform={`translate(0 ${brow})`} stroke={variant === 'a' ? '#3A2418' : '#141218'} strokeWidth={11} strokeLinecap="round" fill="none">
          <path d={`M -66 ${-292 + browTilt} Q -44 -304 -20 ${-294 - browTilt * 0.4}`} />
          <path d={`M 20 ${-294 + browTilt * 0.4} Q 44 -304 66 ${-292 - browTilt}`} />
        </g>
        {eye(-42, false)}
        {eye(42, expr === 'wink')}
        {/* nose */}
        <path d="M -10 -214 Q 0 -204 10 -214" fill="none" stroke="#C07A52" strokeWidth={6} strokeLinecap="round" />
        {mouth()}
      </g>
    </g>
  )
}

/** The crawler. `lens` = where its magnifying glass is, relative to the bot (null hides it). */
export const Crawler: React.FC<{ x: number, y: number, s?: number, lens?: { x: number, y: number } | null, walking?: boolean, flip?: boolean, lensR?: number, still?: boolean }> = ({
  x, y, s = 1, lens = { x: -110, y: -150 }, walking = false, flip = false, lensR = 46, still = false,
}) => {
  const f = useCurrentFrame()
  const step = walking ? Math.sin(f / 2.6) : Math.sin(f / 18) * 0.25
  const hover = Math.sin(f / 11) * 4
  const scan = (Math.sin(f / 16) + 1) / 2
  const blink = still || f % 120 >= 5 ? 1 : 0.15
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={90} ry={12} fill="#1E2A66" opacity={0.1} />
      {[-48, -16, 16, 48].map((lx, i) => {
        const a = (i % 2 ? 1 : -1) * step * 12
        return <path key={i} d={`M ${lx * 0.6} -70 Q ${lx * 1.4} ${-60 + a} ${lx * 1.7 + a} 0`} fill="none" stroke="#2A2E40" strokeWidth={9} strokeLinecap="round" />
      })}
      <g transform={`translate(0 ${hover})`}>
        <path d={`M 0 -168 Q ${6 + step * 4} -196 ${2 + step * 6} -214`} fill="none" stroke="#2A2E40" strokeWidth={6} strokeLinecap="round" />
        <circle cx={2 + step * 6} cy={-222} r={13} fill="url(#botBall)" />
        <rect x={-80} y={-172} width={160} height={116} rx={40} fill="url(#botBody)" filter="url(#softSm)" />
        <rect x={-58} y={-152} width={116} height={66} rx={22} fill="url(#botScreen)" />
        <g transform={`translate(${(scan - 0.5) * 16} 0)`} filter="url(#glow)">
          <rect x={-34} y={-131} width={18} height={24 * blink} rx={8} fill="#7CF0FF" />
          <rect x={16} y={-131} width={18} height={24 * blink} rx={8} fill="#7CF0FF" />
        </g>
        <path d="M -60 -162 Q -20 -170 30 -166" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.9} />
        {lens && (
          <>
            <path d={`M -72 -110 Q ${lens.x * 0.5 - 40} ${(lens.y - 110) / 2 - 10} ${lens.x + lensR * 0.66} ${lens.y + lensR * 0.66}`} fill="none" stroke="#2A2E40" strokeWidth={10} strokeLinecap="round" />
            <circle cx={lens.x} cy={lens.y} r={lensR} fill="url(#glass)" stroke="#2A2E40" strokeWidth={10} />
          </>
        )}
      </g>
    </g>
  )
}

/** A soft white bubble with a mark ("?", "!") that pops above a character. */
export const Thought: React.FC<{ x: number, y: number, mark: string, p: number }> = ({ x, y, mark, p }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`} opacity={Math.min(1, p * 2)}>
    <circle r={46} fill={look.card} filter="url(#softSm)" />
    <text y={20} textAnchor="middle" style={{ fontFamily: look.font, fontWeight: 800, fontSize: 56 }} fill={look.blue}>{mark}</text>
  </g>
)
