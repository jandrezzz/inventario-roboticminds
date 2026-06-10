// app.js — Punto de entrada principal de la aplicación
// Configura Express, middlewares globales y monta las rutas

require('dotenv').config(); // carga .env antes de cualquier otra importación

const express         = require('express');
const session         = require('express-session');
const path            = require('path');
const authRoutes      = require('./routes/authRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const { authMiddleware } = require('./middlewares/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Motor de plantillas ────────────────────────────────────────────────────────
// EJS renderiza archivos .ejs de la carpeta /views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Archivos estáticos ─────────────────────────────────────────────────────────
// Sirve /public/css/style.css como /css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// ── Parseo de body ─────────────────────────────────────────────────────────────
// Necesario para leer req.body de formularios HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // por si se consumen endpoints con JSON en el futuro

// ── Sesiones ───────────────────────────────────────────────────────────────────
// express-session guarda datos del usuario autenticado entre requests
app.use(session({
  secret:            process.env.SESSION_SECRET, // firma la cookie para prevenir tampering
  resave:            false,   // no re-guarda sesión si no cambió
  saveUninitialized: false,   // no crea sesión para usuarios sin login
  cookie: {
    httpOnly: true,           // previene acceso al cookie desde JavaScript del cliente
    maxAge:   1000 * 60 * 60  // sesión válida por 1 hora
  }
}));

// ── Middleware global de autenticación ─────────────────────────────────────────
// Se aplica a TODAS las rutas; solo /login pasa sin sesión
app.use(authMiddleware);

// ── Rutas ──────────────────────────────────────────────────────────────────────
app.use('/', authRoutes);       // /login, /logout
app.use('/', inventarioRoutes); // /dashboard, /componentes/*

// Redirección raíz → login (útil al abrir http://localhost:3000)
app.get('/', (req, res) => res.redirect('/login'));

// ── Manejo de rutas no encontradas ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('<h2>404 — Página no encontrada</h2><a href="/dashboard">Volver al inicio</a>');
});

// ── Arranque del servidor ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
