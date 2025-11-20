'use client'

import { useParams, useRouter } from 'next/navigation'

export default function StudentsPage() {
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

  // Mock data for students
  const students = [
    { 
      id: 1, 
      name: 'Alice Johnson', 
      email: 'alice.johnson@university.edu', 
      avatar: '👩‍🎓',
      attendance: '95%',
      lastActive: '2 hours ago',
      grade: 'A',
      status: 'active'
    },
    { 
      id: 2, 
      name: 'Bob Smith', 
      email: 'bob.smith@university.edu', 
      avatar: '👨‍🎓',
      attendance: '88%',
      lastActive: '1 day ago',
      grade: 'B+',
      status: 'active'
    },
    { 
      id: 3, 
      name: 'Carol Davis', 
      email: 'carol.davis@university.edu', 
      avatar: '👩‍🎓',
      attendance: '92%',
      lastActive: '3 hours ago',
      grade: 'A-',
      status: 'active'
    },
    { 
      id: 4, 
      name: 'David Wilson', 
      email: 'david.wilson@university.edu', 
      avatar: '👨‍🎓',
      attendance: '78%',
      lastActive: '5 days ago',
      grade: 'C+',
      status: 'at-risk'
    },
    { 
      id: 5, 
      name: 'Emma Brown', 
      email: 'emma.brown@university.edu', 
      avatar: '👩‍🎓',
      attendance: '96%',
      lastActive: '1 hour ago',
      grade: 'A+',
      status: 'active'
    },
    { 
      id: 6, 
      name: 'Frank Miller', 
      email: 'frank.miller@university.edu', 
      avatar: '👨‍🎓',
      attendance: '85%',
      lastActive: '2 days ago',
      grade: 'B',
      status: 'active'
    },
    { 
      id: 7, 
      name: 'Grace Lee', 
      email: 'grace.lee@university.edu', 
      avatar: '👩‍🎓',
      attendance: '90%',
      lastActive: '4 hours ago',
      grade: 'A-',
      status: 'active'
    },
    { 
      id: 8, 
      name: 'Henry Taylor', 
      email: 'henry.taylor@university.edu', 
      avatar: '👨‍🎓',
      attendance: '82%',
      lastActive: '1 week ago',
      grade: 'B-',
      status: 'inactive'
    },
    { 
      id: 9, 
      name: 'Ivy Chen', 
      email: 'ivy.chen@university.edu', 
      avatar: '👩‍🎓',
      attendance: '94%',
      lastActive: '30 minutes ago',
      grade: 'A',
      status: 'active'
    },
    { 
      id: 10, 
      name: 'Jack Anderson', 
      email: 'jack.anderson@university.edu', 
      avatar: '👨‍🎓',
      attendance: '87%',
      lastActive: '6 hours ago',
      grade: 'B+',
      status: 'active'
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
              <div className="activity-icon">👥</div>
              <div className="activity-details">
                <div className="activity-title">New Student Joined</div>
                <div className="activity-subtitle">{currentClass.title} - Sarah Wilson</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-details">
                <div className="activity-title">Attendance Updated</div>
                <div className="activity-subtitle">{currentClass.title} - Weekly Report</div>
                <div className="activity-time">3 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <div className="activity-title">Assignment Submitted</div>
                <div className="activity-subtitle">{currentClass.title} - Alice Johnson</div>
                <div className="activity-time">5 hours ago</div>
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
                <h2>Students - {currentClass.title}</h2>
                <p className="class-subtitle">{currentClass.subtitle}</p>
                <div className="class-meta">
                  <span className="class-term">{currentClass.term}</span>
                  <span className="class-students">{currentClass.students} students</span>
                </div>
              </div>
            </div>
          </div>

          <div className="class-content">
            <div className="students-detailed-grid">
              {students.map((student) => (
                <div key={student.id} className="student-detailed-card">
                  <div className="student-card-header">
                    <div className="student-avatar-large">{student.avatar}</div>
                    <div className="student-card-info">
                      <h3 className="student-name-large">{student.name}</h3>
                      <div className="student-email-large">{student.email}</div>
                      <div className={`student-status-badge ${student.status}`}>
                        {student.status === 'active' ? 'Active' : 
                         student.status === 'at-risk' ? 'At Risk' : 
                         student.status === 'inactive' ? 'Inactive' : student.status}
                      </div>
                    </div>
                  </div>
                  <div className="student-card-content">
                    <div className="student-stats">
                      <div className="student-stat-item">
                        <span className="stat-label">Attendance:</span>
                        <span className="stat-value">{student.attendance}</span>
                      </div>
                      <div className="student-stat-item">
                        <span className="stat-label">Current Grade:</span>
                        <span className="stat-value">{student.grade}</span>
                      </div>
                      <div className="student-stat-item">
                        <span className="stat-label">Last Active:</span>
                        <span className="stat-value">{student.lastActive}</span>
                      </div>
                    </div>
                    <div className="student-actions">
                      <button className="message-btn">💬 Message</button>
                      <button className="grade-btn">📊 View Grades</button>
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