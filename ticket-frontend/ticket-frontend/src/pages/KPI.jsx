import { useEffect, useState } from 'react';
import api from '../api';

export default function KPI() {
  const [byStatus, setByStatus] = useState([]);
  const [byUser, setByUser] = useState([]);
  const [avgTime, setAvgTime] = useState(null);
  const [byPriority, setByPriority] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/kpi/tickets/status'),
      api.get('/kpi/tickets/user'),
      api.get('/kpi/tickets/avg-time'),
      api.get('/kpi/tickets/priority'),
    ]).then(([s, u, a, p]) => {
      setByStatus(s.data.data || []);
      setByUser(u.data.data || []);
      setAvgTime(a.data.data || {});
      setByPriority(p.data.data || []);
    });
  }, []);

  const statusLabel = (s) => s === 'open' ? '🔵 Abierto' : s === 'in_progress' ? '🟡 En progreso' : '🟢 Cerrado';
  const priorityLabel = (p) => p === 'high' ? '🔴 Alta' : p === 'medium' ? '🟡 Media' : '🟢 Baja';

  return (
    <>
      <div className="page-header"><h1>📈 KPI - Métricas</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Por estado */}
        <div className="card">
          <h2 style={{ marginBottom: 14, fontSize: '1rem' }}>Tickets por Estado</h2>
          <table>
            <thead><tr><th>Estado</th><th>Total</th></tr></thead>
            <tbody>
              {byStatus.map((s) => (
                <tr key={s.status}>
                  <td>{statusLabel(s.status)}</td>
                  <td><strong>{s.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Por prioridad */}
        <div className="card">
          <h2 style={{ marginBottom: 14, fontSize: '1rem' }}>Tickets por Prioridad</h2>
          <table>
            <thead><tr><th>Prioridad</th><th>Total</th></tr></thead>
            <tbody>
              {byPriority.map((p) => (
                <tr key={p.priority}>
                  <td>{priorityLabel(p.priority)}</td>
                  <td><strong>{p.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tiempo promedio */}
      {avgTime && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 14, fontSize: '1rem' }}>⏱ Tiempo Promedio de Resolución</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{avgTime.total_tickets || 0}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#22c55e' }}>{avgTime.closed_tickets || 0}</div>
              <div className="stat-label">Tickets Cerrados</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#f59e0b' }}>
                {avgTime.avg_hours_to_close ? Math.round(avgTime.avg_hours_to_close) : '—'}
              </div>
              <div className="stat-label">Horas Promedio</div>
            </div>
          </div>
        </div>
      )}

      {/* Por usuario */}
      <div className="card">
        <h2 style={{ marginBottom: 14, fontSize: '1rem' }}>Tickets por Usuario</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Usuario</th><th>Total</th><th>Abiertos</th><th>En Progreso</th><th>Cerrados</th></tr>
            </thead>
            <tbody>
              {byUser.filter((u) => u.total_tickets > 0).map((u) => (
                <tr key={u.id}>
                  <td>{u.name} {u.last_name} <span style={{ color: '#94a3b8' }}>@{u.username}</span></td>
                  <td><strong>{u.total_tickets}</strong></td>
                  <td><span className="badge badge-open">{u.open_tickets}</span></td>
                  <td><span className="badge badge-progress">{u.in_progress_tickets}</span></td>
                  <td><span className="badge badge-closed">{u.closed_tickets}</span></td>
                </tr>
              ))}
              {byUser.filter((u) => u.total_tickets > 0).length === 0 && (
                <tr><td colSpan={5} className="empty">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
