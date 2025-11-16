import React, { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [time, setTime] = useState(0)
  const [selectedPlanet, setSelectedPlanet] = useState(null)

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Animate time for orbiting elements
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => (prev + 0.5) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const planets = [
    { name: 'Mercury', color: '#8C7853', size: 40, orbitSpeed: 1.2, distance: 80 },
    { name: 'Venus', color: '#FFC649', size: 60, orbitSpeed: 0.8, distance: 120 },
    { name: 'Earth', color: '#4A90E2', size: 65, orbitSpeed: 0.6, distance: 160 },
    { name: 'Mars', color: '#E27B58', size: 50, orbitSpeed: 0.4, distance: 200 }
  ]

  return (
    <div className="App" style={{
      transform: `translate(${(mousePos.x - 50) * 0.02}px, ${(mousePos.y - 50) * 0.02}px)`
    }}>
      {/* Animated Starfield */}
      <div className="stars-layer stars-small"></div>
      <div className="stars-layer stars-medium"></div>
      <div className="stars-layer stars-large"></div>

      {/* Nebula clouds */}
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      <div className="nebula nebula-3"></div>

      {/* Aurora effect */}
      <div className="aurora"></div>

      {/* Central Sun */}
      <div className="sun">
        <div className="sun-core"></div>
        <div className="sun-corona"></div>
      </div>

      {/* Orbital system */}
      <div className="solar-system">
        {planets.map((planet, index) => {
          const angle = time * planet.orbitSpeed + (index * 90)
          const radian = (angle * Math.PI) / 180
          const x = Math.cos(radian) * planet.distance
          const y = Math.sin(radian) * planet.distance * 0.3

          return (
            <div key={planet.name}>
              {/* Orbit ring */}
              <div
                className="orbit-ring"
                style={{
                  width: planet.distance * 2,
                  height: planet.distance * 2 * 0.3,
                }}
              ></div>

              {/* Planet */}
              <div
                className={`planet ${selectedPlanet === planet.name ? 'planet-selected' : ''}`}
                style={{
                  width: planet.size,
                  height: planet.size,
                  background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}dd)`,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  boxShadow: `0 0 ${planet.size}px ${planet.color}88, inset -${planet.size/4}px -${planet.size/4}px ${planet.size/2}px rgba(0,0,0,0.5)`
                }}
                onClick={() => setSelectedPlanet(planet.name)}
              >
                <div className="planet-glow" style={{ background: planet.color }}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="cosmic-content">
        <h1 className="cosmic-title">
          <span className="title-word">COSMIC</span>
          <span className="title-word">EXPLORER</span>
        </h1>

        <p className="cosmic-subtitle">Journey Through the Digital Universe</p>

        {/* Orbital cards */}
        <div className="orbital-cards">
          <div className="cosmic-card" data-tilt="left">
            <div className="card-shine"></div>
            <div className="card-planet-icon">🌍</div>
            <h3>Discover Worlds</h3>
            <p>Explore infinite planetary systems</p>
            <div className="card-stats">
              <span>4 Planets</span>
              <span>∞ Stars</span>
            </div>
          </div>

          <div className="cosmic-card" data-tilt="center">
            <div className="card-shine"></div>
            <div className="card-planet-icon">🌌</div>
            <h3>Navigate Space</h3>
            <p>Chart your course through nebulas</p>
            <div className="card-stats">
              <span>3D Orbits</span>
              <span>Real-time</span>
            </div>
          </div>

          <div className="cosmic-card" data-tilt="right">
            <div className="card-shine"></div>
            <div className="card-planet-icon">⭐</div>
            <h3>Pure CSS Magic</h3>
            <p>No libraries, just imagination</p>
            <div className="card-stats">
              <span>60 FPS</span>
              <span>Responsive</span>
            </div>
          </div>
        </div>

        {/* Info panel */}
        {selectedPlanet && (
          <div className="planet-info">
            <h4>{selectedPlanet}</h4>
            <p>Selected Planet</p>
            <button onClick={() => setSelectedPlanet(null)}>Close</button>
          </div>
        )}

        {/* Coordinates */}
        <div className="space-coords">
          <div className="coord-item">
            <span className="coord-label">X-Axis</span>
            <span className="coord-value">{Math.round(mousePos.x)}°</span>
          </div>
          <div className="coord-item">
            <span className="coord-label">Y-Axis</span>
            <span className="coord-value">{Math.round(mousePos.y)}°</span>
          </div>
          <div className="coord-item">
            <span className="coord-label">Rotation</span>
            <span className="coord-value">{Math.round(time)}°</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
