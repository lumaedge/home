'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/identity'

export default function WritePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await apiFetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (res.ok) { router.push('/home'); router.refresh() }
    } finally { setSending(false) }
  }

  return (
    <div className="pt-6">
      <h1 className="mb-6 font-serif text-xl text-warm-700">What&apos;s on your mind?</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="There's no wrong way to fill this space..."
          rows={8}
          className="input resize-none text-base leading-relaxed"
          autoFocus
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="btn-ghost">Never mind</button>
          <button type="submit" disabled={!content.trim() || sending} className="btn-primary disabled:opacity-40">
            {sending ? 'Leaving...' : 'Leave here'}
          </button>
        </div>
      </form>
    </div>
  )
}
