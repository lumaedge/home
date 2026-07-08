export interface CornerDef {
  icon: string
  name: string
  description: string
  keywords: string[]
}

export const ROOMS: CornerDef[] = [
  {
    icon: '☀️', name: 'Good Days',
    description: 'Light worth remembering.\nSome moments arrive like sunlight through a window.\nYou don\'t have to hold them tight.\nJust let them warm you.',
    keywords: ['happy', 'grateful', 'joy', 'beautiful', 'wonderful', 'smile', 'love', 'loved', 'glad', 'blessed', 'laugh'],
  },
  {
    icon: '🌧', name: 'Hard Days',
    description: 'A safe place for the heavy moments.\nSome days ask more of us than we expected.\nWhatever brought you here today...\nYou don\'t have to carry it alone.',
    keywords: ['hard', 'sad', 'heavy', 'tired', 'difficult', 'struggle', 'pain', 'hurt', 'lonely', 'afraid', 'cry', 'exhausted', 'overwhelmed', 'anxious'],
  },
  {
    icon: '🌊', name: 'The Beach',
    description: 'Water, waves, and wide skies.\nThe tide doesn\'t rush.\nIt returns when it\'s ready.\nYou can breathe here.',
    keywords: ['beach', 'sea', 'ocean', 'sand', 'wave', 'water', 'shore', 'coast', 'tide', 'swim'],
  },
  {
    icon: '📚', name: 'Bookstore',
    description: 'Pages that stayed with you.\nSome sentences find you at the right time.\nThey sit with you long after\nthe last page is closed.',
    keywords: ['book', 'read', 'story', 'page', 'chapter', 'library', 'novel', 'poem', 'reading', 'author'],
  },
  {
    icon: '🎵', name: 'Songs',
    description: 'Music that moved something.\nA melody can hold what words cannot.\nThese are the songs that found you\nwhen you needed them.',
    keywords: ['song', 'music', 'sing', 'listen', 'melody', 'sound', 'album', 'guitar', 'piano', 'lyrics', 'concert'],
  },
  {
    icon: '💭', name: 'Dreams',
    description: 'What the heart reaches for.\nIn sleep, the mind wanders where\nthe day would not take it.\nThese are the places it found.',
    keywords: ['dream', 'dreamt', 'dreaming', 'sleep', 'night', 'asleep', 'woke'],
  },
  {
    icon: '🌄', name: 'Future',
    description: 'A place for what could be.\nNot yet written.\nNot yet lived.\nBut already hoped for.',
    keywords: ['future', 'hope', 'wish', 'someday', 'one day', 'imagine', 'maybe', 'soon', 'waiting'],
  },
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
