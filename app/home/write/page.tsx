'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getLight() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { icon: '🌅', label: 'morning light' }
  if (h >= 12 && h < 17) return { icon: '☀️', label: 'afternoon sun' }
  if (h >= 17 && h < 21) return { icon: '🕯️', label: 'evening glow' }
  return { icon: '🌙', label: 'night' }
}

export default function WritePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const light = getLight()

  useEffect(() => { textareaRef.current?.focus() }, [])

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
      if (res.ok) { router.push('/home'); router.refresh() }
    } finally { setSending(false) }
  }

  return (
    <div className="pt-6">
      <div className="mb-6 flex items-center gap-2 text-xs text-warm-400">
        <span>{light.icon}</span>
        <span className="italic">{light.label}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-white/90 shadow-[0_1px_6px_rgba(168,115,70,0.08)]">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="There's no wrong way to fill this space..."
            rows={10}
            className="w-full resize-none bg-transparent px-6 py-5 text-base leading-relaxed text-warm-800 placeholder:text-warm-300/60 focus:outline-none"
          />
        </div>
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
