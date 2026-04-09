const { pool } = require('../config/db');
const { logToDB } = require('../middlewares/logger');

// POST /tickets
const createTicket = async (req, res, next) => {
  try {
    const { title, description, type_id, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Los campos title y description son requeridos.' });
    }

    const [result] = await pool.query(
      'INSERT INTO tickets (title, description, type_id, priority, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, type_id || null, priority || 'medium', req.user.id]
    );

    await logToDB(req.user.id, 'CREATE_TICKET', 'tickets', result.insertId, { title });
    res.status(201).json({ message: 'Ticket creado correctamente.', ticketId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// GET /tickets
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, type_id, created_by } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `SELECT t.*, ty.type AS type_name, u.name AS created_by_name, u.username
                 FROM tickets t
                 LEFT JOIN types ty ON t.type_id = ty.id
                 LEFT JOIN users u ON t.created_by = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (type_id) { query += ' AND t.type_id = ?'; params.push(type_id); }
    if (created_by) { query += ' AND t.created_by = ?'; params.push(created_by); }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) AS total FROM tickets WHERE 1=1';
    const countParams = [];
    if (status) { countQuery += ' AND status = ?'; countParams.push(status); }
    if (priority) { countQuery += ' AND priority = ?'; countParams.push(priority); }
    if (type_id) { countQuery += ' AND type_id = ?'; countParams.push(type_id); }
    if (created_by) { countQuery += ' AND created_by = ?'; countParams.push(created_by); }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ data: rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// GET /tickets/filter
const filterTickets = async (req, res, next) => {
  try {
    const { status, priority, type_id, created_by, title } = req.query;

    let query = `SELECT t.*, ty.type AS type_name, u.name AS created_by_name
                 FROM tickets t
                 LEFT JOIN types ty ON t.type_id = ty.id
                 LEFT JOIN users u ON t.created_by = u.id
                 WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND t.status = ?'; params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    if (type_id) { query += ' AND t.type_id = ?'; params.push(type_id); }
    if (created_by) { query += ' AND t.created_by = ?'; params.push(created_by); }
    if (title) { query += ' AND t.title LIKE ?'; params.push(`%${title}%`); }

    const [rows] = await pool.query(query, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

// GET /tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, ty.type AS type_name, ty.area,
              u.name AS created_by_name, u.username,
              GROUP_CONCAT(d.id) AS dev_ids,
              GROUP_CONCAT(CONCAT(d.name, ' ', d.last_name)) AS developers
       FROM tickets t
       LEFT JOIN types ty ON t.type_id = ty.id
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN tickets_devs td ON t.id = td.id_ticket
       LEFT JOIN users d ON td.id_user = d.id
       WHERE t.id = ?
       GROUP BY t.id`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /tickets/:id
const updateTicket = async (req, res, next) => {
  try {
    const { title, description, type_id, priority } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (type_id) updates.type_id = type_id;
    if (priority) updates.priority = priority;

    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No se enviaron campos.' });

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    const [result] = await pool.query(`UPDATE tickets SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    await logToDB(req.user.id, 'UPDATE_TICKET', 'tickets', req.params.id, updates);
    res.json({ message: 'Ticket actualizado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// PATCH /tickets/:id/status
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}` });
    }

    const [result] = await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    await logToDB(req.user.id, 'STATUS_CHANGE', 'tickets', req.params.id, { status });
    res.json({ message: `Estado del ticket actualizado a: ${status}` });
  } catch (err) {
    next(err);
  }
};

// DELETE /tickets/:id
const deleteTicket = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    await logToDB(req.user.id, 'DELETE_TICKET', 'tickets', req.params.id);
    res.json({ message: 'Ticket eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// POST /tickets/assign
const assignTicket = async (req, res, next) => {
  try {
    const { id_ticket, id_user } = req.body;
    if (!id_ticket || !id_user) return res.status(400).json({ error: 'id_ticket e id_user son requeridos.' });

    // Verificar que el usuario sea dev
    const [userRows] = await pool.query('SELECT rol FROM users WHERE id = ?', [id_user]);
    if (userRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (userRows[0].rol !== 'dev') return res.status(400).json({ error: 'Solo se pueden asignar tickets a usuarios con rol dev.' });

    // Verificar que el ticket exista
    const [ticketRows] = await pool.query('SELECT id FROM tickets WHERE id = ?', [id_ticket]);
    if (ticketRows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    const [result] = await pool.query(
      'INSERT INTO tickets_devs (id_ticket, id_user) VALUES (?, ?) ON DUPLICATE KEY UPDATE assigned_at = NOW()',
      [id_ticket, id_user]
    );

    // Cambiar estado a in_progress
    await pool.query("UPDATE tickets SET status = 'in_progress' WHERE id = ?", [id_ticket]);

    await logToDB(req.user.id, 'ASSIGN_TICKET', 'tickets', id_ticket, { id_user });
    res.status(201).json({ message: 'Ticket asignado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// GET /tickets/user/:id
const getTicketsByUser = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, ty.type AS type_name
       FROM tickets t
       LEFT JOIN types ty ON t.type_id = ty.id
       WHERE t.created_by = ? OR t.id IN (
         SELECT id_ticket FROM tickets_devs WHERE id_user = ?
       )
       ORDER BY t.created_at DESC`,
      [req.params.id, req.params.id]
    );

    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket, getTickets, filterTickets, getTicketById,
  updateTicket, updateTicketStatus, deleteTicket, assignTicket, getTicketsByUser,
};
