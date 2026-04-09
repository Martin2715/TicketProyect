const express = require('express');
const router = express.Router();
const {
  createTicket, getTickets, filterTickets, getTicketById,
  updateTicket, updateTicketStatus, deleteTicket, assignTicket, getTicketsByUser,
} = require('../controllers/ticketsController');
const { verifyToken, isAdmin, isAdminOrDev } = require('../middlewares/auth');

// Rutas específicas antes de las dinámicas
router.get('/filter', verifyToken, filterTickets);
router.post('/assign', verifyToken, isAdminOrDev, assignTicket);
router.get('/user/:id', verifyToken, getTicketsByUser);

router.get('/', verifyToken, getTickets);
router.get('/:id', verifyToken, getTicketById);
router.post('/', verifyToken, createTicket);
router.put('/:id', verifyToken, updateTicket);
router.patch('/:id/status', verifyToken, isAdminOrDev, updateTicketStatus);
router.delete('/:id', verifyToken, isAdmin, deleteTicket);

module.exports = router;
