'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ClientThemeToggle from './ClientThemeToggle'

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="navbar-container">  
          <div 
            className="navbar-brand" 
            onClick={scrollToTop} 
            role="button" 
            tabIndex={0} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                scrollToTop(e)
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <Image 
              src="/oedutemplogo.png" 
              alt="OrchardEDU Logo" 
              className="navbar-logo" 
              width={40} 
              height={40}
              style={{ pointerEvents: 'none' }}
            />
            <div className="navbar-name" style={{ pointerEvents: 'none' }}>OrchardEDU</div>
          </div>
          <div className="navbar-links">
            <a href="#about" className="navbar-link" onClick={(e) => {
              e.preventDefault()
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
            }}>About</a>
            <ClientThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-name">OrchardEDU</span>
            </h1>
            <p className="hero-subtitle">
              Create engaging lesson plans, interactive projects, and comprehensive quizzes with AI assistance. 
              Transform your teaching experience with intelligent content generation.
            </p>
            <div className="coming-soon-badge">
              <span className="coming-soon-text">Coming Soon</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-container">
              <Image 
                src="/classroom.jpg" 
                alt="OrchardEDU Hero" 
                className="hero-image"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="about" className="features-section">
        <div className="features-container">
          <h2 className="features-title">Everything you need to create amazing educational content</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">Lesson Plans</h3>
              <p className="feature-description">
                Generate comprehensive lesson plans with learning objectives, activities, and assessments tailored to your curriculum.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Interactive Projects</h3>
              <p className="feature-description">
                Create engaging hands-on projects that encourage student participation and real-world application of concepts.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Smart Quizzes</h3>
              <p className="feature-description">
                Build multiple-choice and open-ended quizzes with automatic grading and detailed analytics.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Assistant</h3>
              <p className="feature-description">
                Get instant help with content creation, curriculum planning, and educational best practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Image src="/oedutemplogo.png" alt="OrchardEDU Logo" className="footer-logo" width={32} height={32} />
              <div className="footer-name">OrchardEDU</div>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Contact</h4>
                <a href="mailto:support@orchardedu.com">Email Us</a>
                <a href="#about" onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                }}>About</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 OrchardEDU. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top" 
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  )
}
