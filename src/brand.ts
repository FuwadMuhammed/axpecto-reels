// The channel's identity lives in brand/brand.json. Code reads it only through here.
import raw from '../brand/brand.json'

export interface Brand {
  name: string
  url: string            // shown on every end card
  series: string
  hashtag: string        // required in every post
  pitch: string
  audience: string
  product: string        // what the product does: the only claims the writer may make about it
  voice: { name: string, speed: number }
  pronounce: Record<string, string>  // spelling for the voice only; captions keep the real word
  timezone: { label: string, offsetMinutes: number }
  slots: string[]        // HH:MM reel times in that timezone (scripts/slot.mjs)
  days: string[]         // weekdays with a reel: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  account: string        // name shown on carousels and stories
  extras: { storyAfterHours: number, postAfterHours: number } // when each reel's story and carousel go out
}

export const BRAND = raw as Brand
