import { useEffect, useState } from 'react';
import api from '../api';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [types, setTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', title: '' });
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type_id: '', priority: 'medium' });
  const [assignForm, setAssignForm] = useState({ id_ticket: '', id_user: '' });
  const [msg, setMsg] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.title) params.append('title', filters.title);
    const [t, ty, u] = await Promise.all([
      api.get(`/tickets/filter?${params}`),
      api.get('/types'),
      api.get('/users?limit=100'),
    ]);
    setTickets(t.data.data || []);
    setTypes(ty.data.data || []);
    setUsers((u.data.data || []).filter((u) => u.rol === 'dev'));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', form);
      setMsg('✅ Ticket creado');
      setShowModal(false);
      setForm({ title: '', description: '', type_id: '', priority: 'medium' });
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar ticket?')) return;
    await api.delete(`/tickets/${id}`);
    load();
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets/assign', assignForm);
      setMsg('✅ Ticket asignado');
      setShowAssign(false);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const statusBadge = (s) => {
    if (s === 'open') return <span className="badge badge-open">Abierto</span>;
    if (s === 'in_progress') return <span className="badge badge-progress">En progreso</span>;
    return <span className="badge badge-closed">Cerrado</span>;
  };

  return (
    <>
      <div className="page-header">
        <h1>🎫 Tickets</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {['admin', 'dev'].includes(user.rol) && (
            <button className="btn btn-warning" onClick={() => setShowAssign(true)}>Asignar Ticket</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Ticket</button>
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} onClick={() => setMsg('')}>{msg}</div>}

      {/* Filtros */}
      <div className="filter-bar">
        <input placeholder="Buscar título..." value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En progreso</option>
          <option value="closed">Cerrado</option>
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">Todas las prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={load}>Filtrar</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Título</th><th>Tipo</th><th>Estado</th><th>Prioridad</th><th>Creado por</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={7} className="empty">No hay tickets</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.type_name || '—'}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td><span className={`badge badge-${t.priority}`}>{t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja'}</span></td>
                  <td>{t.created_by_name}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    {t.status !== 'closed' && (
                      <select className="btn btn-sm" style={{ background: '#f1f5f9' }}
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}>
                        <option value="open">Abierto</option>
                        <option value="in_progress">En progreso</option>
                        <option value="closed">Cerrado</option>
                      </select>
                    )}
                    {user.rol === 'admin' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Ticket */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Ticket</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Título *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripción *</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select value={form.type_id} onChange={(e) => setForm({ ...form, type_id: e.target.value })}>
                    <option value="">Sin tipo</option>
                    {types.map((t) => <option key={t.id} value={t.id}>{t.type}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridad</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Ticket */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Asignar Ticket a Desarrollador</h2>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label>Ticket</label>
                <select value={assignForm.id_ticket} onChange={(e) => setAssignForm({ ...assignForm, id_ticket: e.target.value })} required>
                  <option value="">Seleccionar ticket</option>
                  {tickets.map((t) => <option key={t.id} value={t.id}>#{t.id} - {t.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Desarrollador</label>
                <select value={assignForm.id_user} onChange={(e) => setAssignForm({ ...assignForm, id_user: e.target.value })} required>
                  <option value="">Seleccionar dev</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} {u.last_name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowAssign(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Asignar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
