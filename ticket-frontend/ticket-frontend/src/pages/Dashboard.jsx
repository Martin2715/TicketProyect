import { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ open: 0, in_progress: 0, closed: 0 });
  const [users, setUsers] = useState(0);
  const [recentTickets, setRecentTickets] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const load = async () => {
      try {
        const [kpi, usersRes, ticketsRes] = await Promise.all([
          api.get('/kpi/tickets/status'),
          api.get('/users?limit=1'),
          api.get('/tickets?limit=5'),
        ]);

        const statusMap = {};
        kpi.data.data.forEach((s) => (statusMap[s.status] = s.total));
        setStats({
          open: statusMap['open'] || 0,
          in_progress: statusMap['in_progress'] || 0,
          closed: statusMap['closed'] || 0,
        });
        setUsers(usersRes.data.pagination?.total || 0);
        setRecentTickets(ticketsRes.data.data || []);
      } catch {}
    };
    load();
  }, []);

  const statusBadge = (s) => {
    if (s === 'open') return <span className="badge badge-open">Abierto</span>;
    if (s === 'in_progress') return <span className="badge badge-progress">En progreso</span>;
    return <span className="badge badge-closed">Cerrado</span>;
  };

  const priorityBadge = (p) => (
    <span className={`badge badge-${p}`}>{p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}</span>
  );

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Bienvenido, {user.name} 👋</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.open}</div>
          <div className="stat-label">Tickets Abiertos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.in_progress}</div>
          <div className="stat-label">En Progreso</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>{stats.closed}</div>
          <div className="stat-label">Cerrados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{users}</div>
          <div className="stat-label">Usuarios</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 14, fontSize: '1rem' }}>Tickets Recientes</h2>
        {recentTickets.length === 0 ? (
          <p className="empty">No hay tickets aún</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Creado por</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{statusBadge(t.status)}</td>
                    <td>{priorityBadge(t.priority)}</td>
                    <td>{t.created_by_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
