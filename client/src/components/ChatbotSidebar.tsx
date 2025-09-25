'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ChatbotSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm here to help you create educational content. What would you like to work on today?",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)

  // Listen for header toggle events
  useEffect(() => {
    const handleHeaderToggle = (event: CustomEvent) => {
      setIsMinimized(event.detail.isMinimized)
    }

    window.addEventListener('headerSidebarToggle', handleHeaderToggle as EventListener)
    return () => {
      window.removeEventListener('headerSidebarToggle', handleHeaderToggle as EventListener)
    }
  }, [])

  const navigationButtons = [
    { label: "Assignment", path: "/lesson-plan", icon: "📝" },
    { label: "Project", path: "/generate-project", icon: "🎯" },
    { label: "Quiz", path: "/multiple-choice-quiz", icon: "✅" },
    { label: "Test", path: "/open-ended-quiz", icon: "📋" },
  ]

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { type: "user", text: inputMessage },
        { type: "bot", text: "I understand you want to work on that. Let me help you get started!" },
      ])
      setInputMessage("")
    }
  }

  const handlePublish = () => {
    alert("Publishing to students...")
  }

  const handleSave = () => {
    alert("Saving to account...")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const toggleMinimize = () => {
    if (!isMinimized) {
      // Starting to collapse
      setIsCollapsing(true)
      setTimeout(() => {
        setIsMinimized(true)
        setIsCollapsing(false)
      }, 300) // Match animation duration
    } else {
      // Expanding
      setIsMinimized(false)
    }
    
    // Dispatch custom event to notify header of state change
    const event = new CustomEvent('sidebarStateChange', {
      detail: { isMinimized: !isMinimized }
    })
    window.dispatchEvent(event)
  }

  if (isMinimized) {
    return null // The minimized circle is now handled by the header
  }

  return (
    <div className={`chatbot-sidebar ${isCollapsing ? 'collapsing' : ''}`}>
      {/* Tools Section with Minimize Button */}
      <div className="tools-section">
        <div className="tools-header">
          <h3>Tools</h3>
          <div className="minimize-button" onClick={toggleMinimize}>
            <span className="minimize-icon">−</span>
          </div>
        </div>
        <div className="nav-buttons">
          {navigationButtons.map((button) => (
            <button
              key={button.path}
              className={`nav-btn ${pathname === button.path ? "active" : ""}`}
              onClick={() => handleNavigation(button.path)}
            >
              <span className="nav-icon">{button.icon}</span>
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-section">
        <h3>AI Assistant</h3>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">{message.text}</div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}
