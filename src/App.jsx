import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [aiState, setAiState] = useState('idle') // idle, listening, speaking, thinking
  const [time, setTime] = useState(0)

  // Animate time for smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 1)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  // Auto-cycle through states for demo (optional - can remove)
  useEffect(() => {
    const states = ['idle', 'listening', 'speaking', 'thinking']
    let currentIndex = 0

    const cycleInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length
      setAiState(states[currentIndex])
    }, 5000) // Change state every 5 seconds

    return () => clearInterval(cycleInterval)
  }, [])

  const stateConfig = {
    idle: { label: 'Resting', color: '#60a5fa', description: 'AI is in idle mode' },
    listening: { label: 'Listening', color: '#34d399', description: 'Actively receiving input' },
    speaking: { label: 'Speaking', color: '#f472b6', description: 'Generating response' },
    thinking: { label: 'Thinking', color: '#a78bfa', description: 'Processing information' }
  }

  return (
    <div className="App">
      {/* Subtle background gradient */}
      <div className="ai-background"></div>

      {/* Central AI Entity */}
      <div className="ai-container">
        <div className={`ai-entity ${aiState}`}>
          {/* Core orb */}
          <div className="ai-core"></div>

          {/* Listening mode - ripples inward */}
          {aiState === 'listening' && (
            <>
              <div className="sound-wave wave-1"></div>
              <div className="sound-wave wave-2"></div>
              <div className="sound-wave wave-3"></div>
            </>
          )}

          {/* Speaking mode - ripples outward */}
          {aiState === 'speaking' && (
            <>
              <div className="speak-wave wave-1"></div>
              <div className="speak-wave wave-2"></div>
              <div className="speak-wave wave-3"></div>
              <div className="speak-wave wave-4"></div>
            </>
          )}

          {/* Thinking mode - neural connections */}
          {aiState === 'thinking' && (
            <div className="neural-network">
              <div className="neural-ring ring-1"></div>
              <div className="neural-ring ring-2"></div>
              <div className="neural-ring ring-3"></div>
              <div className="neural-dots">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="neural-dot" style={{ '--i': i }}></div>
                ))}
              </div>
            </div>
          )}

          {/* Idle mode - gentle pulse */}
          {aiState === 'idle' && (
            <>
              <div className="idle-ring ring-1"></div>
              <div className="idle-ring ring-2"></div>
            </>
          )}
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
            <span className="mode-icon">◉</span>
            Idle
          </button>
          <button
            className={`mode-btn ${aiState === 'listening' ? 'active' : ''}`}
            onClick={() => setAiState('listening')}
          >
            <span className="mode-icon">⊙</span>
            Listen
          </button>
          <button
            className={`mode-btn ${aiState === 'speaking' ? 'active' : ''}`}
            onClick={() => setAiState('speaking')}
          >
            <span className="mode-icon">◎</span>
            Speak
          </button>
          <button
            className={`mode-btn ${aiState === 'thinking' ? 'active' : ''}`}
            onClick={() => setAiState('thinking')}
          >
            <span className="mode-icon">◈</span>
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
          <div className="info-item">
            <span className="info-label">Performance</span>
            <span className="info-value">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
