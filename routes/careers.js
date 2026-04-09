const express = require('express');
const router = express.Router();
const { getCareers, filterCareers, createCareer, updateCareer, deleteCareer } = require('../controllers/careersController');
const { verifyToken, isAdmin } = require('../middlewares/auth');

router.get('/filter', verifyToken, filterCareers);
router.get('/', verifyToken, getCareers);
router.post('/', verifyToken, isAdmin, createCareer);
router.put('/:id', verifyToken, isAdmin, updateCareer);
router.delete('/:id', verifyToken, isAdmin, deleteCareer);

module.exports = router;
