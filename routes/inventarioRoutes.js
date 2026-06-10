const express = require('express');
const router = express.Router();
const InventarioController = require('../controllers/inventarioController');
const { roleMiddleware } = require('../middlewares/auth');

router.get('/dashboard', InventarioController.showDashboard);

router.get('/componentes/nuevo', roleMiddleware, InventarioController.showFormNuevo);
router.post('/componentes/nuevo', roleMiddleware, InventarioController.createComponente);

router.get('/componentes/:id/editar', roleMiddleware, InventarioController.showFormEditar);
router.post('/componentes/:id/editar', roleMiddleware, InventarioController.updateComponente);

// POST porque HTML forms no soportan DELETE nativamente
router.post('/componentes/:id/eliminar', roleMiddleware, InventarioController.deleteComponente);

module.exports = router;
