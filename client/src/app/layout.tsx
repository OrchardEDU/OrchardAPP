import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/theme.css'
import ConditionalLayout from '@/components/ConditionalLayout'
import { ThemeProvider } from '@/contexts/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EggplantEDU - Educational Content Creator',
  description: 'Create lesson plans, projects, and quizzes with AI assistance',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
