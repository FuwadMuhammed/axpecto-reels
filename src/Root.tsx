import React from 'react'
import { Composition, staticFile } from 'remotion'
import example from '../brand/example-reel.json'
import { Reel } from './Reel'
import { Carousel, Story } from './Stills'
import { FPS } from './timing'
import type { Reel as ReelData, Timing } from './types'

type Props = { id: string, reel: ReelData, timing: Timing | null }

// One composition. scripts/make.ts passes { id, reel } as props; timing comes from public/runs/<id>/timing.json.
export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel as unknown as React.FC<Props>} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 60}
    defaultProps={{ id: 'example-reel', reel: example as unknown as ReelData, timing: null } as Props}
    calculateMetadata={async ({ props }) => {
      const res = await fetch(staticFile(`runs/${props.id}/timing.json`))
      if (!res.ok) throw new Error(`public/runs/${props.id}/timing.json is missing: run tools/voice.py on this reel first`)
      const timing: Timing = await res.json()
      return { durationInFrames: Math.round(timing.duration * FPS), props: { ...props, timing } }
    }} />
    <Composition id="Carousel" component={Carousel as unknown as React.FC<Props>} width={1080} height={1350} fps={FPS} durationInFrames={6}
      defaultProps={{ id: 'example-reel', reel: example as unknown as ReelData, timing: null } as Props}
      calculateMetadata={({ props }) => ({ durationInFrames: props.reel.carousel.slides.length + 2 })} />
    <Composition id="Story" component={Story as unknown as React.FC<Props>} width={1080} height={1920} fps={FPS} durationInFrames={1}
      defaultProps={{ id: 'example-reel', reel: example as unknown as ReelData, timing: null } as Props} />
  </>
)
