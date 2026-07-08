'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EntryForm() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (res.ok) {
        router.push('/home')
        router.refresh()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={8}
          className="input resize-none text-base leading-relaxed"
          autoFocus
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Never mind
        </button>
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="btn-primary disabled:opacity-40"
        >
          {sending ? 'Leaving...' : 'Leave here'}
        </button>
      </div>
    </form>
  )
}
