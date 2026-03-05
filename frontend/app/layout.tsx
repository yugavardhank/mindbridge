import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindBridge — Mental Health Support',
  description: 'AI-powered mental health companion for everyone in India',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}