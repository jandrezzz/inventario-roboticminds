// models/componenteModel.js — Modelo de acceso a datos para componentes
// Centraliza todas las queries relacionadas con el inventario

const pool = require('../config/db');

const ComponenteModel = {

  /**
   * Lista todos los componentes ordenados por nombre.
   * El dashboard lo usa para la tabla principal.
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT id, nombre, descripcion, categoria, cantidad,
              stock_minimo, precio_unitario, fecha_creacion
       FROM componentes
       ORDER BY nombre ASC`
    );
    return rows;
  },

  /**
   * Busca un componente por su ID primario.
   * Se usa en editar y eliminar para verificar que exista.
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM componentes WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Inserta un nuevo componente en la base de datos.
   * Retorna el resultado con insertId para redirigir al detalle.
   */
  async create(datos) {
    const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = datos;
    const [result] = await pool.query(
      `INSERT INTO componentes (nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario]
    );
    return result;
  },

  /**
   * Actualiza los campos de un componente existente.
   * El trigger after_update_componente registra automáticamente el cambio
   * en historial_movimientos si la cantidad cambió.
   */
  async update(id, datos) {
    const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = datos;
    const [result] = await pool.query(
      `UPDATE componentes
       SET nombre = ?, descripcion = ?, categoria = ?,
           cantidad = ?, stock_minimo = ?, precio_unitario = ?
       WHERE id = ?`,
      [nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario, id]
    );
    return result;
  },

  /**
   * Elimina un componente por ID.
   * El ON DELETE CASCADE en historial_movimientos borra también su historial.
   */
  async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM componentes WHERE id = ?',
      [id]
    );
    return result;
  },

  /**
   * Consulta la VISTA MySQL 'componentes_bajo_stock'.
   * Devuelve componentes cuya cantidad es menor al stock_minimo.
   * El dashboard los muestra como alertas en rojo.
   */
  async getBajoStock() {
    const [rows] = await pool.query(
      'SELECT * FROM componentes_bajo_stock ORDER BY nombre ASC'
    );
    return rows;
  },

  /**
   * Obtiene el historial completo de movimientos con el nombre del componente.
   * Accesible para administrador y operador.
   */
  async getHistorial() {
    const [rows] = await pool.query(
      `SELECT hm.id, c.nombre AS componente, hm.cantidad_modificada,
              hm.accion, hm.fecha_hora
       FROM historial_movimientos hm
       JOIN componentes c ON c.id = hm.componente_id
       ORDER BY hm.fecha_hora DESC
       LIMIT 100`  // limitamos a 100 registros más recientes para no sobrecargar la vista
    );
    return rows;
  }

};

module.exports = ComponenteModel;
