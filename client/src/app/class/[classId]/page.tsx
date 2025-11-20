'use client'

import { useParams, useRouter } from 'next/navigation'

export default function ClassPage() {
  const params = useParams()
  const router = useRouter()
  
  // Handle null params
  if (!params || !params.classId) {
    return (
      <div className="page-content">
        <div className="dashboard-layout">
          <div className="error-message">
            <h2>Invalid class ID</h2>
            <p>No class ID provided in the URL.</p>
          </div>
        </div>
      </div>
    )
  }
  
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

  const handleBackToHome = () => {
    router.push('/dashboard')
  }

  const handleNavigateToSection = (section: string) => {
    router.push(`/class/${classId}/${section}`)
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
            <div className="class-sections">
              <div className="class-section">
                <div className="section-header">
                  <h3>📊 Gradeables</h3>
                  <button 
                    className="section-btn" 
                    onClick={() => handleNavigateToSection('gradeables')}
                  >
                    View All →
                  </button>
                </div>
                <div className="section-content">
                  <div className="upcoming-item">
                    <div className="upcoming-icon">📝</div>
                    <div className="upcoming-details">
                      <div className="upcoming-title">Homework 1: Limits</div>
                      <div className="upcoming-date">Due: 2024-01-15</div>
                    </div>
                  </div>
                  <div className="upcoming-item">
                    <div className="upcoming-icon">📋</div>
                    <div className="upcoming-details">
                      <div className="upcoming-title">Quiz 1: Functions</div>
                      <div className="upcoming-date">Due: 2024-01-20</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="class-section">
                <div className="section-header">
                  <h3>👥 Students</h3>
                  <button 
                    className="section-btn" 
                    onClick={() => handleNavigateToSection('students')}
                  >
                    View All →
                  </button>
                </div>
                <div className="section-content">
                  <div className="student-item">
                    <div className="student-avatar">👩‍🎓</div>
                    <div className="student-details">
                      <div className="student-name">Alice Johnson</div>
                      <div className="student-attendance">95% attendance</div>
                    </div>
                  </div>
                  <div className="student-item">
                    <div className="student-avatar">👨‍🎓</div>
                    <div className="student-details">
                      <div className="student-name">Bob Smith</div>
                      <div className="student-attendance">88% attendance</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="class-section">
                <div className="section-header">
                  <h3>📚 Materials</h3>
                  <button 
                    className="section-btn" 
                    onClick={() => handleNavigateToSection('materials')}
                  >
                    View All →
                  </button>
                </div>
                <div className="section-content">
                  <div className="material-item">
                    <div className="material-icon">📄</div>
                    <div className="material-details">
                      <div className="material-title">Chapter 1: Introduction</div>
                      <div className="material-type">PDF - 2.3 MB</div>
                    </div>
                  </div>
                  <div className="material-item">
                    <div className="material-icon">📊</div>
                    <div className="material-details">
                      <div className="material-title">Lecture Slides - Week 1</div>
                      <div className="material-type">PPTX - 5.1 MB</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="class-section">
                <div className="section-header">
                  <h3>📅 Upcoming</h3>
                  <button 
                    className="section-btn" 
                    onClick={() => handleNavigateToSection('upcoming')}
                  >
                    View All →
                  </button>
                </div>
                <div className="section-content">
                  <div className="upcoming-item">
                    <div className="upcoming-icon">📋</div>
                    <div className="upcoming-details">
                      <div className="upcoming-title">Quiz 2: Derivatives</div>
                      <div className="upcoming-date">Feb 5, 2024 at 10:00 AM</div>
                    </div>
                  </div>
                  <div className="upcoming-item">
                    <div className="upcoming-icon">📊</div>
                    <div className="upcoming-details">
                      <div className="upcoming-title">Midterm Exam</div>
                      <div className="upcoming-date">Feb 15, 2024 at 9:00 AM</div>
                    </div>
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