import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ThreadFire – Share & Discuss',
  description: 'A Reddit-style community platform built with Next.js and FastAPI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <AuthProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-6">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#27272a',
                color: '#f4f4f5',
                border: '1px solid #3f3f46',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
