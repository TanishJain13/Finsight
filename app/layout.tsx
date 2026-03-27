import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinSight — Understand Your Money in Seconds',
  description: 'Privacy-first financial analytics. Upload your bank statement and get instant insights, charts, and reports — all processed locally in your browser.',
  keywords: 'finance, bank statement, analytics, privacy, spending tracker',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'FinSight',
    description: 'Understand Your Money in Seconds',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#0f172a] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
