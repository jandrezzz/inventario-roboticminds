// routes/inventarioRoutes.js — Rutas del inventario
// Aplica roleMiddleware en rutas de escritura (POST)
// authMiddleware ya está aplicado globalmente en app.js

const express               = require('express');
const router                = express.Router();
const InventarioController  = require('../controllers/inventarioController');
const { roleMiddleware }    = require('../middlewares/auth');

// Dashboard principal — lectura, disponible para ambos roles
router.get('/dashboard', InventarioController.showDashboard);

// Formulario de nuevo componente — solo admin puede verlo y enviarlo
router.get('/componentes/nuevo',
  roleMiddleware,
  InventarioController.showFormNuevo
);

// Procesar creación — roleMiddleware bloquea a operadores en POST
router.post('/componentes/nuevo',
  roleMiddleware,
  InventarioController.createComponente
);

// Formulario de edición — carga el componente existente para el admin
router.get('/componentes/:id/editar',
  roleMiddleware,
  InventarioController.showFormEditar
);

// Procesar edición — solo admin
router.post('/componentes/:id/editar',
  roleMiddleware,
  InventarioController.updateComponente
);

// Eliminar componente — solo admin (usamos POST porque los formularios HTML
// no soportan DELETE nativamente sin JavaScript adicional)
router.post('/componentes/:id/eliminar',
  roleMiddleware,
  InventarioController.deleteComponente
);

module.exports = router;
