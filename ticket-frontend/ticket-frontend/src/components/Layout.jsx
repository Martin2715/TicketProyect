import { NavLink, useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">🎫 Ticket System</div>
        <nav>
          <NavLink to="/dashboard">📊 Dashboard</NavLink>
          <NavLink to="/tickets">🎫 Tickets</NavLink>
          <NavLink to="/users">👥 Usuarios</NavLink>
          <NavLink to="/careers">🎓 Carreras</NavLink>
          <NavLink to="/types">🏷️ Tipos</NavLink>
          <NavLink to="/categories">📂 Categorías</NavLink>
          <NavLink to="/kpi">📈 KPI</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div>👤 {user.name} {user.last_name}</div>
          <div style={{ marginTop: 2 }}>
            <span className={`badge badge-${user.rol}`}>{user.rol}</span>
          </div>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
