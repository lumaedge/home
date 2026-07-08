'use client'

const HOME_ID_KEY = 'home_id'
const PERSON_KEY = 'person_name'

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
