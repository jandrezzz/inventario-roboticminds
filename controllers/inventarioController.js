const ComponenteModel = require('../models/componenteModel');

const InventarioController = {

  async showDashboard(req, res) {
    try {
      const [componentes, bajoStock, historial] = await Promise.all([
        ComponenteModel.findAll(),
        ComponenteModel.getBajoStock(),
        ComponenteModel.getHistorial()
      ]);

      const mensaje = req.session.mensaje || null;
      delete req.session.mensaje;

      res.render('dashboard', {
        usuario: req.session.user,
        componentes,
        bajoStock,
        historial,
        mensaje
      });

    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      res.render('dashboard', {
        usuario: req.session.user,
        componentes: [],
        bajoStock: [],
        historial: [],
        mensaje: { tipo: 'error', texto: 'Error al cargar el inventario.' }
      });
    }
  },

  showFormNuevo(req, res) {
    res.render('componentes/form', {
      usuario: req.session.user,
      componente: null,
      accion: 'crear',
      mensaje: null
    });
  },

  async createComponente(req, res) {
    try {
      const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = req.body;

      if (!nombre || cantidad === undefined || !precio_unitario) {
        return res.render('componentes/form', {
          usuario: req.session.user,
          componente: req.body,
          accion: 'crear',
          mensaje: { tipo: 'error', texto: 'Nombre, cantidad y precio son obligatorios.' }
        });
      }

      await ComponenteModel.create({
        nombre: nombre.trim(),
        descripcion: descripcion || '',
        categoria: categoria || '',
        cantidad: parseInt(cantidad, 10) || 0,
        stock_minimo: parseInt(stock_minimo, 10) || 5,
        precio_unitario: parseFloat(precio_unitario) || 0
      });

      req.session.mensaje = { tipo: 'exito', texto: `Componente "${nombre}" creado correctamente.` };
      res.redirect('/dashboard');

    } catch (err) {
      console.error('Error al crear componente:', err);
      res.render('componentes/form', {
        usuario: req.session.user,
        componente: req.body,
        accion: 'crear',
        mensaje: { tipo: 'error', texto: 'Error al guardar el componente.' }
      });
    }
  },

  async showFormEditar(req, res) {
    try {
      const componente = await ComponenteModel.findById(req.params.id);

      if (!componente) {
        req.session.mensaje = { tipo: 'error', texto: 'Componente no encontrado.' };
        return res.redirect('/dashboard');
      }

      res.render('componentes/form', {
        usuario: req.session.user,
        componente,
        accion: 'editar',
        mensaje: null
      });

    } catch (err) {
      console.error('Error al cargar formulario de edición:', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al cargar el componente.' };
      res.redirect('/dashboard');
    }
  },

  async updateComponente(req, res) {
    try {
      const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = req.body;
      const id = req.params.id;

      const existe = await ComponenteModel.findById(id);
      if (!existe) {
        req.session.mensaje = { tipo: 'error', texto: 'Componente no encontrado.' };
        return res.redirect('/dashboard');
      }

      await ComponenteModel.update(id, {
        nombre: nombre.trim(),
        descripcion: descripcion || '',
        categoria: categoria || '',
        cantidad: parseInt(cantidad, 10) || 0,
        stock_minimo: parseInt(stock_minimo, 10) || 5,
        precio_unitario: parseFloat(precio_unitario) || 0
      });

      req.session.mensaje = { tipo: 'exito', texto: `Componente "${nombre}" actualizado correctamente.` };
      res.redirect('/dashboard');

    } catch (err) {
      console.error('Error al actualizar componente:', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al actualizar el componente.' };
      res.redirect('/dashboard');
    }
  },

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
      console.error('Error al eliminar componente:', err);
      req.session.mensaje = { tipo: 'error', texto: 'Error al eliminar el componente.' };
      res.redirect('/dashboard');
    }
  }

};

module.exports = InventarioController;
