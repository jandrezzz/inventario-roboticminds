// setup-db.js — Inicializa la base de datos sin necesidad de mysql CLI
// Ejecutar una sola vez: node setup-db.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
  // Conectamos sin especificar base de datos para poder crearla si no existe
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT, 10),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  console.log('Conectado a MySQL. Configurando base de datos...\n');

  // Usamos la base de datos que ya debe existir
  await conn.query(`USE \`${process.env.DB_NAME}\``);

  // ── Tablas ──────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      nombre        VARCHAR(100)  NOT NULL,
      email         VARCHAR(150)  NOT NULL UNIQUE,
      password_hash VARCHAR(255)  NOT NULL,
      rol           ENUM('administrador','operador') NOT NULL DEFAULT 'operador'
    )
  `);
  console.log('✓ Tabla usuarios');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS componentes (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      nombre          VARCHAR(150)   NOT NULL,
      descripcion     TEXT,
      categoria       VARCHAR(100),
      cantidad        INT            NOT NULL DEFAULT 0,
      stock_minimo    INT            NOT NULL DEFAULT 5,
      precio_unitario DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
      fecha_creacion  TIMESTAMP      NOT NULL DEFAULT NOW()
    )
  `);
  console.log('✓ Tabla componentes');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS historial_movimientos (
      id                  INT AUTO_INCREMENT PRIMARY KEY,
      componente_id       INT          NOT NULL,
      cantidad_modificada INT          NOT NULL,
      accion              VARCHAR(50)  NOT NULL DEFAULT 'ACTUALIZACIÓN',
      fecha_hora          TIMESTAMP    NOT NULL DEFAULT NOW(),
      CONSTRAINT fk_componente
        FOREIGN KEY (componente_id) REFERENCES componentes(id)
        ON DELETE CASCADE
    )
  `);
  console.log('✓ Tabla historial_movimientos');

  // ── Vista ───────────────────────────────────────────────────────────────────
  await conn.query(`
    CREATE OR REPLACE VIEW componentes_bajo_stock AS
      SELECT id, nombre, descripcion, categoria, cantidad,
             stock_minimo, precio_unitario, fecha_creacion
      FROM componentes
      WHERE cantidad < stock_minimo
  `);
  console.log('✓ Vista componentes_bajo_stock');

  // ── Trigger — mysql2 no acepta DELIMITER; usamos la sintaxis directa ────────
  await conn.query(`DROP TRIGGER IF EXISTS after_update_componente`);
  await conn.query(`
    CREATE TRIGGER after_update_componente
    AFTER UPDATE ON componentes
    FOR EACH ROW
    BEGIN
      IF OLD.cantidad <> NEW.cantidad THEN
        INSERT INTO historial_movimientos (componente_id, cantidad_modificada, accion, fecha_hora)
        VALUES (NEW.id, NEW.cantidad, 'ACTUALIZACIÓN', NOW());
      END IF;
    END
  `);
  console.log('✓ Trigger after_update_componente');

  // ── Seed: usuarios ──────────────────────────────────────────────────────────
  // Comprobamos si ya existen antes de insertar para evitar duplicados
  const [existentes] = await conn.query('SELECT COUNT(*) AS total FROM usuarios');
  if (existentes[0].total === 0) {
    await conn.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
        ('Administrador RM',  'admin@rm.com',
         '$2b$10$oUX1XddAg7gSF9GM8plSM.iyAEQIj3G2YXRj8o8IOprEo8VaiAUWu', 'administrador'),
        ('Operador RM', 'operador@rm.com',
         '$2b$10$YJ1bLUOrpwjCO/948SRaVO4D7HFqY129ERsvJrHOqm4LNp7Snx5Gq', 'operador')
    `);
    console.log('✓ Usuarios seed insertados');
  } else {
    console.log('  Usuarios ya existen, saltando seed');
  }

  // ── Seed: componentes ───────────────────────────────────────────────────────
  const [existentesComp] = await conn.query('SELECT COUNT(*) AS total FROM componentes');
  if (existentesComp[0].total === 0) {
    await conn.query(`
      INSERT INTO componentes (nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario) VALUES
        ('Resistencia 10kΩ',  'Resistencia de carbón 10k ohmios 1/4W', 'Resistencias',      150, 20,  0.05),
        ('Capacitor 100µF',   'Capacitor electrolítico 100µF 25V',     'Capacitores',        80, 15,  0.12),
        ('Arduino Uno R3',    'Microcontrolador AVR ATmega328P',        'Microcontroladores',  5, 10, 12.50),
        ('LED Rojo 5mm',      'LED difuso rojo 5mm 20mA',              'LEDs',              200, 50,  0.08),
        ('Servo MG995',       'Servomotor metálico de alto torque',     'Motores',             3,  5, 18.00),
        ('Módulo HC-05',      'Módulo Bluetooth serial esclavo',        'Comunicación',        8, 10,  6.75),
        ('Sensor DHT22',      'Sensor digital temperatura y humedad',   'Sensores',           12, 15,  4.20),
        ('Transistor BC547',  'Transistor NPN de propósito general',    'Transistores',       95, 30,  0.10)
    `);
    console.log('✓ Componentes seed insertados');
  } else {
    console.log('  Componentes ya existen, saltando seed');
  }

  await conn.end();
  console.log('\n Base de datos lista. Ya puedes correr: npm start');
}

setup().catch(err => {
  console.error('\nERROR al configurar la BD:', err.message);
  process.exit(1);
});
