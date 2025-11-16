import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [particles, setParticles] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const canvasRef = useRef(null)

  // Create particles that follow the mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })

      // Create new particle
      const newParticle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        life: 1
      }

      setParticles(prev => [...prev.slice(-50), newParticle])
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.speedX,
            y: p.y + p.speedY,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      )
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const handleCardClick = () => {
    // Create explosion of particles
    const explosionParticles = Array.from({ length: 30 }, () => ({
      id: Date.now() + Math.random(),
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: Math.random() * 8 + 3,
      speedX: (Math.random() - 0.5) * 15,
      speedY: (Math.random() - 0.5) * 15,
      life: 1
    }))

    setParticles(prev => [...prev, ...explosionParticles])
  }

  return (
    <div className="App">
      {/* Retro grid background */}
      <div className="retro-grid"></div>
      <div className="retro-sun"></div>

      {/* CRT scanlines effect */}
      <div className="scanlines"></div>
      <div className="vhs-effect"></div>

      {/* Neon particles */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle neon-particle"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 3}px #ff00ff, 0 0 ${particle.size * 5}px #00ffff`
            }}
          />
        ))}
      </div>

      {/* Neon cursor glow */}
      <div
        className="cursor-glow"
        style={{
          left: mousePos.x,
          top: mousePos.y
        }}
      />

      <div className="content">
        {/* Retro header with VHS glitch */}
        <div className="retro-header">
          <div className="glitch-text">
            <span className="glitch-layer">R E T R O</span>
            <span className="glitch-layer">R E T R O</span>
            <span className="glitch-layer">R E T R O</span>
          </div>
          <div className="year-badge">[ 1 9 8 7 ]</div>
        </div>

        <p className="subtitle terminal-text">&gt;&gt; WELCOME TO THE DIGITAL FUTURE &lt;&lt;</p>

        {/* Retro arcade cards */}
        <div className="cards-container">
          <div
            className="retro-card"
            onClick={handleCardClick}
          >
            <div className="card-corner tl"></div>
            <div className="card-corner tr"></div>
            <div className="card-corner bl"></div>
            <div className="card-corner br"></div>
            <div className="card-icon retro-icon">▲</div>
            <h3>ARCADE MODE</h3>
            <p>PRESS TO ACTIVATE</p>
            <div className="blink-text">█ READY █</div>
          </div>

          <div className="retro-card neon-pulse">
            <div className="card-corner tl"></div>
            <div className="card-corner tr"></div>
            <div className="card-corner bl"></div>
            <div className="card-corner br"></div>
            <div className="card-icon retro-icon">♦</div>
            <h3>NEON TRAILS</h3>
            <p>MOVE CURSOR</p>
            <div className="blink-text">█ ACTIVE █</div>
          </div>

          <div className="retro-card">
            <div className="card-corner tl"></div>
            <div className="card-corner tr"></div>
            <div className="card-corner bl"></div>
            <div className="card-corner br"></div>
            <div className="card-icon retro-icon">◆</div>
            <h3>SYNTHWAVE</h3>
            <p>PURE VIBES</p>
            <div className="blink-text">█ ONLINE █</div>
          </div>
        </div>

        {/* Retro terminal stats */}
        <div className="terminal-stats">
          <div className="stat-row">
            <span className="stat-label-retro">[PARTICLES]</span>
            <span className="stat-value-retro">{particles.length.toString().padStart(3, '0')}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label-retro">[COORD-X]</span>
            <span className="stat-value-retro">{Math.round(mousePos.x).toString().padStart(4, '0')}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label-retro">[COORD-Y]</span>
            <span className="stat-value-retro">{Math.round(mousePos.y).toString().padStart(4, '0')}</span>
          </div>
        </div>

        <div className="footer-text">
          ◢◤◢◤◢◤ SYSTEM OPERATIONAL ◢◤◢◤◢◤
        </div>
      </div>
    </div>
  )
}

export default App
