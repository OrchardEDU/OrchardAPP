'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GradeablesPage() {
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

  // Mock data for gradeables
  const gradeables = [
    { 
      id: 1, 
      title: 'Homework 1: Limits', 
      dueDate: '2024-01-15', 
      status: 'graded', 
      score: '95/100', 
      icon: '📝',
      description: 'Practice problems on limit concepts and calculations',
      submissions: 24,
      averageScore: 87.5,
      category: 'homework'
    },
    { 
      id: 2, 
      title: 'Quiz 1: Functions', 
      dueDate: '2024-01-20', 
      status: 'graded', 
      score: '88/100', 
      icon: '📋',
      description: 'Quiz covering function definitions and properties',
      submissions: 24,
      averageScore: 82.3,
      category: 'quiz'
    },
    { 
      id: 3, 
      title: 'Lab Report 1', 
      dueDate: '2024-01-25', 
      status: 'pending', 
      score: null, 
      icon: '🔬',
      description: 'Laboratory report on derivative applications',
      submissions: 18,
      averageScore: null,
      category: 'lab'
    },
    { 
      id: 4, 
      title: 'Group Project', 
      dueDate: '2024-02-01', 
      status: 'pending', 
      score: null, 
      icon: '👥',
      description: 'Collaborative project on calculus applications',
      submissions: 6,
      averageScore: null,
      category: 'project'
    },
    { 
      id: 5, 
      title: 'Midterm Exam', 
      dueDate: '2024-02-15', 
      status: 'graded', 
      score: '92/100', 
      icon: '📊',
      description: 'Comprehensive midterm examination',
      submissions: 24,
      averageScore: 78.9,
      category: 'exam'
    },
    { 
      id: 6, 
      title: 'Final Project', 
      dueDate: '2024-05-01', 
      status: 'draft', 
      score: null, 
      icon: '🎯',
      description: 'Final capstone project demonstrating calculus mastery',
      submissions: 0,
      averageScore: null,
      category: 'project'
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
                <h2>Gradeables - {currentClass.title}</h2>
                <p className="class-subtitle">{currentClass.subtitle}</p>
                <div className="class-meta">
                  <span className="class-term">{currentClass.term}</span>
                  <span className="class-students">{currentClass.students} students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="class-content">
            <div className="gradeables-detailed-grid">
              {gradeables.map((item) => (
                <div key={item.id} className="gradeable-detailed-card">
                  <div className="gradeable-card-header">
                    <div className="gradeable-icon-large">{item.icon}</div>
                    <div className="gradeable-card-info">
                      <h3 className="gradeable-title-large">{item.title}</h3>
                      <div className="gradeable-due-large">Due: {item.dueDate}</div>
                      <div className={`gradeable-status-badge ${item.status}`}>
                        {item.status === 'graded' ? `Score: ${item.score}` : 
                         item.status === 'pending' ? 'Pending' : 
                         item.status === 'draft' ? 'Draft' : item.status}
                      </div>
                    </div>
                  </div>
                  <div className="gradeable-card-content">
                    <p className="gradeable-description">{item.description}</p>
                    <div className="gradeable-stats">
                      <div className="gradeable-stat-item">
                        <span className="stat-label">Submissions:</span>
                        <span className="stat-value">{item.submissions}/{currentClass.students}</span>
                      </div>
                      <div className="gradeable-stat-item">
                        <span className="stat-label">Category:</span>
                        <span className="stat-value">{item.category}</span>
                      </div>
                      {item.averageScore && (
                        <div className="gradeable-stat-item">
                          <span className="stat-label">Average Score:</span>
                          <span className="stat-value">{item.averageScore}%</span>
                        </div>
                      )}
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
