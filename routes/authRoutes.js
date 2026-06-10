// routes/authRoutes.js — Rutas de autenticación
// Solo define /login (GET y POST) y /logout

const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/authController');

// Muestra el formulario de login
router.get('/login', AuthController.showLogin);

// Procesa las credenciales enviadas por el formulario
router.post('/login', AuthController.doLogin);

// Cierra la sesión y redirige a /login
router.get('/logout', AuthController.logout);

module.exports = router;
