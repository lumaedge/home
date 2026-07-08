// The key is the front door.
// Everyone inside has already been invited.

export interface PersonConfig {
  name: string
  emoji: string
  urlParam: string
}

export const HOME_CONFIG = {
  personalMode: true,
  inviteCode: 'gentle-river',
  person1: { name: 'Lwandile', emoji: '🌿', urlParam: 'lwandile' } as PersonConfig,
  person2: { name: 'Sindiswa', emoji: '🕯️', urlParam: 'sindiswa' } as PersonConfig,
  welcomeNote: "I'm really glad you're here.",
}
