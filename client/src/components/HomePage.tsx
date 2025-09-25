'use client'

import { useState } from 'react'

export default function HomePage() {
  const [expandedSections, setExpandedSections] = useState({
    recent: false,
    classes: false,
    resources: false
  })

  const toggleExpand = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }
  return (
    <div className="page-content">
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent</h2>
          </div>
          <div className={`section-content ${expandedSections.recent ? 'expanded' : ''}`}>
            <div className={`scrollable-container ${expandedSections.recent ? 'expanded-grid' : ''}`} onWheel={(e) => {
              if (!expandedSections.recent) {
                const container = e.currentTarget;
                if (e.deltaY > 0) {
                  container.scrollLeft += 50;
                } else {
                  container.scrollLeft -= 50;
                }
              }
            }}>
              <div className={`placeholder-grid ${expandedSections.recent ? 'grid-layout' : 'horizontal-scroll'}`}>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📄</div>
                    <div className="placeholder-title">Recent Lesson Plan</div>
                    <div className="placeholder-subtitle">Created 2 hours ago</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">✅</div>
                    <div className="placeholder-title">Math Quiz</div>
                    <div className="placeholder-subtitle">Completed yesterday</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎯</div>
                    <div className="placeholder-title">Science Project</div>
                    <div className="placeholder-subtitle">Updated 3 days ago</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📝</div>
                    <div className="placeholder-title">English Assignment</div>
                    <div className="placeholder-subtitle">Due next week</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📋</div>
                    <div className="placeholder-title">History Test</div>
                    <div className="placeholder-subtitle">Graded last week</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📊</div>
                    <div className="placeholder-title">Grade Report</div>
                    <div className="placeholder-subtitle">Updated 4 days ago</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎨</div>
                    <div className="placeholder-title">Art Project</div>
                    <div className="placeholder-subtitle">Submitted yesterday</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔬</div>
                    <div className="placeholder-title">Lab Report</div>
                    <div className="placeholder-subtitle">Due tomorrow</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📝</div>
                    <div className="placeholder-title">Essay Draft</div>
                    <div className="placeholder-subtitle">In progress</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="expand-button bottom-right" onClick={() => toggleExpand('recent')}>
              <span className="expand-text">expand</span>
              <span className={`expand-arrow ${expandedSections.recent ? 'expanded' : ''}`}>▼</span>
            </button>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Classes</h2>
          </div>
          <div className={`section-content ${expandedSections.classes ? 'expanded' : ''}`}>
            <div className={`scrollable-container ${expandedSections.classes ? 'expanded-grid' : ''}`} onWheel={(e) => {
              if (!expandedSections.classes) {
                const container = e.currentTarget;
                if (e.deltaY > 0) {
                  container.scrollLeft += 50;
                } else {
                  container.scrollLeft -= 50;
                }
              }
            }}>
              <div className={`placeholder-grid ${expandedSections.classes ? 'grid-layout' : 'horizontal-scroll'}`}>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">➕</div>
                    <div className="placeholder-title">Create New Class</div>
                    <div className="placeholder-subtitle">Start building your classroom</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🏫</div>
                    <div className="placeholder-title">Create your first class!</div>
                    <div className="placeholder-subtitle">Start building your classroom community</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📚</div>
                    <div className="placeholder-title">Add another class</div>
                    <div className="placeholder-subtitle">Organize different subjects or grade levels</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">👥</div>
                    <div className="placeholder-title">Create study groups</div>
                    <div className="placeholder-subtitle">Set up collaborative learning spaces</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔬</div>
                    <div className="placeholder-title">Lab Sessions</div>
                    <div className="placeholder-subtitle">Organize hands-on experiments</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎨</div>
                    <div className="placeholder-title">Art Workshop</div>
                    <div className="placeholder-subtitle">Creative expression sessions</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">💻</div>
                    <div className="placeholder-title">Computer Science</div>
                    <div className="placeholder-subtitle">Programming fundamentals</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🌍</div>
                    <div className="placeholder-title">Geography</div>
                    <div className="placeholder-subtitle">World cultures and maps</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎵</div>
                    <div className="placeholder-title">Music Theory</div>
                    <div className="placeholder-subtitle">Harmony and composition</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🏃</div>
                    <div className="placeholder-title">Physical Education</div>
                    <div className="placeholder-subtitle">Sports and fitness</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Create new class!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🧪</div>
                    <div className="placeholder-title">Chemistry Lab</div>
                    <div className="placeholder-subtitle">Advanced experiments</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="expand-button bottom-right" onClick={() => toggleExpand('classes')}>
              <span className="expand-text">expand</span>
              <span className={`expand-arrow ${expandedSections.classes ? 'expanded' : ''}`}>▼</span>
            </button>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Resources</h2>
          </div>
          <div className={`section-content ${expandedSections.resources ? 'expanded' : ''}`}>
            <div className={`scrollable-container ${expandedSections.resources ? 'expanded-grid' : ''}`} onWheel={(e) => {
              if (!expandedSections.resources) {
                const container = e.currentTarget;
                if (e.deltaY > 0) {
                  container.scrollLeft += 50;
                } else {
                  container.scrollLeft -= 50;
                }
              }
            }}>
              <div className={`placeholder-grid ${expandedSections.resources ? 'grid-layout' : 'horizontal-scroll'}`}>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">➕</div>
                    <div className="placeholder-title">Add New Resource</div>
                    <div className="placeholder-subtitle">Share your materials</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📄</div>
                    <div className="placeholder-title">Upload your first resource!</div>
                    <div className="placeholder-subtitle">Share documents, links, and materials</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔗</div>
                    <div className="placeholder-title">Add external links</div>
                    <div className="placeholder-subtitle">Connect to useful websites and tools</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📁</div>
                    <div className="placeholder-title">Organize folders</div>
                    <div className="placeholder-subtitle">Create collections for different topics</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📊</div>
                    <div className="placeholder-title">Data Sheets</div>
                    <div className="placeholder-subtitle">Spreadsheets and analytics</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎥</div>
                    <div className="placeholder-title">Video Library</div>
                    <div className="placeholder-subtitle">Educational videos and tutorials</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📚</div>
                    <div className="placeholder-title">Textbook PDFs</div>
                    <div className="placeholder-subtitle">Digital textbooks and readings</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🎮</div>
                    <div className="placeholder-title">Interactive Games</div>
                    <div className="placeholder-subtitle">Educational games and simulations</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📋</div>
                    <div className="placeholder-title">Assessment Rubrics</div>
                    <div className="placeholder-subtitle">Grading criteria and standards</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🔧</div>
                    <div className="placeholder-title">Tools & Software</div>
                    <div className="placeholder-subtitle">Educational software and apps</div>
                  </div>
                </div>
                <div className="placeholder-card create-inspiration" onClick={() => alert('Add new resource!')}>
                  <div className="placeholder-content">
                    <div className="placeholder-icon">📝</div>
                    <div className="placeholder-title">Templates</div>
                    <div className="placeholder-subtitle">Reusable document templates</div>
                  </div>
                </div>
              </div>
            </div>
            <button className="expand-button bottom-right" onClick={() => toggleExpand('resources')}>
              <span className="expand-text">expand</span>
              <span className={`expand-arrow ${expandedSections.resources ? 'expanded' : ''}`}>▼</span>
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
