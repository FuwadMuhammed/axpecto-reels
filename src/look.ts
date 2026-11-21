// "Search, then and now": premium soft board. Warm white, borderless white cards with soft blue-tinted shadows,
// lavender back cards and chips, one strong blue, ink-black type.
import { loadFont } from '@remotion/google-fonts/PlusJakartaSans'

const { fontFamily } = loadFont('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] })

export const look = {
  bg: '#F6F3EE',
  card: '#FFFFFF',
  ink: '#111216',
  muted: '#8E8C96',
  soft: '#C9C7CE',       // caption words not yet spoken, placeholder bars
  line: '#E6E4EC',
  bar: '#CDCBD8',
  lav: '#E8EBFF',        // chips, tiles
  lavDeep: '#D2D9FF',    // back cards
  blue: '#2F5BFF',
  blueDeep: '#1E3FD9',
  green: '#16A85A',
  red: '#F0525A',
  font: fontFamily,
}

// Reels UI covers the top ~220 px, the bottom ~420 px and the right ~140 px.
export const CAPTION_Y = 1360
