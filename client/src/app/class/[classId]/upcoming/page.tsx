'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function UpcomingPage() {
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

  // Mock data for upcoming events
  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Quiz: Derivatives', 
      date: 'Tomorrow', 
      type: 'quiz', 
      icon: '📝',
      description: 'A comprehensive quiz covering derivative rules and applications',
      duration: '45 minutes',
      points: '50 points',
      status: 'upcoming'
    },
    { 
      id: 2, 
      title: 'Assignment: Integration Problems', 
      date: 'Next Monday', 
      type: 'assignment', 
      icon: '📋',
      description: 'Complete integration problems from chapters 4-6',
      duration: '2 hours',
      points: '100 points',
      status: 'upcoming'
    },
    { 
      id: 3, 
      title: 'Midterm Exam', 
      date: 'Next Friday', 
      type: 'exam', 
      icon: '📊',
      description: 'Comprehensive midterm covering all material from weeks 1-8',
      duration: '2 hours',
      points: '200 points',
      status: 'upcoming'
    },
    { 
      id: 4, 
      title: 'Project Presentation', 
      date: 'In 2 weeks', 
      type: 'project', 
      icon: '🎯',
      description: 'Present your calculus application project to the class',
      duration: '15 minutes',
      points: '150 points',
      status: 'upcoming'
    },
    { 
      id: 5, 
      title: 'Lab Session: Limits', 
      date: 'This Friday', 
      type: 'lab', 
      icon: '🔬',
      description: 'Hands-on exploration of limit concepts using graphing calculators',
      duration: '90 minutes',
      points: '75 points',
      status: 'upcoming'
    },
    { 
      id: 6, 
      title: 'Homework: Chain Rule', 
      date: 'Next Wednesday', 
      type: 'homework', 
      icon: '📚',
      description: 'Practice problems applying the chain rule to various functions',
      duration: '1 hour',
      points: '25 points',
      status: 'upcoming'
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
                <h2>Upcoming Events - {currentClass.title}</h2>
                <p className="class-subtitle">{currentClass.subtitle}</p>
                <div className="class-meta">
                  <span className="class-term">{currentClass.term}</span>
                  <span className="class-students">{currentClass.students} students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="class-content">
            <div className="upcoming-detailed-grid">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="upcoming-detailed-card">
                  <div className="upcoming-card-header">
                    <div className="upcoming-icon-large">{event.icon}</div>
                    <div className="upcoming-card-info">
                      <h3 className="upcoming-title-large">{event.title}</h3>
                      <div className="upcoming-date-large">{event.date}</div>
                      <div className="upcoming-type-badge">{event.type}</div>
                    </div>
                  </div>
                  <div className="upcoming-card-content">
                    <p className="upcoming-description">{event.description}</p>
                    <div className="upcoming-details">
                      <div className="upcoming-detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{event.duration}</span>
                      </div>
                      <div className="upcoming-detail-item">
                        <span className="detail-label">Points:</span>
                        <span className="detail-value">{event.points}</span>
                      </div>
                      <div className="upcoming-detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-${event.status}`}>{event.status}</span>
                      </div>
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
