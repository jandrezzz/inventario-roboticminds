// models/usuarioModel.js — Modelo de acceso a datos para usuarios
// Solo expone las operaciones necesarias para autenticación

const pool = require('../config/db');

const UsuarioModel = {

  /**
   * Busca un usuario por su email para el proceso de login.
   * Devuelve null si no existe, o el objeto usuario con password_hash incluido.
   */
  async findByEmail(email) {
    // Usamos parámetros preparados (?) para evitar inyección SQL
    const [rows] = await pool.query(
      'SELECT id, nombre, email, password_hash, rol FROM usuarios WHERE email = ?',
      [email]
    );
    // rows[0] es undefined si no hay resultados → retornamos null
    return rows[0] || null;
  },

  /**
   * Obtiene todos los usuarios (útil para futuros paneles de administración).
   */
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios ORDER BY nombre ASC'
    );
    return rows;
  }

};

module.exports = UsuarioModel;
