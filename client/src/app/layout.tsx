import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ChatbotSidebar from '@/components/ChatbotSidebar'
import DashboardHeader from '@/components/DashboardHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EggplantEDU - Educational Content Creator',
  description: 'Create lesson plans, projects, and quizzes with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app">
          <div className="main-content">
            <DashboardHeader />
            {children}
          </div>
          <ChatbotSidebar />
        </div>
      </body>
    </html>
  )
}
