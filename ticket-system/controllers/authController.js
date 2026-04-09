const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { logToDB } = require('../middlewares/logger');
require('dotenv').config();

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const user = rows[0];

    // Verificar si está bloqueado (5 intentos fallidos)
    if (user.failed_attempts >= 5 || !user.active) {
      return res.status(401).json({
        error: 'Cuenta bloqueada por demasiados intentos fallidos. Contacta al administrador.',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      // Incrementar intentos fallidos
      await pool.query(
        'UPDATE users SET failed_attempts = failed_attempts + 1 WHERE id = ?',
        [user.id]
      );

      const remaining = 4 - user.failed_attempts;
      await logToDB(user.id, 'LOGIN_FAILED', 'users', user.id);
      return res.status(401).json({
        error: `Contraseña incorrecta. Intentos restantes: ${remaining < 0 ? 0 : remaining}`,
      });
    }

    // Resetear intentos fallidos al iniciar sesión correctamente
    await pool.query('UPDATE users SET failed_attempts = 0 WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await logToDB(user.id, 'LOGIN_SUCCESS', 'users', user.id);

    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /auth/profile
const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username, u.email, u.rol, u.active, u.created_at,
              c.name AS career
       FROM users u
       LEFT JOIN careers c ON u.career_id = c.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile };
