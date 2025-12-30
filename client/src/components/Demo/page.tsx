import React, { useState, useRef, useEffect } from 'react';
import './DemoPage.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const DemoPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8086/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("RAG Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="demo-container">
      {/* Sidebar for RAG Context */}
      <aside className="knowledge-base">
        <h3>Knowledge Base</h3>
        <p className="subtitle">Upload docs to provide context for the LLM</p>
        <div className="upload-section">
          <input type="file" id="file-upload" hidden />
          <label htmlFor="file-upload" className="upload-label">
            <span>+ Add Document</span>
          </label>
        </div>
        <div className="doc-list">
          <div className="doc-item">📄 product_specs.pdf</div>
          <div className="doc-item">📄 user_manual_v2.pdf</div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-interface">
        <header className="chat-header">
          <h2>RAG LLM Implementation Demo</h2>
          <span className="status-badge">Live Interface</span>
        </header>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.role}`}>
              <div className="message-content">{msg.content}</div>
              {msg.sources && (
                <div className="sources-list">
                  Sources: {msg.sources.join(', ')}
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="loader">AI is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-send" disabled={isLoading}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default DemoPage;