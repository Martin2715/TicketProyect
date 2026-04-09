const { pool } = require('../config/db');
const { logToDB } = require('../middlewares/logger');

// ========================
// TIPOS DE TICKET
// ========================

// GET /types
const getTypes = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM types ORDER BY id');
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// POST /types
const createType = async (req, res, next) => {
  try {
    const { type, description, area } = req.body;
    if (!type) return res.status(400).json({ error: 'El campo type es requerido.' });

    const [result] = await pool.query(
      'INSERT INTO types (type, description, area) VALUES (?, ?, ?)',
      [type, description || null, area || null]
    );

    await logToDB(req.user?.id, 'CREATE_TYPE', 'types', result.insertId, { type });
    res.status(201).json({ message: 'Tipo de ticket creado.', typeId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// PUT /types/:id
const updateType = async (req, res, next) => {
  try {
    const { type, description, area } = req.body;
    if (!type && !description && !area) return res.status(400).json({ error: 'Se requiere al menos un campo.' });

    const updates = {};
    if (type) updates.type = type;
    if (description) updates.description = description;
    if (area) updates.area = area;

    const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
    const [result] = await pool.query(`UPDATE types SET ${setClauses} WHERE id = ?`, [...Object.values(updates), req.params.id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tipo no encontrado.' });

    await logToDB(req.user?.id, 'UPDATE_TYPE', 'types', req.params.id, updates);
    res.json({ message: 'Tipo actualizado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /types/:id
const deleteType = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM types WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Tipo no encontrado.' });

    await logToDB(req.user?.id, 'DELETE_TYPE', 'types', req.params.id);
    res.json({ message: 'Tipo eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
};

// ========================
// CATEGORÍAS
// ========================

// GET /categories
const getCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTypes, createType, updateType, deleteType, getCategories };
