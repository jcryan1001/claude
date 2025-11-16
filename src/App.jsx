import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <p>This is a modern React application built with Vite</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </button>
        </div>
      </header>
    </div>
  )
}

export default App
