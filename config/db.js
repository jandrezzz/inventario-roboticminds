// config/db.js — Configuración y pool de conexiones MySQL
// Usa mysql2/promise para poder usar async/await en los modelos
// El pool reutiliza conexiones en lugar de abrir/cerrar en cada query

require('dotenv').config();
const mysql = require('mysql2/promise');

// createPool gestiona múltiples conexiones simultáneas automáticamente
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10), // puerto 3307 definido en .env
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,   // encola queries si no hay conexión libre
  connectionLimit:    10,     // máximo 10 conexiones concurrentes
  queueLimit:         0       // 0 = sin límite de cola
});

module.exports = pool;
