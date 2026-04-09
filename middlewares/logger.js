const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Log a archivo
const logToFile = (message) => {
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logFile, entry);
};

// Log a base de datos
const logToDB = async (userId, action, entity = null, entityId = null, details = null) => {
  try {
    await pool.query(
      'INSERT INTO logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, entity, entityId, details ? JSON.stringify(details) : null]
    );
    logToFile(`[${action}] user=${userId} entity=${entity} id=${entityId}`);
  } catch (err) {
    logToFile(`[LOG_ERROR] ${err.message}`);
  }
};

module.exports = { logToDB, logToFile };
