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
      {/* Dynamic background with grid */}
      <div className="ai-background"></div>
      <div className="cyber-grid"></div>

      {/* Particle field */}
      <div className="particle-field">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--i': i,
              '--tx': Math.random() * 200 - 100,
              '--ty': Math.random() * 200 - 100
            }}
          ></div>
        ))}
      </div>

      {/* Central AI Entity */}
      <div className="ai-container">
        <div className={`ai-entity ${aiState}`}>
          {/* Holographic scan lines */}
          <div className="holo-scan"></div>
          <div className="holo-scan-2"></div>

          {/* Multiple rotating geometric shapes */}
          <div className="geo-shape octahedron"></div>
          <div className="geo-shape cube"></div>
          <div className="geo-shape tetrahedron"></div>

          {/* Core energy sphere */}
          <div className="energy-core">
            <div className="core-inner"></div>
            <div className="core-glow"></div>
          </div>

          {/* Data streams flowing around */}
          <div className="data-streams">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="data-stream" style={{ '--stream-i': i }}></div>
            ))}
          </div>

          {/* IDLE - Constellation pattern */}
          {aiState === 'idle' && (
            <div className="constellation">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="star" style={{ '--star-i': i }}></div>
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="connection-line" style={{ '--line-i': i }}></div>
              ))}
            </div>
          )}

          {/* LISTENING - Sound spectrum bars */}
          {aiState === 'listening' && (
            <div className="sound-spectrum">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="spectrum-bar" style={{ '--bar-i': i }}></div>
              ))}
            </div>
          )}

          {/* SPEAKING - Fractal waves */}
          {aiState === 'speaking' && (
            <div className="fractal-system">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="fractal-ring" style={{ '--frac-i': i }}></div>
              ))}
              <div className="voice-pulse"></div>
            </div>
          )}

          {/* THINKING - Neural web */}
          {aiState === 'thinking' && (
            <div className="neural-web">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="neural-node" style={{ '--node-i': i }}>
                  <div className="node-pulse"></div>
                </div>
              ))}
              {[...Array(12)].map((_, i) => (
                <div key={i} className="neural-link" style={{ '--link-i': i }}></div>
              ))}
            </div>
          )}

          {/* Energy tendrils */}
          <div className="energy-tendrils">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="tendril" style={{ '--tendril-i': i }}></div>
            ))}
          </div>
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
