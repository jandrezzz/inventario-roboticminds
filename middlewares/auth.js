function authMiddleware(req, res, next) {
  if (req.path === '/login') return next();
  if (req.session && req.session.user) return next();
  req.session.mensaje = { tipo: 'error', texto: 'Debes iniciar sesión para acceder.' };
  res.redirect('/login');
}

function roleMiddleware(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();

  if (req.session.user && req.session.user.rol === 'administrador') return next();

  res.status(403).render('dashboard', {
    usuario: req.session.user,
    componentes: [],
    bajoStock: [],
    historial: [],
    mensaje: { tipo: 'error', texto: 'Acceso denegado: solo los administradores pueden realizar esta acción.' }
  });
}

module.exports = { authMiddleware, roleMiddleware };
