require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const { authMiddleware } = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

app.use(authMiddleware);

app.use('/', authRoutes);
app.use('/', inventarioRoutes);

app.get('/', (req, res) => res.redirect('/login'));

app.use((req, res) => {
  res.status(404).send('<h2>404 — Página no encontrada</h2><a href="/dashboard">Volver al inicio</a>');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
