// Frame-based motion helpers. Everything is a function of the frame, so renders are exact.
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

const ease = Easing.bezier(0.2, 0.8, 0.2, 1)

/** 0 → 1 over `dur` frames starting at `at`, with a soft ease-out. */
export function progress(frame: number, at: number, dur = 14) {
  return interpolate(frame, [at, at + Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease })
}

/** A short settle-in spring: 0 → 1 (overshoots slightly). */
export function useSpring(at: number, damping = 18, stiffness = 170) {
  const frame = useCurrentFrame(), { fps } = useVideoConfig()
  return spring({ frame: frame - at, fps, config: { damping, stiffness, mass: 0.7 } })
}
