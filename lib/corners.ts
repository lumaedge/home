export interface CornerDef {
  icon: string
  name: string
  description: string
  keywords: string[]
}

export const ROOMS: CornerDef[] = [
  { icon: '☀️', name: 'Good Days', description: 'Light worth remembering', keywords: ['happy', 'grateful', 'joy', 'beautiful', 'wonderful', 'smile', 'love', 'loved', 'glad', 'blessed', 'laugh'] },
  { icon: '🌧', name: 'Hard Days', description: 'A safe place for the heavy moments', keywords: ['hard', 'sad', 'heavy', 'tired', 'difficult', 'struggle', 'pain', 'hurt', 'lonely', 'afraid', 'cry', 'exhausted', 'overwhelmed', 'anxious'] },
  { icon: '🌊', name: 'The Beach', description: 'Water, waves, and wide skies', keywords: ['beach', 'sea', 'ocean', 'sand', 'wave', 'water', 'shore', 'coast', 'tide', 'swim'] },
  { icon: '📚', name: 'Bookstore', description: 'Pages that stayed with you', keywords: ['book', 'read', 'story', 'page', 'chapter', 'library', 'novel', 'poem', 'reading', 'author'] },
  { icon: '🎵', name: 'Songs', description: 'Music that moved something', keywords: ['song', 'music', 'sing', 'listen', 'melody', 'sound', 'album', 'guitar', 'piano', 'lyrics', 'concert'] },
  { icon: '💭', name: 'Dreams', description: 'What the heart reaches for', keywords: ['dream', 'dreamt', 'dreaming', 'sleep', 'night', 'asleep', 'woke'] },
  { icon: '🌄', name: 'Future', description: 'A place for what could be', keywords: ['future', 'hope', 'wish', 'someday', 'one day', 'imagine', 'maybe', 'soon', 'waiting'] },
]

export function matchRoom(content: string): string[] {
  const lower = content.toLowerCase()
  const matched: string[] = []
  for (const room of ROOMS) {
    for (const kw of room.keywords) {
      if (lower.includes(kw)) {
        matched.push(room.name)
        break
      }
    }
  }
  return matched
}
