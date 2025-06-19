import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Remove StrictMode temporarily to avoid double rendering issues
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)
