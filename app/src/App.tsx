import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import RegisterPage from './pages/Register.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'
import QualityDashboard from './pages/QualityDashboard.tsx';
import LoginPage from './pages/Login.tsx'
import OperatorRNCPage from './pages/OperatorRNC.tsx'
import { PrivateRouter } from './components/PrivateRouter.tsx';
import EngineeringDashboard from './pages/EngineeringDashboard.tsx';

function App() {

  return (
    <>
      <Toaster position='top-right' />
      <Routes>
        <Route path='/' element={<Navigate to={"/login"} />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        
        <Route path='/operador'
          element={
            <PrivateRouter allowedRoles={["operador"]}>
              <OperatorRNCPage />
            </PrivateRouter>} />

        <Route path='/quality-dashboard' element={
          <PrivateRouter allowedRoles={["qualidade"]}>
            <QualityDashboard />
          </PrivateRouter>} />

        <Route path='/engineering-dashboard' element={
          <PrivateRouter allowedRoles={["engenharia"]}>
            <EngineeringDashboard />
          </PrivateRouter>} />

        <Route path='/admin'
          element={
            <PrivateRouter allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRouter>} />
      </Routes>
    </>
  );
}

export default App
