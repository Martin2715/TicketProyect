import { useEffect, useState } from 'react';
import api from '../api';

function CrudPage({ title, endpoint, fields }) {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await api.get(`/${endpoint}`);
    setItems(data.data || []);
  };

  useEffect(() => {
    const initial = {};
    fields.forEach((f) => (initial[f.key] = ''));
    setForm(initial);
    load();
  }, [endpoint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/${endpoint}`, form);
      setMsg('✅ Creado correctamente');
      setShowModal(false);
      const initial = {};
      fields.forEach((f) => (initial[f.key] = ''));
      setForm(initial);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Error'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar?')) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      load();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'No se puede eliminar'));
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>{title}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} onClick={() => setMsg('')}>{msg}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {fields.map((f) => <th key={f.key}>{f.label}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={fields.length + 2} className="empty">No hay registros</td></tr>
              ) : items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  {fields.map((f) => (
                    <td key={f.key}>
                      {f.key === 'active'
                        ? <span className={`badge ${item[f.key] ? 'badge-closed' : 'badge-high'}`}>{item[f.key] ? 'Activo' : 'Inactivo'}</span>
                        : item[f.key] ?? '—'}
                    </td>
                  ))}
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>🗑 Eliminar</button>
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
            <h2>Nuevo registro</h2>
            <form onSubmit={handleSubmit}>
              {fields.filter((f) => f.key !== 'active').map((f) => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    value={form[f.key] || ''}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                  />
                </div>
              ))}
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

export function Careers() {
  return <CrudPage
    title="🎓 Carreras"
    endpoint="careers"
    fields={[
      { key: 'name', label: 'Nombre', required: true },
      { key: 'active', label: 'Estado' },
    ]}
  />;
}

export function Types() {
  return <CrudPage
    title="🏷️ Tipos de Ticket"
    endpoint="types"
    fields={[
      { key: 'type', label: 'Tipo', required: true },
      { key: 'description', label: 'Descripción' },
      { key: 'area', label: 'Área' },
    ]}
  />;
}

export function Categories() {
  const [cats, setCats] = useState([]);
  const [cats2, setCats2] = useState(null);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCats(data.data || []));
  }, []);

  return (
    <>
      <div className="page-header"><h1>📂 Categorías</h1></div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th></tr></thead>
            <tbody>
              {cats.length === 0
                ? <tr><td colSpan={3} className="empty">No hay categorías</td></tr>
                : cats.map((c) => (
                  <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.description || '—'}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
