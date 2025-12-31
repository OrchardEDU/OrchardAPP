'use client'

import React from 'react'
import Link from 'next/link' // 1. Import Link from next/link
import './Hero.css'

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Transform Your Teaching Materials into <span className="highlight">Unlimited Practice</span>
                    </h1>
                    <p className="hero-subtitle">
                        Upload your lecture slides and test banks. Orchard&apos;s AI generates unlimited multiple-choice questions for your students, grading them instantly.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary btn-lg">Coming Soon</button>
                        <Link href="/demo">
                            <button className="btn btn-secondary btn-lg">Watch Demo</button>
                        </Link>
                    </div>
                </div>
                 <div className="hero-visual">
                    <div className="hero-placeholder">
                        <div className="floating-card card-1">
                            <div className="icon">📚</div>
                            <div className="text">Import Course Content</div>
                        </div>
                        <div className="arrow">➔</div>
                        <div className="floating-card card-2">
                            <div className="icon">✨</div>
                            <div className="text">Generating Questions...</div>
                        </div>
                        <div className="arrow">➔</div>
                        <div className="floating-card card-3">
                            <div className="icon">✅</div>
                            <div className="text">Exam Ready!</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default Hero

