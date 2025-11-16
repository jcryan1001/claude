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
      {/* Animated background blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      {/* Particle system */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.life,
              background: `hsl(${(particle.x + particle.y) % 360}, 80%, 60%)`
            }}
          />
        ))}
      </div>

      {/* Mouse follower */}
      <div
        className="mouse-glow"
        style={{
          left: mousePos.x,
          top: mousePos.y
        }}
      />

      <div className="content">
        <h1 className="magical-title">
          <span className="letter">M</span>
          <span className="letter">A</span>
          <span className="letter">G</span>
          <span className="letter">I</span>
          <span className="letter">C</span>
          <span className="letter">A</span>
          <span className="letter">L</span>
        </h1>

        <p className="subtitle">Experience the wonder of interactive design</p>

        <div className="cards-container">
          <div
            className="glass-card"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleCardClick}
          >
            <div className="card-icon">✨</div>
            <h3>Create Magic</h3>
            <p>Click to unleash particle explosion</p>
          </div>

          <div className="glass-card floating">
            <div className="card-icon">🌟</div>
            <h3>Move Your Mouse</h3>
            <p>Watch the particles follow you</p>
          </div>

          <div className="glass-card">
            <div className="card-icon">🎨</div>
            <h3>Pure CSS & React</h3>
            <p>No heavy libraries needed</p>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-value">{particles.length}</div>
            <div className="stat-label">Active Particles</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Math.round(mousePos.x)}</div>
            <div className="stat-label">X Position</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{Math.round(mousePos.y)}</div>
            <div className="stat-label">Y Position</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
