import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [aiState, setAiState] = useState('idle') // idle, listening, speaking, thinking
  const [time, setTime] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatClosing, setChatClosing] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef(null)

  // Animate time for smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCloseChat = () => {
    setChatClosing(true)
    setTimeout(() => {
      setChatOpen(false)
      setChatClosing(false)
      setMessages([]) // Clear messages after closing animation
    }, 400) // Wait for fade out animation
  }

  const stateConfig = {
    idle: { label: 'Resting', color: '#60a5fa', description: 'AI is in idle mode' },
    listening: { label: 'Listening', color: '#34d399', description: 'Actively receiving input' },
    speaking: { label: 'Speaking', color: '#f472b6', description: 'Generating response' },
    thinking: { label: 'Thinking', color: '#a78bfa', description: 'Processing information' }
  }

  // API Placeholder Functions
  const callLLMAPI = async (userMessage) => {
    // TODO: Replace with actual LLM API call (OpenAI, Anthropic, etc.)
    // Example: const response = await fetch('https://api.openai.com/v1/chat/completions', {...})

    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock response
    return `AI Response to: "${userMessage}"`
  }

  const textToSpeech = async (text) => {
    // TODO: Replace with actual TTS API call
    // Example: Web Speech API or external TTS service
    // const utterance = new SpeechSynthesisUtterance(text)
    // window.speechSynthesis.speak(utterance)

    console.log('TTS:', text)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const voiceToText = async () => {
    // TODO: Replace with actual STT API call
    // Example: Web Speech API or external STT service
    // const recognition = new webkitSpeechRecognition()
    // recognition.start()

    console.log('Voice input started...')
    return 'Voice input placeholder'
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return

    const userMessage = inputText.trim()
    setInputText('')
    setIsProcessing(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Set state to listening
    setAiState('listening')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Set state to thinking
    setAiState('thinking')

    try {
      // Call LLM API
      const aiResponse = await callLLMAPI(userMessage)

      // Add AI response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      // Set state to speaking
      setAiState('speaking')

      // Convert response to speech
      await textToSpeech(aiResponse)

    } catch (error) {
      console.error('Error processing message:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing your request.' }])
    } finally {
      // Return to idle
      setAiState('idle')
      setIsProcessing(false)
    }
  }

  // Handle voice input
  const handleVoiceInput = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    setAiState('listening')

    try {
      const voiceText = await voiceToText()
      setInputText(voiceText)
      // Auto-send after voice input (optional)
      // await handleSendMessage()
    } catch (error) {
      console.error('Error with voice input:', error)
    } finally {
      setAiState('idle')
      setIsProcessing(false)
    }
  }

  return (
    <div className={`App ${chatOpen ? 'chat-open' : ''} ${chatClosing ? 'chat-closing' : ''}`}>
      {/* Animated background */}
      <div className="simple-bg"></div>

      {/* Orb Section - Left Side */}
      <div className="orb-section">
        <div className="ai-container">
        <div className={`ai-orb ${aiState}`}>
          {/* Main glowing 3D orb */}
          <div className="orb-core">
            <div className="orb-surface"></div>
            <div className="orb-highlight"></div>
          </div>

          {/* Wave ripples around the orb */}
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>

          {/* Rotating rings */}
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>

          {/* Orbiting dots */}
          <div className="orbit-dot dot-1"></div>
          <div className="orbit-dot dot-2"></div>
          <div className="orbit-dot dot-3"></div>
        </div>

        {/* State indicator */}
        <div className="state-indicator">
          <div className="state-label" style={{ color: stateConfig[aiState].color }}>
            {stateConfig[aiState].label}
          </div>
          <div className="state-description">{stateConfig[aiState].description}</div>
        </div>

        {/* Mode controls */}
        <div className="mode-controls">
          <button
            className={`mode-btn ${aiState === 'idle' ? 'active' : ''}`}
            onClick={() => setAiState('idle')}
          >
            Idle
          </button>
          <button
            className={`mode-btn ${aiState === 'listening' ? 'active' : ''}`}
            onClick={() => setAiState('listening')}
          >
            Listen
          </button>
          <button
            className={`mode-btn ${aiState === 'speaking' ? 'active' : ''}`}
            onClick={() => setAiState('speaking')}
          >
            Speak
          </button>
          <button
            className={`mode-btn ${aiState === 'thinking' ? 'active' : ''}`}
            onClick={() => setAiState('thinking')}
          >
            Think
          </button>
        </div>

        {/* Info panel */}
        <div className="info-panel">
          <div className="info-item">
            <span className="info-label">Status</span>
            <span className="info-value">Active</span>
          </div>
          <div className="info-item">
            <span className="info-label">Uptime</span>
            <span className="info-value">{Math.floor(time / 20)}s</span>
          </div>
        </div>
        </div>
      </div>

      {/* Chat Section - Right Side */}
      <div className="chat-section">
        <div className="chat-container">
          <div className="chat-header">
            <h3>AI Chat</h3>
            <button className="close-chat-btn" onClick={handleCloseChat}>×</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">Start a conversation...</div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.role}`}>
                    <div className="message-content">{msg.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="chat-input-container">
            <button
              className="voice-btn"
              onClick={handleVoiceInput}
              disabled={isProcessing}
              title="Voice Input"
            >
              🎤
            </button>

            <input
              type="text"
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              disabled={isProcessing}
            />

            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={isProcessing || !inputText.trim()}
            >
              {isProcessing ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Toggle Button */}
      <button
        className={`chat-toggle-btn ${chatOpen ? 'open' : ''}`}
        onClick={() => chatOpen ? handleCloseChat() : setChatOpen(true)}
        aria-label={chatOpen ? 'Close chat' : 'Open chat'}
      />
    </div>
  )
}

export default App
