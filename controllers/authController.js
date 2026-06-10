// controllers/authController.js — Controlador de autenticación
// Maneja el flujo de login y logout usando express-session + bcryptjs

const bcrypt       = require('bcryptjs');
const UsuarioModel = require('../models/usuarioModel');

const AuthController = {

  /**
   * GET /login
   * Muestra el formulario de inicio de sesión.
   * Si ya hay sesión activa, redirige directo al dashboard.
   */
  showLogin(req, res) {
    // Si el usuario ya está logueado no tiene sentido mostrar el login
    if (req.session.user) {
      return res.redirect('/dashboard');
    }

    // Pasamos un posible mensaje de error/info guardado en sesión (ej: "sesión expirada")
    const mensaje = req.session.mensaje || null;
    delete req.session.mensaje; // limpiamos el mensaje después de mostrarlo

    res.render('login', { mensaje });
  },

  /**
   * POST /login
   * Procesa las credenciales del formulario.
   * 1. Busca el usuario por email
   * 2. Compara la contraseña con el hash almacenado usando bcrypt
   * 3. Si es válido, guarda datos mínimos en sesión y redirige al dashboard
   * 4. Si no es válido, vuelve al login con mensaje de error
   */
  async doLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validación básica de campos vacíos antes de ir a la base de datos
      if (!email || !password) {
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Por favor ingresa tu email y contraseña.' }
        });
      }

      // Buscamos el usuario en la BD; retorna null si no existe
      const usuario = await UsuarioModel.findByEmail(email.trim().toLowerCase());

      if (!usuario) {
        // No revelamos si el email existe para evitar enumeración de usuarios
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Credenciales incorrectas.' }
        });
      }

      // bcrypt.compare compara la contraseña ingresada con el hash guardado
      const passwordValida = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordValida) {
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Credenciales incorrectas.' }
        });
      }

      // Guardamos solo los datos necesarios en sesión (nunca el hash)
      req.session.user = {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol
      };

      // Redirigimos al dashboard tras login exitoso
      res.redirect('/dashboard');

    } catch (err) {
      console.error('[AuthController.doLogin]', err);
      res.render('login', {
        mensaje: { tipo: 'error', texto: 'Error interno del servidor. Intenta más tarde.' }
      });
    }
  },

  /**
   * GET /logout
   * Destruye la sesión del usuario y lo redirige al login.
   */
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('[AuthController.logout]', err);
      }
      // destroy() no limpia la cookie automáticamente → la borramos manualmente
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  }

};

module.exports = AuthController;
