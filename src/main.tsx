import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove StrictMode temporarily to avoid double rendering issues
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
