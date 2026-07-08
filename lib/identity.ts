'use client'

import { HOME_CONFIG, PersonConfig } from './home-config'

const HOME_ID_KEY = 'home_id'
const PERSON_KEY = 'person_name'
const PERSON_EMOJI_KEY = 'person_emoji'

export function saveIdentity(homeId: string, name: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HOME_ID_KEY, homeId)
  localStorage.setItem(PERSON_KEY, name)
}

export function loadIdentity(): { homeId: string | null; name: string | null } {
  if (typeof window === 'undefined') return { homeId: null, name: null }
  return {
    homeId: localStorage.getItem(HOME_ID_KEY),
    name: localStorage.getItem(PERSON_KEY),
  }
}

export function clearIdentity() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HOME_ID_KEY)
  localStorage.removeItem(PERSON_KEY)
  localStorage.removeItem(PERSON_EMOJI_KEY)
}

export function setPerson(person: PersonConfig) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PERSON_KEY, person.name)
  localStorage.setItem(PERSON_EMOJI_KEY, person.emoji)
  if (HOME_CONFIG.personalMode) {
    localStorage.setItem(HOME_ID_KEY, HOME_CONFIG.inviteCode)
  }
}

export function getPersonEmoji(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PERSON_EMOJI_KEY)
}

export function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  return !localStorage.getItem(PERSON_KEY)
}

export function identifyFromUrl(): boolean {
  if (typeof window === 'undefined') return false
  if (localStorage.getItem(PERSON_KEY)) return false
  const params = new URLSearchParams(window.location.search)
  const forParam = params.get('for')
  if (forParam === HOME_CONFIG.person2.urlParam) {
    setPerson(HOME_CONFIG.person2)
  } else if (forParam === HOME_CONFIG.person1.urlParam) {
    setPerson(HOME_CONFIG.person1)
  } else {
    setPerson(HOME_CONFIG.person1)
  }
  return true
}

export function getOtherPerson(): PersonConfig | null {
  const myName = localStorage.getItem(PERSON_KEY)
  if (!myName) return null
  if (myName === HOME_CONFIG.person1.name) return HOME_CONFIG.person2
  if (myName === HOME_CONFIG.person2.name) return HOME_CONFIG.person1
  return null
}

export function getPersonLabel(name: string): string {
  const myName = localStorage.getItem(PERSON_KEY)
  if (!myName) return name
  if (name === myName) return 'You'
  return 'Us'
}

export async function apiFetch(path: string, options?: RequestInit) {
  const { homeId, name } = loadIdentity()
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  }
  if (homeId) headers['x-home-id'] = homeId
  if (name) headers['x-person-name'] = name
  return fetch(path, { ...options, headers })
}
