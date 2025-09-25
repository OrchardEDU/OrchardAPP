'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [isCircleDisappearing, setIsCircleDisappearing] = useState(false)
  const [currentTitle, setCurrentTitle] = useState('Dashboard')
  const [isTitleChanging, setIsTitleChanging] = useState(false)

  const handleLogoClick = () => {
    router.push('/')
  }

  // Update title based on current path
  useEffect(() => {
    const getPageTitle = (path: string) => {
      switch (path) {
        case '/':
          return 'Dashboard'
        case '/lesson-plan':
          return 'Assignment'
        case '/generate-project':
          return 'Project'
        case '/multiple-choice-quiz':
          return 'Quiz'
        case '/open-ended-quiz':
          return 'Test'
        default:
          return 'Dashboard'
      }
    }
    
    const newTitle = getPageTitle(pathname)
    if (newTitle !== currentTitle) {
      setIsTitleChanging(true)
      setTimeout(() => {
        setCurrentTitle(newTitle)
        setIsTitleChanging(false)
      }, 150) // Half of animation duration for smooth transition
    }
  }, [pathname, currentTitle])

  const handleSidebarToggle = () => {
    if (isSidebarMinimized) {
      // Expanding sidebar, hide circle immediately
      setIsSidebarMinimized(false)
    } else {
      // Collapsing sidebar, show circle with animation
      setIsSidebarMinimized(true)
    }
    
    // Dispatch custom event to notify sidebar of state change
    const event = new CustomEvent('headerSidebarToggle', {
      detail: { isMinimized: !isSidebarMinimized }
    })
    window.dispatchEvent(event)
  }

  // Listen for sidebar state changes from the ChatbotSidebar component
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      const newMinimizedState = event.detail.isMinimized
      if (newMinimizedState && !isSidebarMinimized) {
        // Sidebar is collapsing, start circle disappearance animation
        setIsCircleDisappearing(true)
        setTimeout(() => {
          setIsSidebarMinimized(true)
          setIsCircleDisappearing(false)
        }, 300)
      } else {
        setIsSidebarMinimized(newMinimizedState)
      }
    }

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
    }
  }, [isSidebarMinimized])

  return (
    <div className="dashboard-header">
      <div className="logo-section" onClick={handleLogoClick}>
        <div className="logo-placeholder">🍆</div>
        <span className="service-name">EggplantEDU</span>
      </div>
      <h1 className={`page-title ${isTitleChanging ? 'changing' : ''}`}>{currentTitle}</h1>
      <div className="account-section">
        <div className="account-settings">
          <div className="profile-picture">
            <div className="profile-placeholder">👤</div>
          </div>
          <div className="account-info">
            <span className="account-name">John Doe</span>
            <span className="account-role">Teacher</span>
          </div>
        </div>
        {isSidebarMinimized && (
          <div className={`minimized-circle ${isCircleDisappearing ? 'disappearing' : ''}`} onClick={handleSidebarToggle}>
            <span className="minimized-icon">💬</span>
          </div>
        )}
      </div>
    </div>
  )
}
