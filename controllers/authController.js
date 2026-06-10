const bcrypt = require('bcryptjs');
const UsuarioModel = require('../models/usuarioModel');

const AuthController = {

  showLogin(req, res) {
    if (req.session.user) return res.redirect('/dashboard');
    const mensaje = req.session.mensaje || null;
    delete req.session.mensaje;
    res.render('login', { mensaje });
  },

  async doLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Por favor ingresa tu email y contraseña.' }
        });
      }

      const usuario = await UsuarioModel.findByEmail(email.trim().toLowerCase());

      if (!usuario) {
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Credenciales incorrectas.' }
        });
      }

      const passwordValida = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordValida) {
        return res.render('login', {
          mensaje: { tipo: 'error', texto: 'Credenciales incorrectas.' }
        });
      }

      req.session.user = {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol
      };

      res.redirect('/dashboard');

    } catch (err) {
      console.error('[AuthController.doLogin]', err);
      res.render('login', {
        mensaje: { tipo: 'error', texto: 'Error interno del servidor.' }
      });
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  }

};

module.exports = AuthController;
