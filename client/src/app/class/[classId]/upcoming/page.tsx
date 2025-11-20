'use client'

import { useParams, useRouter } from 'next/navigation'

export default function UpcomingPage() {
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

  // Mock data for upcoming events
  const upcomingEvents = [
    { 
      id: 1, 
      title: 'Quiz 2: Derivatives', 
      date: '2024-02-05', 
      time: '10:00 AM', 
      type: 'quiz',
      icon: '📋',
      description: 'Quiz covering derivative rules and applications',
      location: 'Room 201',
      duration: '50 minutes',
      status: 'upcoming'
    },
    { 
      id: 2, 
      title: 'Lab Session 3', 
      date: '2024-02-07', 
      time: '2:00 PM', 
      type: 'lab',
      icon: '🔬',
      description: 'Hands-on practice with derivative applications',
      location: 'Lab 105',
      duration: '2 hours',
      status: 'upcoming'
    },
    { 
      id: 3, 
      title: 'Homework 3 Due', 
      date: '2024-02-08', 
      time: '11:59 PM', 
      type: 'assignment',
      icon: '📝',
      description: 'Submit derivative practice problems',
      location: 'Online',
      duration: 'N/A',
      status: 'upcoming'
    },
    { 
      id: 4, 
      title: 'Midterm Exam', 
      date: '2024-02-15', 
      time: '9:00 AM', 
      type: 'exam',
      icon: '📊',
      description: 'Comprehensive midterm examination',
      location: 'Room 301',
      duration: '2 hours',
      status: 'upcoming'
    },
    { 
      id: 5, 
      title: 'Group Project Presentation', 
      date: '2024-02-20', 
      time: '1:00 PM', 
      type: 'presentation',
      icon: '🎯',
      description: 'Present calculus applications project',
      location: 'Room 205',
      duration: '30 minutes per group',
      status: 'upcoming'
    },
    { 
      id: 6, 
      title: 'Office Hours', 
      date: '2024-02-12', 
      time: '3:00 PM', 
      type: 'office-hours',
      icon: '👨‍🏫',
      description: 'Professor office hours for questions',
      location: 'Office 402',
      duration: '1 hour',
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
              <div className="activity-icon">📅</div>
              <div className="activity-details">
                <div className="activity-title">Event Added</div>
                <div className="activity-subtitle">{currentClass.title} - Midterm Exam</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <div className="activity-title">Assignment Posted</div>
                <div className="activity-subtitle">{currentClass.title} - Homework 3</div>
                <div className="activity-time">2 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🔬</div>
              <div className="activity-details">
                <div className="activity-title">Lab Scheduled</div>
                <div className="activity-subtitle">{currentClass.title} - Lab Session 3</div>
                <div className="activity-time">3 days ago</div>
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
                      <div className="upcoming-date-large">{event.date} at {event.time}</div>
                      <div className={`upcoming-type-badge ${event.type}`}>
                        {event.type === 'quiz' ? 'Quiz' : 
                         event.type === 'lab' ? 'Lab' : 
                         event.type === 'assignment' ? 'Assignment' :
                         event.type === 'exam' ? 'Exam' :
                         event.type === 'presentation' ? 'Presentation' :
                         event.type === 'office-hours' ? 'Office Hours' : event.type}
                      </div>
                    </div>
                  </div>
                  <div className="upcoming-card-content">
                    <p className="upcoming-description">{event.description}</p>
                    <div className="upcoming-stats">
                      <div className="upcoming-stat-item">
                        <span className="stat-label">Location:</span>
                        <span className="stat-value">{event.location}</span>
                      </div>
                      <div className="upcoming-stat-item">
                        <span className="stat-label">Duration:</span>
                        <span className="stat-value">{event.duration}</span>
                      </div>
                      <div className="upcoming-stat-item">
                        <span className="stat-label">Status:</span>
                        <span className={`status-upcoming ${event.status}`}>
                          {event.status === 'upcoming' ? 'Upcoming' : event.status}
                        </span>
                      </div>
                    </div>
                    <div className="upcoming-actions">
                      <button className="remind-btn">🔔 Set Reminder</button>
                      <button className="details-btn">📋 View Details</button>
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