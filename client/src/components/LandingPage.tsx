'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ClientThemeToggle from './ClientThemeToggle'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-navbar">
        <div className="navbar-container">  
          <div className="navbar-brand">
            <Image src="/logo.png" alt="EggplantEDU Logo" className="navbar-logo" width={40} height={40} />
            <div className="navbar-name">EggplantEDU</div>
          </div>
          <div className="navbar-links">
            <a href="#about" className="navbar-link">About</a>
            <ClientThemeToggle />
            <button className="navbar-button" onClick={handleGetStarted}>Get Started</button>
            <button className="navbar-button login-button">Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-name">EggplantEDU</span>
            </h1>
            <p className="hero-subtitle">
              Create engaging lesson plans, interactive projects, and comprehensive quizzes with AI assistance. 
              Transform your teaching experience with intelligent content generation.
            </p>
            <div className="hero-actions">
              <button className="cta-button primary" onClick={handleGetStarted}>
                Get Started
              </button>
              <button className="cta-button secondary">
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-icon">🎓</div>
              <div className="card-title">Smart Education</div>
              <div className="card-description">AI-powered content creation for modern educators</div>
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

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Educators</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50,000+</div>
            <div className="stat-label">Lessons Created</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">AI Support</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to transform your teaching?</h2>
          <p className="cta-description">
            Join thousands of educators who are already creating better content with AI assistance.
          </p>
          <button className="cta-button primary large" onClick={handleGetStarted}>
            Start Creating Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Image src="/logo.png" alt="EggplantEDU Logo" className="footer-logo" width={32} height={32} />
              <div className="footer-name">EggplantEDU</div>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Tutorials</a>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">Community</a>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EggplantEDU. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
