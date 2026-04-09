const { logToFile } = require('./logger');

const errorHandler = (err, req, res, next) => {
  logToFile(`[ERROR] ${req.method} ${req.path} - ${err.message}`);
  console.error(err.stack);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ error: 'Ya existe un registro con ese valor único.' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'El ID referenciado no existe.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
};

module.exports = { errorHandler, notFound };
