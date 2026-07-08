export interface PersonConfig {
  name: string
  emoji: string
}

export const HOME_CONFIG = {
  personalMode: true,
  inviteCode: 'gentle-river',
  person1: { name: 'Lwandile', emoji: '🌿' } as PersonConfig,
  person2: { name: 'Sindiswa', emoji: '🕯️' } as PersonConfig,
  welcomeNote: "I'm really glad you're here.",
}
