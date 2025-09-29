'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClassPage() {
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

  // Mock data for class-specific content
  const upcomingEvents = [
    { id: 1, title: 'Quiz: Derivatives', date: 'Tomorrow', type: 'quiz', icon: '📝' },
    { id: 2, title: 'Assignment: Integration Problems', date: 'Next Monday', type: 'assignment', icon: '📋' },
    { id: 3, title: 'Midterm Exam', date: 'Next Friday', type: 'exam', icon: '📊' },
    { id: 4, title: 'Project Presentation', date: 'In 2 weeks', type: 'project', icon: '🎯' }
  ]

  const gradeables = [
    { id: 1, title: 'Homework 1: Limits', dueDate: '2024-01-15', status: 'graded', score: '95/100', icon: '📝' },
    { id: 2, title: 'Quiz 1: Functions', dueDate: '2024-01-20', status: 'graded', score: '88/100', icon: '📋' },
    { id: 3, title: 'Lab Report 1', dueDate: '2024-01-25', status: 'pending', score: null, icon: '🔬' },
    { id: 4, title: 'Group Project', dueDate: '2024-02-01', status: 'pending', score: null, icon: '👥' }
  ]

  const students = [
    { id: 1, name: 'Alice Johnson', email: 'alice.johnson@school.edu', grade: 'A', attendance: '95%', avatar: '👩‍🎓' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@school.edu', grade: 'B+', attendance: '88%', avatar: '👨‍🎓' },
    { id: 3, name: 'Carol Davis', email: 'carol.davis@school.edu', grade: 'A-', attendance: '92%', avatar: '👩‍🎓' },
    { id: 4, name: 'David Wilson', email: 'david.wilson@school.edu', grade: 'B', attendance: '85%', avatar: '👨‍🎓' },
    { id: 5, name: 'Emma Brown', email: 'emma.brown@school.edu', grade: 'A+', attendance: '98%', avatar: '👩‍🎓' }
  ]

  const courseMaterials = [
    { id: 1, title: 'Chapter 1: Introduction', type: 'PDF', size: '2.3 MB', icon: '📄' },
    { id: 2, title: 'Lecture Slides - Week 1', type: 'PPTX', size: '5.1 MB', icon: '📊' },
    { id: 3, title: 'Assignment Template', type: 'DOCX', size: '1.2 MB', icon: '📝' },
    { id: 4, title: 'Video: Basic Concepts', type: 'MP4', size: '45.2 MB', icon: '🎥' },
    { id: 5, title: 'Practice Problems', type: 'PDF', size: '3.8 MB', icon: '📚' }
  ]

  // Navigation handlers
  const handleUpcomingClick = () => {
    router.push(`/class/${classId}/upcoming`)
  }

  const handleGradeablesClick = () => {
    router.push(`/class/${classId}/gradeables`)
  }

  const handleStudentsClick = () => {
    router.push(`/class/${classId}/students`)
  }

  const handleMaterialsClick = () => {
    router.push(`/class/${classId}/materials`)
  }

  const handleBackToHome = () => {
    router.push('/dashboard')
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
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-details">
                <div className="activity-title">Assignment Posted</div>
                <div className="activity-subtitle">{currentClass.title} - Integration Problems</div>
                <div className="activity-time">2 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🎯</div>
              <div className="activity-details">
                <div className="activity-title">Project Due</div>
                <div className="activity-subtitle">{currentClass.title} - Final Project</div>
                <div className="activity-time">3 days ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Class Content */}
        <div className="class-main">
          <div className="class-header">
            <div className="class-info">
              <button className="back-button" onClick={handleBackToHome}>
                ←
              </button>
              <div className="class-icon-large">{currentClass.icon}</div>
              <div className="class-details">
                <h2>{currentClass.title}</h2>
                <p className="class-subtitle">{currentClass.subtitle}</p>
                <div className="class-meta">
                  <span className="class-term">{currentClass.term}</span>
                  <span className="class-students">{currentClass.students} students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="class-content">
            {/* 2x2 Grid Layout */}
            <div className="content-grid">
              {/* Top Left - Upcoming */}
              <div className="class-section clickable-section" onClick={handleUpcomingClick}>
                <div className="section-header">
                  <h3>Upcoming</h3>
                  <button className="section-action">View All</button>
                </div>
                <div className="section-content">
                  <div className="upcoming-grid">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="upcoming-card">
                        <div className="upcoming-icon">{event.icon}</div>
                        <div className="upcoming-details">
                          <div className="upcoming-title">{event.title}</div>
                          <div className="upcoming-date">{event.date}</div>
                          <div className="upcoming-type">{event.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Right - Gradeables */}
              <div className="class-section clickable-section" onClick={handleGradeablesClick}>
                <div className="section-header">
                  <h3>Gradeables</h3>
                  <div className="section-actions">
                    <button className="action-btn settings-btn">⚙️</button>
                    <button className="action-btn plus-btn">+</button>
                  </div>
                </div>
                <div className="section-content">
                  <div className="gradeables-list">
                    {gradeables.map((item) => (
                      <div key={item.id} className="gradeable-item">
                        <div className="gradeable-icon">{item.icon}</div>
                        <div className="gradeable-details">
                          <div className="gradeable-title">{item.title}</div>
                          <div className="gradeable-due">Due: {item.dueDate}</div>
                          <div className={`gradeable-status ${item.status}`}>
                            {item.status === 'graded' ? `Score: ${item.score}` : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Left - Students */}
              <div className="class-section clickable-section" onClick={handleStudentsClick}>
                <div className="section-header">
                  <h3>Students</h3>
                  <div className="section-actions">
                    <button className="action-btn settings-btn">⚙️</button>
                    <button className="action-btn plus-btn">+</button>
                  </div>
                </div>
                <div className="section-content">
                  <div className="students-grid">
                    {students.map((student) => (
                      <div key={student.id} className="student-card">
                        <div className="student-avatar">{student.avatar}</div>
                        <div className="student-details">
                          <div className="student-name">{student.name}</div>
                          <div className="student-email">{student.email}</div>
                          <div className="student-stats">
                            <span className="student-grade">Grade: {student.grade}</span>
                            <span className="student-attendance">Attendance: {student.attendance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Right - Course Materials */}
              <div className="class-section clickable-section" onClick={handleMaterialsClick}>
                <div className="section-header">
                  <h3>Course Materials</h3>
                  <div className="section-actions">
                    <button className="action-btn settings-btn">⚙️</button>
                    <button className="action-btn plus-btn">+</button>
                  </div>
                </div>
                <div className="section-content">
                  <div className="materials-list">
                    {courseMaterials.map((material) => (
                      <div key={material.id} className="material-item">
                        <div className="material-icon">{material.icon}</div>
                        <div className="material-details">
                          <div className="material-title">{material.title}</div>
                          <div className="material-meta">
                            <span className="material-type">{material.type}</span>
                            <span className="material-size">{material.size}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
