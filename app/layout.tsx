import type { Metadata, Viewport } from 'next'
import { Caveat } from 'next/font/google'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const caveat = Caveat({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-caveat',
})

export const metadata: Metadata = {
  title: 'Grace Seay — Developer & Designer',
  description: 'Full-stack developer and UX designer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={caveat.variable}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ltw5qfn.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
