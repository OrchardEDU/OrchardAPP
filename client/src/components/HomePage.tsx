'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  const handleClassClick = (classId: string) => {
    router.push(`/class/${classId}`)
  }

  const handleCreateClass = () => {
    alert('Create new class functionality coming soon!')
  }

  return (
    <div className="page-content">
      <div className="dashboard-layout">
        {/* Left Activity Feed */}
        <div className="activity-feed">
          <div className="activity-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-content">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <div className="activity-title">Assignment Due Tomorrow</div>
                <div className="activity-subtitle">Math 101 - Calculus Problem Set</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🎯</div>
              <div className="activity-details">
                <div className="activity-title">New Project Posted</div>
                <div className="activity-subtitle">Science 201 - Lab Report</div>
                <div className="activity-time">4 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-details">
                <div className="activity-title">Quiz Graded</div>
                <div className="activity-subtitle">History 150 - World War II</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-details">
                <div className="activity-title">Test Scheduled</div>
                <div className="activity-subtitle">English 101 - Midterm Exam</div>
                <div className="activity-time">2 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔔</div>
              <div className="activity-details">
                <div className="activity-title">Student Question</div>
                <div className="activity-subtitle">Physics 201 - Office Hours</div>
                <div className="activity-time">3 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-details">
                <div className="activity-title">Grades Updated</div>
                <div className="activity-subtitle">All Classes - Final Grades</div>
                <div className="activity-time">1 week ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Classes Section */}
        <div className="classes-main">
          <div className="classes-header">
            <h2>My Classes</h2>
          </div>
          <div className="classes-content">
            <div className="classes-grid">
              <div className="class-card create-class" onClick={handleCreateClass}>
                <div className="class-content">
                  <div className="class-icon">➕</div>
                  <div className="class-title">Create New Class</div>
                  <div className="class-subtitle">Start building your classroom</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('math101')}>
                <div className="class-content">
                  <div className="class-icon">🧮</div>
                  <div className="class-title">Math 101</div>
                  <div className="class-subtitle">Calculus I</div>
                  <div className="class-stats">24 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('science201')}>
                <div className="class-content">
                  <div className="class-icon">🔬</div>
                  <div className="class-title">Science 201</div>
                  <div className="class-subtitle">General Chemistry</div>
                  <div className="class-stats">18 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('english101')}>
                <div className="class-content">
                  <div className="class-icon">📚</div>
                  <div className="class-title">English 101</div>
                  <div className="class-subtitle">Composition</div>
                  <div className="class-stats">22 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('history150')}>
                <div className="class-content">
                  <div className="class-icon">🌍</div>
                  <div className="class-title">History 150</div>
                  <div className="class-subtitle">World History</div>
                  <div className="class-stats">30 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('physics201')}>
                <div className="class-content">
                  <div className="class-icon">⚡</div>
                  <div className="class-title">Physics 201</div>
                  <div className="class-subtitle">Mechanics</div>
                  <div className="class-stats">16 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('art101')}>
                <div className="class-content">
                  <div className="class-icon">🎨</div>
                  <div className="class-title">Art 101</div>
                  <div className="class-subtitle">Drawing Fundamentals</div>
                  <div className="class-stats">12 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('pe101')}>
                <div className="class-content">
                  <div className="class-icon">🏃</div>
                  <div className="class-title">PE 101</div>
                  <div className="class-subtitle">Physical Education</div>
                  <div className="class-stats">25 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('music101')}>
                <div className="class-content">
                  <div className="class-icon">🎵</div>
                  <div className="class-title">Music 101</div>
                  <div className="class-subtitle">Music Theory</div>
                  <div className="class-stats">15 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('biology201')}>
                <div className="class-content">
                  <div className="class-icon">🧬</div>
                  <div className="class-title">Biology 201</div>
                  <div className="class-subtitle">Cell Biology</div>
                  <div className="class-stats">28 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('psychology101')}>
                <div className="class-content">
                  <div className="class-icon">🧠</div>
                  <div className="class-title">Psychology 101</div>
                  <div className="class-subtitle">Introduction to Psychology</div>
                  <div className="class-stats">32 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('economics101')}>
                <div className="class-content">
                  <div className="class-icon">💰</div>
                  <div className="class-title">Economics 101</div>
                  <div className="class-subtitle">Microeconomics</div>
                  <div className="class-stats">20 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('computer101')}>
                <div className="class-content">
                  <div className="class-icon">💻</div>
                  <div className="class-title">Computer Science 101</div>
                  <div className="class-subtitle">Programming Fundamentals</div>
                  <div className="class-stats">35 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('geography101')}>
                <div className="class-content">
                  <div className="class-icon">🌎</div>
                  <div className="class-title">Geography 101</div>
                  <div className="class-subtitle">World Geography</div>
                  <div className="class-stats">18 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('philosophy101')}>
                <div className="class-content">
                  <div className="class-icon">🤔</div>
                  <div className="class-title">Philosophy 101</div>
                  <div className="class-subtitle">Introduction to Philosophy</div>
                  <div className="class-stats">14 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('sociology101')}>
                <div className="class-content">
                  <div className="class-icon">👥</div>
                  <div className="class-title">Sociology 101</div>
                  <div className="class-subtitle">Introduction to Sociology</div>
                  <div className="class-stats">26 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('statistics101')}>
                <div className="class-content">
                  <div className="class-icon">📊</div>
                  <div className="class-title">Statistics 101</div>
                  <div className="class-subtitle">Elementary Statistics</div>
                  <div className="class-stats">22 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('literature101')}>
                <div className="class-content">
                  <div className="class-icon">📖</div>
                  <div className="class-title">Literature 101</div>
                  <div className="class-subtitle">World Literature</div>
                  <div className="class-stats">19 students</div>
                </div>
              </div>
              <div className="class-card" onClick={() => handleClassClick('chemistry201')}>
                <div className="class-content">
                  <div className="class-icon">⚗️</div>
                  <div className="class-title">Chemistry 201</div>
                  <div className="class-subtitle">Organic Chemistry</div>
                  <div className="class-stats">17 students</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}