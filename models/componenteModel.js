const pool = require('../config/db');

const ComponenteModel = {

  async findAll() {
    const [rows] = await pool.query(
      `SELECT id, nombre, descripcion, categoria, cantidad,
              stock_minimo, precio_unitario, fecha_creacion
       FROM componentes ORDER BY nombre ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM componentes WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(datos) {
    const { nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario } = datos;
    const [result] = await pool.query(
      `INSERT INTO componentes (nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario]
    );
    return result;
  },

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

  async delete(id) {
    const [result] = await pool.query('DELETE FROM componentes WHERE id = ?', [id]);
    return result;
  },

  async getBajoStock() {
    const [rows] = await pool.query('SELECT * FROM componentes_bajo_stock ORDER BY nombre ASC');
    return rows;
  },

  async getHistorial() {
    const [rows] = await pool.query(
      `SELECT hm.id, c.nombre AS componente, hm.cantidad_modificada,
              hm.accion, hm.fecha_hora
       FROM historial_movimientos hm
       JOIN componentes c ON c.id = hm.componente_id
       ORDER BY hm.fecha_hora DESC
       LIMIT 100`
    );
    return rows;
  }

};

module.exports = ComponenteModel;
