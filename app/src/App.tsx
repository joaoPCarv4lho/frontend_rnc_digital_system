import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/useAuth';
import RegisterPage from './pages/Register.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import LoginPage from './pages/Login.tsx'
import OperatorRNCPage from './pages/OperatorRNC.tsx'
import { PrivateRouter } from './components/PrivateRouter.tsx';

function App() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  return (
      <Routes>
        <Route path='/' element={<Navigate to={"/login"} />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/operador' 
        element={
        <PrivateRouter>
          <OperatorRNCPage />
        </PrivateRouter>} />

        <Route path='/admin' 
        element={
          <PrivateRouter>
            {isAdmin ? <AdminDashboard /> : <Navigate to={"/login"} />}
          </PrivateRouter>} />
      </Routes>
  );
}

export default App
