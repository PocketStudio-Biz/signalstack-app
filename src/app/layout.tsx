import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SignalStack - B2B Lead Intent Monitoring',
  description: 'Intent data that doesn\'t cost $60K/year',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}