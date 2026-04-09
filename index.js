const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const careersRoutes = require('./routes/careers');
const typesCategoriesRoutes = require('./routes/typesCategories');
const ticketsRoutes = require('./routes/tickets');
const kpiRoutes = require('./routes/kpi');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logs de requests en consola

// ============================================================
// RUTAS
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message: '🎫 Ticket System API - UPA Programación Web',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      users: '/users',
      careers: '/careers',
      types: '/types',
      categories: '/categories',
      tickets: '/tickets',
      kpi: '/kpi',
    },
  });
});

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/careers', careersRoutes);
app.use('/', typesCategoriesRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/kpi', kpiRoutes);

// ============================================================
// MANEJO DE ERRORES
// ============================================================
app.use(notFound);
app.use(errorHandler);

// ============================================================
// INICIAR SERVIDOR
// ============================================================
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
