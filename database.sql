-- Robotic Minds — Inventory System
-- Ejecutar: mysql -u root -p < database.sql

USE inventario_rm;

CREATE TABLE IF NOT EXISTS usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)  NOT NULL,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  rol             ENUM('administrador', 'operador') NOT NULL DEFAULT 'operador'
);

CREATE TABLE IF NOT EXISTS componentes (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(150)     NOT NULL,
  descripcion      TEXT,
  categoria        VARCHAR(100),
  cantidad         INT              NOT NULL DEFAULT 0,
  stock_minimo     INT              NOT NULL DEFAULT 5,
  precio_unitario  DECIMAL(10, 2)   NOT NULL DEFAULT 0.00,
  fecha_creacion   TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_movimientos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  componente_id       INT           NOT NULL,
  cantidad_modificada INT           NOT NULL,
  accion              VARCHAR(50)   NOT NULL DEFAULT 'ACTUALIZACIÓN',
  fecha_hora          TIMESTAMP     NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_componente
    FOREIGN KEY (componente_id) REFERENCES componentes(id)
    ON DELETE CASCADE
);

-- Vista: componentes con stock por debajo del mínimo
CREATE OR REPLACE VIEW componentes_bajo_stock AS
  SELECT id, nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario, fecha_creacion
  FROM componentes
  WHERE cantidad < stock_minimo;

DROP TRIGGER IF EXISTS after_update_componente;

DELIMITER $$

CREATE TRIGGER after_update_componente
AFTER UPDATE ON componentes
FOR EACH ROW
BEGIN
  IF OLD.cantidad <> NEW.cantidad THEN
    INSERT INTO historial_movimientos (componente_id, cantidad_modificada, accion, fecha_hora)
    VALUES (NEW.id, NEW.cantidad, 'ACTUALIZACIÓN', NOW());
  END IF;
END$$

DELIMITER ;

-- Usuarios de prueba: admin@rm.com / admin123 · operador@rm.com / oper123
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Administrador RM', 'admin@rm.com', '$2b$10$oUX1XddAg7gSF9GM8plSM.iyAEQIj3G2YXRj8o8IOprEo8VaiAUWu', 'administrador'),
  ('Operador RM', 'operador@rm.com', '$2b$10$YJ1bLUOrpwjCO/948SRaVO4D7HFqY129ERsvJrHOqm4LNp7Snx5Gq', 'operador');

INSERT INTO componentes (nombre, descripcion, categoria, cantidad, stock_minimo, precio_unitario) VALUES
  ('Resistencia 10kΩ',  'Resistencia de carbón 10k ohmios 1/4W', 'Resistencias',       150, 20,  0.05),
  ('Capacitor 100µF',   'Capacitor electrolítico 100µF 25V',      'Capacitores',         80, 15,  0.12),
  ('Arduino Uno R3',    'Microcontrolador AVR ATmega328P',         'Microcontroladores',   5, 10, 12.50),
  ('LED Rojo 5mm',      'LED difuso rojo 5mm 20mA',               'LEDs',                200, 50,  0.08),
  ('Servo MG995',       'Servomotor metálico de alto torque',      'Motores',               3,  5, 18.00),
  ('Módulo HC-05',      'Módulo Bluetooth serial esclavo',         'Comunicación',          8, 10,  6.75),
  ('Sensor DHT22',      'Sensor digital temperatura y humedad',    'Sensores',             12, 15,  4.20),
  ('Transistor BC547',  'Transistor NPN de propósito general',     'Transistores',         95, 30,  0.10);
