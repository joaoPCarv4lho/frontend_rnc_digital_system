import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

import { AuthProvider } from './context/AuthContext.tsx'
import { PrivateRouter } from './components/PrivateRouter.tsx'
import Register from './pages/Register.tsx'
import RNCList from './pages/RNCList.tsx'
import Login from './pages/Login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/rncs" element={<PrivateRouter><RNCList /></PrivateRouter>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
