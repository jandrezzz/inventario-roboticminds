// controllers/inventarioController.js — Controlador principal del inventario
// Maneja dashboard, CRUD de componentes e historial de movimientos

const ComponenteModel = require('../models/componenteModel');

const InventarioController = {

  /**
   * GET /dashboard
   * Página principal del sistema.
   * Carga en paralelo: lista de componentes, alertas de bajo stock e historial.
   * Usar Promise.all reduce el tiempo de espera (queries en paralelo).
   */
  async showDashboard(req, res) {
    try {
      // Ejecutamos las 3 queries en paralelo para mejorar el rendimiento
      const [componentes, bajoStock, historial] = await Promise.all([
        ComponenteModel.findAll(),
        ComponenteModel.getBajoStock(),
        ComponenteModel.getHistorial()
      ]);

      res.render('dashboard', {
        usuario:     req.session.user,
        componentes,
        bajoStock,
        historial,
        mensaje:     null
      });

    } catch (err) {
      console.error('[InventarioController.showDashboard]', err);
      res.render('dashboard', {
        usuario:     req.session.user,
        componentes: [],
        bajoStock:   [],
        historial:   [],
        mensaje:     { tipo: 'error', texto: 'Error al cargar el inventario.' }
      });
    }
  },

  /**
   * GET /componentes/nuevo
   * Muestra el formulario vacío para crear un componente.
   * Solo accesible desde la vista si el usuario es administrador.
   */
  showFormNuevo(req, res) {
    res.render('componentes/form', {
      usuario:    req.session.user,
      componente: null,   // null indica que es un formulario de creación
      accion:     'crear',
      mensaje:    null
    });
  },

  /**
   * POST /componentes/nuevo
   * Procesa el formulario de creación y guarda el nuevo componente.
   */
  async createComponente(req, res) {
    try {
      const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = req.body;

      // Validación de campos obligatorios
      if (!nombre || cantidad === undefined || !precio_unitario) {
        return res.render('componentes/form', {
          usuario:    req.session.user,
          componente: req.body,   // devolvemos los datos para no perder lo que escribió
          accion:     'crear',
          mensaje:    { tipo: 'error', texto: 'Nombre, cantidad y precio son obligatorios.' }
        });
      }

      await ComponenteModel.create({
        nombre:          nombre.trim(),
        descripcion:     descripcion || '',
        categoria:       categoria   || '',
        cantidad:        parseInt(cantidad, 10)        || 0,
        stock_minimo:    parseInt(stock_minimo, 10)    || 5,
        precio_unitario: parseFloat(precio_unitario)   || 0
      });

      // Redirigimos al dashboard con mensaje de éxito guardado en sesión
      req.session.mensaje = { tipo: 'exito', texto: `Componente "${nombre}" creado correctamente.` };
      res.redirect('/dashboard');

    } catch (err) {
      console.error('[InventarioController.createComponente]', err);
      res.render('componentes/form', {
        usuario:    req.session.user,
        componente: req.body,
        accion:     'crear',
        mensaje:    { tipo: 'error', texto: 'Error al guardar el componente.' }
      });
    }
  },

  /**
   * GET /componentes/:id/editar
   * Carga el componente existente y muestra el formulario pre-rellenado.
   */
  async showFormEditar(req, res) {
    try {
      const componente = await ComponenteModel.findById(req.params.id);

      if (!componente) {
        req.session.mensaje = { tipo: 'error', texto: 'Componente no encontrado.' };
        return res.redirect('/dashboard');
      }

      res.render('componentes/form', {
        usuario:    req.session.user,
        componente, // objeto completo para pre-rellenar el formulario
        accion:     'editar',
        mensaje:    null
      });

    } catch (err) {
      console.error('[InventarioController.showFormEditar]', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al cargar el componente.' };
      res.redirect('/dashboard');
    }
  },

  /**
   * POST /componentes/:id/editar
   * Guarda los cambios del formulario de edición.
   * Si la cantidad cambió, el trigger MySQL registra el movimiento automáticamente.
   */
  async updateComponente(req, res) {
    try {
      const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = req.body;
      const id = req.params.id;

      // Verificamos que el componente exista antes de actualizar
      const existe = await ComponenteModel.findById(id);
      if (!existe) {
        req.session.mensaje = { tipo: 'error', texto: 'Componente no encontrado.' };
        return res.redirect('/dashboard');
      }

      await ComponenteModel.update(id, {
        nombre:          nombre.trim(),
        descripcion:     descripcion || '',
        categoria:       categoria   || '',
        cantidad:        parseInt(cantidad, 10)        || 0,
        stock_minimo:    parseInt(stock_minimo, 10)    || 5,
        precio_unitario: parseFloat(precio_unitario)   || 0
      });

      req.session.mensaje = { tipo: 'exito', texto: `Componente "${nombre}" actualizado correctamente.` };
      res.redirect('/dashboard');

    } catch (err) {
      console.error('[InventarioController.updateComponente]', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al actualizar el componente.' };
      res.redirect('/dashboard');
    }
  },

  /**
   * POST /componentes/:id/eliminar
   * Elimina el componente por ID.
   * El CASCADE en la FK borra también el historial relacionado.
   */
  async deleteComponente(req, res) {
    try {
      const id = req.params.id;

      const componente = await ComponenteModel.findById(id);
      if (!componente) {
        req.session.mensaje = { tipo: 'error', texto: 'Componente no encontrado.' };
        return res.redirect('/dashboard');
      }

      await ComponenteModel.delete(id);

      req.session.mensaje = { tipo: 'exito', texto: `Componente "${componente.nombre}" eliminado correctamente.` };
      res.redirect('/dashboard');

    } catch (err) {
      console.error('[InventarioController.deleteComponente]', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al eliminar el componente.' };
      res.redirect('/dashboard');
    }
  }

};

module.exports = InventarioController;
