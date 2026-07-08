const SENTENCES = [
  "You're welcome here.",
  "Small moments matter.",
  "Thank you for bringing yourself today.",
  "Rest is welcome too.",
  "Nothing here needs to be perfect.",
  "Even quiet days belong.",
  "You don't have to have the right words.",
  "Being here is enough.",
  "Some thoughts just need a place to land.",
  "There is no wrong way to arrive.",
  "Whatever today looked like, you made it.",
  "Silence is not emptiness.",
  "You are not behind.",
  "This space is yours.",
  "Some love looks like showing up quietly.",
  "Not every thought needs an answer.",
  "You can stay as long as you like.",
  "There's nothing you need to prove here.",
  "Even half-formed thoughts belong.",
  "Come as you are.",
]

export function getDailySentence(): string {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime()
  const dayOfYear = Math.floor((Date.now() - start) / 86400000)
  return SENTENCES[dayOfYear % SENTENCES.length]
}
