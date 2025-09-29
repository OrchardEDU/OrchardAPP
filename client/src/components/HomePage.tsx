'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClassClick = (classId: string) => {
    router.push(`/class/${classId}`)
  }

  const handleCreateClass = () => {
    alert('Create new class functionality coming soon!')
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleTermFilter = (term: string) => {
    setSelectedTerm(term)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const getTermDisplayName = (term: string) => {
    switch (term) {
      case 'all':
        return 'All School Years'
      case '2024-2025':
        return '2024-2025'
      case '2023-2024':
        return '2023-2024'
      default:
        return 'All School Years'
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Mock class data with school years
  const classesData = [
    { id: 'math101', title: 'Math 101', subtitle: 'Calculus I', icon: '🧮', students: '24', term: '2024-2025' },
    { id: 'science201', title: 'Science 201', subtitle: 'General Chemistry', icon: '🔬', students: '18', term: '2024-2025' },
    { id: 'english101', title: 'English 101', subtitle: 'Composition', icon: '📚', students: '22', term: '2023-2024' },
    { id: 'history150', title: 'History 150', subtitle: 'World History', icon: '🌍', students: '30', term: '2024-2025' },
    { id: 'physics201', title: 'Physics 201', subtitle: 'Mechanics', icon: '⚡', students: '16', term: '2023-2024' },
    { id: 'art101', title: 'Art 101', subtitle: 'Drawing Fundamentals', icon: '🎨', students: '12', term: '2024-2025' },
    { id: 'pe101', title: 'PE 101', subtitle: 'Physical Education', icon: '🏃', students: '25', term: '2023-2024' },
    { id: 'music101', title: 'Music 101', subtitle: 'Music Theory', icon: '🎵', students: '15', term: '2024-2025' },
    { id: 'biology201', title: 'Biology 201', subtitle: 'Cell Biology', icon: '🧬', students: '28', term: '2023-2024' },
    { id: 'psychology101', title: 'Psychology 101', subtitle: 'Introduction to Psychology', icon: '🧠', students: '32', term: '2024-2025' },
    { id: 'economics101', title: 'Economics 101', subtitle: 'Microeconomics', icon: '💰', students: '20', term: '2023-2024' },
    { id: 'computer101', title: 'Computer Science 101', subtitle: 'Programming Fundamentals', icon: '💻', students: '35', term: '2024-2025' },
    { id: 'geography101', title: 'Geography 101', subtitle: 'World Geography', icon: '🌎', students: '18', term: '2023-2024' },
    { id: 'philosophy101', title: 'Philosophy 101', subtitle: 'Introduction to Philosophy', icon: '🤔', students: '14', term: '2024-2025' },
    { id: 'sociology101', title: 'Sociology 101', subtitle: 'Introduction to Sociology', icon: '👥', students: '26', term: '2023-2024' },
    { id: 'statistics101', title: 'Statistics 101', subtitle: 'Elementary Statistics', icon: '📊', students: '22', term: '2024-2025' },
    { id: 'literature101', title: 'Literature 101', subtitle: 'World Literature', icon: '📖', students: '19', term: '2023-2024' },
    { id: 'chemistry201', title: 'Chemistry 201', subtitle: 'Organic Chemistry', icon: '⚗️', students: '17', term: '2024-2025' }
  ]

  // Filter classes based on search and term
  const filteredClasses = classesData.filter(classItem => {
    const matchesTerm = selectedTerm === 'all' || classItem.term === selectedTerm
    
    if (!searchQuery.trim()) {
      return matchesTerm
    }
    
    const searchLower = searchQuery.toLowerCase()
    const titleMatch = classItem.title.toLowerCase().includes(searchLower)
    const subtitleMatch = classItem.subtitle.toLowerCase().includes(searchLower)
    
    // If there are title matches, only show those
    const hasTitleMatches = classesData.some(item => 
      item.title.toLowerCase().includes(searchLower) && 
      (selectedTerm === 'all' || item.term === selectedTerm)
    )
    
    if (hasTitleMatches) {
      return matchesTerm && titleMatch
    } else {
      // If no title matches, include subtitle matches
      return matchesTerm && (titleMatch || subtitleMatch)
    }
  })

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
            <div className="classes-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="filter-container">
                <div className="dropdown" ref={dropdownRef}>
                  <button className="dropdown-btn" onClick={toggleDropdown}>
                    <span>{getTermDisplayName(selectedTerm)}</span>
                    <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      <button
                        className={`dropdown-item ${selectedTerm === 'all' ? 'active' : ''}`}
                        onClick={() => handleTermFilter('all')}
                      >
                        All School Years
                      </button>
                      <button
                        className={`dropdown-item ${selectedTerm === '2024-2025' ? 'active' : ''}`}
                        onClick={() => handleTermFilter('2024-2025')}
                      >
                        2024-2025
                      </button>
                      <button
                        className={`dropdown-item ${selectedTerm === '2023-2024' ? 'active' : ''}`}
                        onClick={() => handleTermFilter('2023-2024')}
                      >
                        2023-2024
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              {filteredClasses.map((classItem) => (
                <div key={classItem.id} className="class-card" onClick={() => handleClassClick(classItem.id)}>
                  <div className="class-content">
                    <div className="class-icon">{classItem.icon}</div>
                    <div className="class-title">{classItem.title}</div>
                    <div className="class-subtitle">{classItem.subtitle}</div>
                    <div className="class-stats">{classItem.students} students</div>
                    <div className="class-term">{classItem.term}</div>
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