const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { logToDB } = require('../middlewares/logger');

// POST /users
const createUser = async (req, res, next) => {
  try {
    const { name, last_name, username, email, password, career_id, rol } = req.body;

    // Validar mínimo 6 campos
    const fields = [name, last_name, username, email, password, career_id];
    if (fields.some((f) => f === undefined || f === null || f === '')) {
      return res.status(400).json({ error: 'Se requieren mínimo 6 campos: name, last_name, username, email, password, career_id.' });
    }

    // Email único
    const [emailCheck] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailCheck.length > 0) return res.status(400).json({ error: 'El email ya está registrado.' });

    // Username único
    const [userCheck] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (userCheck.length > 0) return res.status(400).json({ error: 'El username ya está en uso.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRol = rol || 'user';

    const [result] = await pool.query(
      'INSERT INTO users (name, last_name, username, email, password, career_id, rol) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, last_name, username, email, hashedPassword, career_id, userRol]
    );

    await logToDB(req.user?.id, 'CREATE_USER', 'users', result.insertId, { username, email });

    res.status(201).json({
      message: 'Usuario creado correctamente.',
      userId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const orderBy = req.query.orderBy || 'id';
    const orderDir = req.query.orderDir === 'DESC' ? 'DESC' : 'ASC';

    const validColumns = ['id', 'name', 'username', 'email', 'created_at', 'rol'];
    const safeOrder = validColumns.includes(orderBy) ? orderBy : 'id';

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username, u.email, u.rol, u.active, u.failed_attempts, u.created_at,
              c.name AS career
       FROM users u
       LEFT JOIN careers c ON u.career_id = c.id
       ORDER BY u.${safeOrder} ${orderDir}
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');

    res.json({
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
const getUserById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username, u.email, u.rol, u.active, u.failed_attempts, u.created_at,
              c.name AS career
       FROM users u
       LEFT JOIN careers c ON u.career_id = c.id
       WHERE u.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// GET /users/filter
const filterUsers = async (req, res, next) => {
  try {
    const { name, email, career, rol } = req.query;
    let query = `SELECT u.id, u.name, u.last_name, u.username, u.email, u.rol, u.active, u.created_at,
                        c.name AS career
                 FROM users u
                 LEFT JOIN careers c ON u.career_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (name) { query += ' AND (u.name LIKE ? OR u.last_name LIKE ?)'; params.push(`%${name}%`, `%${name}%`); }
    if (email) { query += ' AND u.email LIKE ?'; params.push(`%${email}%`); }
    if (career) { query += ' AND c.name LIKE ?'; params.push(`%${career}%`); }
    if (rol) { query += ' AND u.rol = ?'; params.push(rol); }

    const [rows] = await pool.query(query, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id
const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'last_name', 'username', 'email', 'career_id', 'rol'];
    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar.' });
    }

    if (Object.keys(updates).length > 5) {
      return res.status(400).json({ error: 'Máximo 5 campos por solicitud.' });
    }

    // Hash password si se envía
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    const [result] = await pool.query(`UPDATE users SET ${setClauses} WHERE id = ?`, values);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await logToDB(req.user?.id, 'UPDATE_USER', 'users', req.params.id, updates);
    res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { active } = req.body;
    if (active === undefined) return res.status(400).json({ error: 'El campo active es requerido.' });

    const [result] = await pool.query('UPDATE users SET active = ? WHERE id = ?', [active, req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await logToDB(req.user?.id, active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 'users', req.params.id);
    res.json({ message: `Usuario ${active ? 'activado' : 'desactivado'} correctamente.` });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
const deleteUser = async (req, res, next) => {
  try {
    // Eliminación lógica (recomendado)
    const [result] = await pool.query('UPDATE users SET active = FALSE WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });

    await logToDB(req.user?.id, 'DELETE_USER', 'users', req.params.id);
    res.json({ message: 'Usuario eliminado (lógicamente) correctamente.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createUser, getUsers, getUserById, filterUsers, updateUser, updateStatus, deleteUser };
