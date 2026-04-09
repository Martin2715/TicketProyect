const express = require('express');
const router = express.Router();
const {
  createUser, getUsers, getUserById, filterUsers,
  updateUser, updateStatus, deleteUser,
} = require('../controllers/usersController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Nota: /filter debe ir antes de /:id para que no sea capturado como ID
router.get('/filter', verifyToken, filterUsers);
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', verifyToken, isAdmin, createUser);
router.put('/:id', verifyToken, isAdmin, updateUser);
router.patch('/:id/status', verifyToken, isAdmin, updateStatus);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;
