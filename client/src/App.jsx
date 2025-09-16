import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<h1>test</h1>} />
            </Routes>
        </Router>
    );
}



"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import "./App.css"

// Page Components
const LessonPlanPage = () => (
  <div className="page-content">
    <h1>Lesson Plan Creator</h1>
    <div className="content-area">
      <p>Create and manage your lesson plans here.</p>
      <div className="placeholder-content">
        <div className="content-box">
          <h3>New Lesson Plan</h3>
          <p>Start building your lesson plan with AI assistance.</p>
        </div>
      </div>
    </div>
  </div>
)

const GenerateProjectPage = () => (
  <div className="page-content">
    <h1>Project Generator</h1>
    <div className="content-area">
      <p>Generate engaging projects for your students.</p>
      <div className="placeholder-content">
        <div className="content-box">
          <h3>New Project</h3>
          <p>Create custom projects tailored to your curriculum.</p>
        </div>
      </div>
    </div>
  </div>
)

const MultipleChoiceQuizPage = () => (
  <div className="page-content">
    <h1>Multiple Choice Quiz</h1>
    <div className="content-area">
      <p>Create multiple choice quizzes and assessments.</p>
      <div className="placeholder-content">
        <div className="content-box">
          <h3>New Quiz</h3>
          <p>Build interactive multiple choice questions.</p>
        </div>
      </div>
    </div>
  </div>
)

const OpenEndedQuizPage = () => (
  <div className="page-content">
    <h1>Open-Ended Quiz</h1>
    <div className="content-area">
      <p>Create open-ended questions and assessments.</p>
      <div className="placeholder-content">
        <div className="content-box">
          <h3>New Open-Ended Quiz</h3>
          <p>Design thoughtful open-ended questions for deeper learning.</p>
        </div>
      </div>
    </div>
  </div>
)

const HomePage = () => (
  <div className="page-content">
    <h1>Welcome to Canvas AI</h1>
    <div className="content-area">
      <p>Select a tool from the sidebar to get started.</p>
      <div className="home-grid">
        <div className="home-card">
          <h3>Lesson Plans</h3>
          <p>Create comprehensive lesson plans with AI assistance</p>
        </div>
        <div className="home-card">
          <h3>Projects</h3>
          <p>Generate engaging projects for your students</p>
        </div>
        <div className="home-card">
          <h3>Quizzes</h3>
          <p>Build both multiple choice and open-ended assessments</p>
        </div>
      </div>
    </div>
  </div>
)

// Chatbot Sidebar Component
const ChatbotSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm here to help you create educational content. What would you like to work on today?",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const navigationButtons = [
    { label: "Lesson Plan", path: "/lesson-plan", icon: "📚" },
    { label: "Generate Project", path: "/generate-project", icon: "🎯" },
    { label: "Multiple Choice Quiz", path: "/multiple-choice-quiz", icon: "✅" },
    { label: "Open-Ended Quiz", path: "/open-ended-quiz", icon: "💭" },
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

  return (
    <div className="chatbot-sidebar">
      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn publish-btn" onClick={handlePublish}>
          📤 Publish to Student
        </button>
        <button className="action-btn save-btn" onClick={handleSave}>
          💾 Save to Account
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-section">
        <h3>Tools</h3>
        <div className="nav-buttons">
          {navigationButtons.map((button) => (
            <button
              key={button.path}
              className={`nav-btn ${location.pathname === button.path ? "active" : ""}`}
              onClick={() => navigate(button.path)}
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

// Main App Component
function App() {
  return (
    <div className="app">
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson-plan" element={<LessonPlanPage />} />
          <Route path="/generate-project" element={<GenerateProjectPage />} />
          <Route path="/multiple-choice-quiz" element={<MultipleChoiceQuizPage />} />
          <Route path="/open-ended-quiz" element={<OpenEndedQuizPage />} />
        </Routes>
      </div>
      <ChatbotSidebar />
    </div>
  )
}

export default App;
