const pool = require('../config/db');

const UsuarioModel = {

  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios ORDER BY nombre ASC'
    );
    return rows;
  }

};

module.exports = UsuarioModel;
