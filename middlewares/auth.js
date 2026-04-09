const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido. Se requiere rol admin.' });
  }
  next();
};

const isAdminOrDev = (req, res, next) => {
  if (!['admin', 'dev'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso restringido. Se requiere rol admin o dev.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isAdminOrDev };
