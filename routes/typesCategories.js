const express = require('express');
const router = express.Router();
const { getTypes, createType, updateType, deleteType, getCategories } = require('../controllers/typesController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

// Types
router.get('/types', verifyToken, getTypes);
router.post('/types', verifyToken, isAdmin, createType);
router.put('/types/:id', verifyToken, isAdmin, updateType);
router.delete('/types/:id', verifyToken, isAdmin, deleteType);

// Categories
router.get('/categories', verifyToken, getCategories);

module.exports = router;
