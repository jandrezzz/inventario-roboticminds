// middlewares/auth.js — Middlewares de autenticación y autorización

/**
 * authMiddleware
 * Protege todas las rutas de la aplicación.
 * Las únicas rutas exentas son GET /login y POST /login.
 * Si el usuario no tiene sesión activa lo redirige al formulario de login.
 */
function authMiddleware(req, res, next) {
  // Permitimos el acceso a /login sin sesión (GET y POST)
  if (req.path === '/login') {
    return next();
  }

  // Si existe sesión con usuario autenticado, continúa normalmente
  if (req.session && req.session.user) {
    return next();
  }

  // Sin sesión → redirigimos al login con mensaje de aviso
  req.session.mensaje = { tipo: 'error', texto: 'Debes iniciar sesión para acceder.' };
  res.redirect('/login');
}

/**
 * roleMiddleware
 * Solo permite métodos de escritura (POST, PUT, DELETE) si el rol es 'administrador'.
 * Los operadores solo pueden usar GET (lectura).
 * Se usa en las rutas de inventario para proteger crear/editar/eliminar.
 */
function roleMiddleware(req, res, next) {
  // GET y HEAD son solo lectura → permitidos para todos los roles
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  // Para cualquier otro método (POST, PUT, DELETE) verificamos que sea administrador
  if (req.session.user && req.session.user.rol === 'administrador') {
    return next();
  }

  // Operador intentando escribir → prohibido con código 403
  res.status(403).render('dashboard', {
    usuario:    req.session.user,
    componentes: [],
    bajoStock:  [],
    historial:  [],
    mensaje:    { tipo: 'error', texto: 'Acceso denegado: solo los administradores pueden realizar esta acción.' }
  });
}

module.exports = { authMiddleware, roleMiddleware };
