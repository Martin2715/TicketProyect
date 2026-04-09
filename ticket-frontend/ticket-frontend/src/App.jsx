import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import { Careers, Types, Categories } from './pages/Catalogs';
import KPI from './pages/KPI';

// Protege rutas: si no hay token, redirige al login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="tickets"    element={<Tickets />} />
          <Route path="users"      element={<Users />} />
          <Route path="careers"    element={<Careers />} />
          <Route path="types"      element={<Types />} />
          <Route path="categories" element={<Categories />} />
          <Route path="kpi"        element={<KPI />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
