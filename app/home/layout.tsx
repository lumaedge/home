import Nav from '@/components/Nav'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-32 pt-8">
      {children}
      <Nav />
    </div>
  )
}
