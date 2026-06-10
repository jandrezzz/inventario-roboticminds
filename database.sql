-- ============================================================
-- database.sql — Robotic Minds Inventory System
-- Crea todas las tablas, vistas, triggers y datos semilla
-- Ejecutar con: mysql -u root -p -P 3307 < database.sql
-- ============================================================

-- Seleccionamos la base de datos que ya debe existir
USE inventario_rm;

-- ============================================================
-- TABLA: usuarios
-- Almacena las cuentas de acceso con roles diferenciados
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,              -- siempre bcrypt, nunca texto plano
  rol             ENUM('administrador', 'operador') NOT NULL DEFAULT 'operador'
);

-- ============================================================
-- TABLA: componentes
-- Inventario principal de piezas / componentes electrónicos
-- ============================================================
CREATE TABLE IF NOT EXISTS componentes (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(150)     NOT NULL,
  descripcion      TEXT,
  categoria        VARCHAR(100),
  cantidad         INT              NOT NULL DEFAULT 0,
  stock_minimo     INT              NOT NULL DEFAULT 5,  -- umbral de alerta
  precio_unitario  DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
  fecha_creacion   TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: historial_movimientos
-- Registro automático de cada cambio en cantidad de componentes
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_movimientos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  componente_id       INT           NOT NULL,
  cantidad_modificada INT           NOT NULL,
  accion              VARCHAR(50)   NOT NULL DEFAULT 'ACTUALIZACIÓN',
  fecha_hora          TIMESTAMP     NOT NULL DEFAULT NOW(),

  -- Relación con componentes; ON DELETE CASCADE elimina historial si borramos el componente
  CONSTRAINT fk_componente
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
    ON DELETE CASCADE
);

-- ============================================================
-- VISTA: componentes_bajo_stock
-- Devuelve solo los componentes cuya cantidad es menor al mínimo
-- El dashboard la consulta para mostrar alertas en rojo
-- ============================================================
CREATE OR REPLACE VIEW componentes_bajo_stock AS
  SELECT
    id,
    nombre,
    descripcion,
    categoria,
    cantidad,
    stock_minimo,
    precio_unitario,
    fecha_creacion
  FROM componentes
  WHERE cantidad < stock_minimo;

-- ============================================================
-- TRIGGER: after_update_componente
-- Se dispara automáticamente DESPUÉS de cada UPDATE en componentes
-- Inserta una fila en historial_movimientos con la nueva cantidad
-- ============================================================
DROP TRIGGER IF EXISTS after_update_componente;

DELIMITER $$

CREATE TRIGGER after_update_componente
AFTER UPDATE ON componentes
FOR EACH ROW
BEGIN
  -- Solo registra si la cantidad realmente cambió para evitar ruido
  IF OLD.cantidad <> NEW.cantidad THEN
    INSERT INTO historial_movimientos
      (componente_id, cantidad_modificada, accion, fecha_hora)
    VALUES
      (NEW.id, NEW.cantidad, 'ACTUALIZACIÓN', NOW());
  END IF;
END$$

DELIMITER ;

-- ============================================================
-- DATOS SEMILLA: usuarios con contraseñas hasheadas con bcrypt
-- admin@rm.com   → admin123
-- operador@rm.com → oper123
-- Los hashes fueron generados con bcryptjs (saltRounds=10)
-- ============================================================
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  (
    'Administrador RM',
    'admin@rm.com',
    '$2b$10$oUX1XddAg7gSF9GM8plSM.iyAEQIj3G2YXRj8o8IOprEo8VaiAUWu',
    'administrador'
  ),
  (
    'Operador RM',
    'operador@rm.com',
    '$2b$10$YJ1bLUOrpwjCO/948SRaVO4D7HFqY129ERsvJrHOqm4LNp7Snx5Gq',
    'operador'
  );

-- ============================================================
-- DATOS SEMILLA: componentes de ejemplo para demostración
-- ============================================================
INSERT INTO componentes (nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario) VALUES
  ('Resistencia 10kΩ',   'Resistencia de carbón 10k ohmios 1/4W', 'Resistencias',   150, 20,  0.05),
  ('Capacitor 100µF',    'Capacitor electrolítico 100µF 25V',      'Capacitores',     80, 15,  0.12),
  ('Arduino Uno R3',     'Microcontrolador AVR ATmega328P',        'Microcontroladores', 5, 10, 12.50),
  ('LED Rojo 5mm',       'LED difuso rojo 5mm 20mA',              'LEDs',            200, 50,  0.08),
  ('Servo MG995',        'Servomotor metálico de alto torque',     'Motores',          3,  5, 18.00),
  ('Módulo HC-05',       'Módulo Bluetooth serial esclavo',        'Comunicación',     8, 10,  6.75),
  ('Sensor DHT22',       'Sensor digital temperatura y humedad',   'Sensores',        12, 15,  4.20),
  ('Transistor BC547',   'Transistor NPN de propósito general',    'Transistores',    95, 30,  0.10);
