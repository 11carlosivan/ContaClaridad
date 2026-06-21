const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const recordsRoutes = require('./routes/recordsRoutes');
const billingRoutes = require('./routes/billingRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Check DB Connection on startup
const db = require('./config/db');
db.getConnection()
  .then(conn => {
    console.log('Conexión con base de datos MySQL establecida con éxito.');
    conn.release();
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos MySQL:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('ContaClaridad API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Servidor de ContaClaridad escuchando en el puerto ${PORT}`);
});
