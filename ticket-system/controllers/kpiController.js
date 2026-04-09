const { pool } = require('../config/db');

// GET /kpi/tickets/status
const ticketsByStatus = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT status, COUNT(*) AS total
       FROM tickets
       GROUP BY status`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /kpi/tickets/user
const ticketsByUser = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.last_name, u.username,
              COUNT(t.id) AS total_tickets,
              SUM(t.status = 'open') AS open_tickets,
              SUM(t.status = 'in_progress') AS in_progress_tickets,
              SUM(t.status = 'closed') AS closed_tickets
       FROM users u
       LEFT JOIN tickets t ON u.id = t.created_by
       GROUP BY u.id
       ORDER BY total_tickets DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

// GET /kpi/tickets/avg-time (opcional)
const avgResolutionTime = async (req, res, next) => {
  try {
    // Aproximación: calculado desde created_at hasta que fue cerrado (usando logs de auditoría)
    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS total_tickets,
         SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed_tickets,
         AVG(CASE WHEN status = 'closed' THEN TIMESTAMPDIFF(HOUR, created_at, NOW()) ELSE NULL END) AS avg_hours_to_close
       FROM tickets`
    );
    res.json({ data: rows[0], note: 'El tiempo promedio se calcula desde la creación hasta el momento actual para tickets cerrados.' });
  } catch (err) {
    next(err);
  }
};

// GET /kpi/tickets/priority
const ticketsByPriority = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT priority, COUNT(*) AS total FROM tickets GROUP BY priority`
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { ticketsByStatus, ticketsByUser, avgResolutionTime, ticketsByPriority };
