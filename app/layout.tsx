import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Home',
  description: 'A quiet, shared space for two people to grow closer over time.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
