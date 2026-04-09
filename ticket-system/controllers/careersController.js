const { pool } = require('../config/db');
const { logToDB } = require('../middlewares/logger');

// GET /careers
const getCareers = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM careers ORDER BY id');
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /careers/filter
const filterCareers = async (req, res, next) => {
  try {
    const { name, active } = req.query;
    let query = 'SELECT * FROM careers WHERE 1=1';
    const params = [];

    if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
    if (active !== undefined) { query += ' AND active = ?'; params.push(active === 'true'); }

    const [rows] = await pool.query(query, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
};

// POST /careers
const createCareer = async (req, res, next) => {
  try {
    const { name, active } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre de la carrera es requerido.' });

    const [result] = await pool.query(
      'INSERT INTO careers (name, active) VALUES (?, ?)',
      [name, active !== undefined ? active : true]
    );

    await logToDB(req.user?.id, 'CREATE_CAREER', 'careers', result.insertId, { name });
    res.status(201).json({ message: 'Carrera creada correctamente.', careerId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// PUT /careers/:id
const updateCareer = async (req, res, next) => {
  try {
    const { name, active } = req.body;
    if (!name && active === undefined) return res.status(400).json({ error: 'Se requiere al menos un campo.' });

    const updates = {};
    if (name) updates.name = name;
    if (active !== undefined) updates.active = active;

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    const [result] = await pool.query(`UPDATE careers SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Carrera no encontrada.' });

    await logToDB(req.user?.id, 'UPDATE_CAREER', 'careers', req.params.id, updates);
    res.json({ message: 'Carrera actualizada correctamente.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /careers/:id
const deleteCareer = async (req, res, next) => {
  try {
    const [result] = await pool.query('UPDATE careers SET active = FALSE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Carrera no encontrada.' });

    await logToDB(req.user?.id, 'DELETE_CAREER', 'careers', req.params.id);
    res.json({ message: 'Carrera eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCareers, filterCareers, createCareer, updateCareer, deleteCareer };
