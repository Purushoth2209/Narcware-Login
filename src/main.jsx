import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'  // Import App component

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />  {/* No need for <BrowserRouter> here */}
  </StrictMode>,
)
