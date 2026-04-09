const express = require('express');
const router = express.Router();
const { ticketsByStatus, ticketsByUser, avgResolutionTime, ticketsByPriority } = require('../controllers/kpiController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/tickets/status', verifyToken, ticketsByStatus);
router.get('/tickets/user', verifyToken, ticketsByUser);
router.get('/tickets/avg-time', verifyToken, avgResolutionTime);
router.get('/tickets/priority', verifyToken, ticketsByPriority);

module.exports = router;
