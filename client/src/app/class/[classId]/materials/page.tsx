'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  // Mock class data
  const classData = {
    'math101': { title: 'Math 101', subtitle: 'Calculus I', icon: '🧮', students: '24', term: '2024-2025' },
    'science201': { title: 'Science 201', subtitle: 'General Chemistry', icon: '🔬', students: '18', term: '2024-2025' },
    'english101': { title: 'English 101', subtitle: 'Composition', icon: '📚', students: '22', term: '2023-2024' },
    'history150': { title: 'History 150', subtitle: 'World History', icon: '🌍', students: '30', term: '2024-2025' },
    'physics201': { title: 'Physics 201', subtitle: 'Mechanics', icon: '⚡', students: '16', term: '2023-2024' },
    'art101': { title: 'Art 101', subtitle: 'Drawing Fundamentals', icon: '🎨', students: '12', term: '2024-2025' },
    'pe101': { title: 'PE 101', subtitle: 'Physical Education', icon: '🏃', students: '25', term: '2023-2024' },
    'music101': { title: 'Music 101', subtitle: 'Music Theory', icon: '🎵', students: '15', term: '2024-2025' },
    'biology201': { title: 'Biology 201', subtitle: 'Cell Biology', icon: '🧬', students: '28', term: '2023-2024' },
    'psychology101': { title: 'Psychology 101', subtitle: 'Introduction to Psychology', icon: '🧠', students: '32', term: '2024-2025' },
    'economics101': { title: 'Economics 101', subtitle: 'Microeconomics', icon: '💰', students: '20', term: '2023-2024' },
    'computer101': { title: 'Computer Science 101', subtitle: 'Programming Fundamentals', icon: '💻', students: '35', term: '2024-2025' },
    'geography101': { title: 'Geography 101', subtitle: 'World Geography', icon: '🌎', students: '18', term: '2023-2024' },
    'philosophy101': { title: 'Philosophy 101', subtitle: 'Introduction to Philosophy', icon: '🤔', students: '14', term: '2024-2025' },
    'sociology101': { title: 'Sociology 101', subtitle: 'Introduction to Sociology', icon: '👥', students: '26', term: '2023-2024' },
    'statistics101': { title: 'Statistics 101', subtitle: 'Elementary Statistics', icon: '📊', students: '22', term: '2024-2025' },
    'literature101': { title: 'Literature 101', subtitle: 'World Literature', icon: '📖', students: '19', term: '2023-2024' },
    'chemistry201': { title: 'Chemistry 201', subtitle: 'Organic Chemistry', icon: '⚗️', students: '17', term: '2024-2025' }
  }

  const currentClass = classData[classId as keyof typeof classData]

  if (!currentClass) {
    return (
      <div className="page-content">
        <div className="dashboard-layout">
          <div className="error-message">
            <h2>Class not found</h2>
            <p>The requested class could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  // Mock data for course materials
  const courseMaterials = [
    { 
      id: 1, 
      title: 'Chapter 1: Introduction to Calculus', 
      type: 'PDF', 
      size: '2.3 MB', 
      icon: '📄',
      description: 'Introduction to fundamental concepts of calculus including limits, derivatives, and integrals',
      uploadDate: '2024-01-10',
      downloads: 156,
      category: 'Textbook',
      author: 'Dr. Smith'
    },
    { 
      id: 2, 
      title: 'Lecture Slides - Week 1: Limits', 
      type: 'PPTX', 
      size: '5.1 MB', 
      icon: '📊',
      description: 'PowerPoint presentation covering limit concepts, properties, and calculation methods',
      uploadDate: '2024-01-08',
      downloads: 203,
      category: 'Lecture',
      author: 'Dr. Smith'
    },
    { 
      id: 3, 
      title: 'Assignment Template - Problem Sets', 
      type: 'DOCX', 
      size: '1.2 MB', 
      icon: '📝',
      description: 'Template for submitting homework assignments with proper formatting guidelines',
      uploadDate: '2024-01-05',
      downloads: 189,
      category: 'Template',
      author: 'Dr. Smith'
    },
    { 
      id: 4, 
      title: 'Video: Basic Derivative Concepts', 
      type: 'MP4', 
      size: '45.2 MB', 
      icon: '🎥',
      description: 'Recorded lecture video explaining derivative concepts with visual examples',
      uploadDate: '2024-01-12',
      downloads: 167,
      category: 'Video',
      author: 'Dr. Smith'
    },
    { 
      id: 5, 
      title: 'Practice Problems - Derivatives', 
      type: 'PDF', 
      size: '3.8 MB', 
      icon: '📚',
      description: 'Collection of practice problems with step-by-step solutions for derivative calculations',
      uploadDate: '2024-01-15',
      downloads: 234,
      category: 'Practice',
      author: 'Dr. Smith'
    },
    { 
      id: 6, 
      title: 'Formula Sheet - Calculus Rules', 
      type: 'PDF', 
      size: '0.8 MB', 
      icon: '📋',
      description: 'Quick reference sheet with all essential calculus formulas and rules',
      uploadDate: '2024-01-03',
      downloads: 278,
      category: 'Reference',
      author: 'Dr. Smith'
    },
    { 
      id: 7, 
      title: 'Interactive Calculator Tool', 
      type: 'HTML', 
      size: '2.1 MB', 
      icon: '🧮',
      description: 'Interactive web-based calculator for practicing derivative and integral calculations',
      uploadDate: '2024-01-18',
      downloads: 145,
      category: 'Tool',
      author: 'Dr. Smith'
    },
    { 
      id: 8, 
      title: 'Study Guide - Midterm Preparation', 
      type: 'PDF', 
      size: '4.2 MB', 
      icon: '📖',
      description: 'Comprehensive study guide covering all topics for the upcoming midterm examination',
      uploadDate: '2024-01-20',
      downloads: 198,
      category: 'Study Guide',
      author: 'Dr. Smith'
    }
  ]

  const handleBackToClass = () => {
    router.push(`/class/${classId}`)
  }

  return (
    <div className="page-content">
      <div className="dashboard-layout">
        {/* Left Activity Feed - Filtered by Class */}
        <div className="activity-feed">
          <div className="activity-header">
            <h3>Recent Activity - {currentClass.title}</h3>
          </div>
          <div className="activity-content">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <div className="activity-title">Quiz Submitted</div>
                <div className="activity-subtitle">{currentClass.title} - Derivatives Quiz</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-details">
                <div className="activity-title">Grades Updated</div>
                <div className="activity-subtitle">{currentClass.title} - Homework 1</div>
                <div className="activity-time">4 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👥</div>
              <div className="activity-details">
                <div className="activity-title">New Student Joined</div>
                <div className="activity-subtitle">{currentClass.title} - John Doe</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="class-main">
          <div className="class-header">
            <div className="class-info">
              <button className="back-button" onClick={handleBackToClass}>
                ←
              </button>
              <div className="class-icon-large">{currentClass.icon}</div>
              <div className="class-details">
                <h2>Course Materials - {currentClass.title}</h2>
                <p className="class-subtitle">{currentClass.subtitle}</p>
                <div className="class-meta">
                  <span className="class-term">{currentClass.term}</span>
                  <span className="class-students">{currentClass.students} students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="class-content">
            <div className="materials-detailed-grid">
              {courseMaterials.map((material) => (
                <div key={material.id} className="material-detailed-card">
                  <div className="material-card-header">
                    <div className="material-icon-large">{material.icon}</div>
                    <div className="material-card-info">
                      <h3 className="material-title-large">{material.title}</h3>
                      <div className="material-type-badge">{material.type}</div>
                      <div className="material-category">{material.category}</div>
                    </div>
                  </div>
                  <div className="material-card-content">
                    <p className="material-description">{material.description}</p>
                    <div className="material-stats">
                      <div className="material-stat-item">
                        <span className="stat-label">Size:</span>
                        <span className="stat-value">{material.size}</span>
                      </div>
                      <div className="material-stat-item">
                        <span className="stat-label">Upload Date:</span>
                        <span className="stat-value">{material.uploadDate}</span>
                      </div>
                      <div className="material-stat-item">
                        <span className="stat-label">Downloads:</span>
                        <span className="stat-value">{material.downloads}</span>
                      </div>
                      <div className="material-stat-item">
                        <span className="stat-label">Author:</span>
                        <span className="stat-value">{material.author}</span>
                      </div>
                    </div>
                    <div className="material-actions">
                      <button className="download-btn">📥 Download</button>
                      <button className="preview-btn">👁️ Preview</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
