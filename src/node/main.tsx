import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import '../placeholders.css'
import App from './NodeApp'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
