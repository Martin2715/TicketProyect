import { useEffect, useState } from 'react';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [careers, setCareers] = useState([]);
  const [filters, setFilters] = useState({ name: '', email: '', rol: '' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', last_name: '', username: '', email: '', password: '', career_id: '', rol: 'user' });
  const [msg, setMsg] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.email) params.append('email', filters.email);
    if (filters.rol) params.append('rol', filters.rol);
    const [u, c] = await Promise.all([
      api.get(`/users/filter?${params}`),
      api.get('/careers'),
    ]);
    setUsers(u.data.data || []);
    setCareers(c.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setMsg('✅ Usuario creado');
      setShowModal(false);
      setForm({ name: '', last_name: '', username: '', email: '', password: '', career_id: '', rol: 'user' });
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const toggleStatus = async (u) => {
    try {
      await api.patch(`/users/${u.id}/status`, { active: !u.active });
      load();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <>
      <div className="page-header">
        <h1>👥 Usuarios</h1>
        {currentUser.rol === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Usuario</button>
        )}
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="filter-bar">
        <input placeholder="Nombre..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        <input placeholder="Email..." value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        <select value={filters.rol} onChange={(e) => setFilters({ ...filters, rol: e.target.value })}>
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="dev">Dev</option>
          <option value="user">User</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={load}>Filtrar</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Nombre</th><th>Username</th><th>Email</th><th>Carrera</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={8} className="empty">No hay usuarios</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name} {u.last_name}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.career || '—'}</td>
                  <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-closed' : 'badge-high'}`}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    {currentUser.rol === 'admin' && (
                      <>
                        <button className={`btn btn-sm ${u.active ? 'btn-warning' : 'btn-success'}`} onClick={() => toggleStatus(u)}>
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nuevo Usuario</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Nombre *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label>Apellido *</label><input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Username *</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Contraseña *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
                <div className="form-group">
                  <label>Carrera *</label>
                  <select value={form.career_id} onChange={(e) => setForm({ ...form, career_id: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    {careers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="user">User</option>
                  <option value="dev">Dev</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
