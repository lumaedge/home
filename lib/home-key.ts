const adjectives = [
  'warm', 'quiet', 'gentle', 'soft', 'calm', 'deep', 'slow', 'sweet',
  'tender', 'golden', 'silver', 'misty', 'dusky', 'hazel', 'amber',
  'cedar', 'sable', 'russet', 'dewy', 'pale', 'cozy', 'faint', 'mellow',
  'serene', 'still', 'sunlit', 'velvet', 'woven', 'wild', 'blooming',
  'candlelit', 'dappled', 'fallen', 'floating', 'hidden', 'kind', 'lunar',
  'quiet', 'rustic', 'salted',
]

const nouns = [
  'ocean', 'forest', 'river', 'meadow', 'valley', 'garden', 'harbor',
  'lantern', 'feather', 'willow', 'ember', 'breeze', 'stone', 'cloud',
  'tide', 'pine', 'star', 'moon', 'bloom', 'trail', 'cove', 'creek',
  'dawn', 'dew', 'dune', 'field', 'flame', 'gate', 'glade', 'glow',
  'haven', 'haze', 'island', 'ivy', 'lily', 'mist', 'nest', 'oak',
  'reed', 'ridge',
]

export function generateHomeKey(): string {
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `${a}-${n}`
}

export function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '-')
}
