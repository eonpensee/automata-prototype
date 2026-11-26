import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import '../placeholders.css'
import App3 from './App3'

createRoot(document.getElementById('root')!).render(<StrictMode><App3 /></StrictMode>)
