import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Livretto Admin',
  description: 'Painel administrativo do Livretto',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">{children}</body>
    </html>
  )
}
