-- ============================================================
-- TICKET SYSTEM - SCHEMA SQL
-- Universidad Politécnica de Aguascalientes
-- Programación Web - Grupo 4D
-- ============================================================

CREATE DATABASE IF NOT EXISTS ticket_system;
USE ticket_system;

-- Tabla Careers
CREATE TABLE IF NOT EXISTS careers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Tabla Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  career_id INT,
  active BOOLEAN DEFAULT TRUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'user', 'dev') DEFAULT 'user',
  failed_attempts INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL
);

-- Tabla Types (Tipos de tickets)
CREATE TABLE IF NOT EXISTS types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  area VARCHAR(100)
);

-- Tabla Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

-- Tabla Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type_id INT,
  status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES types(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla Tickets_Devs
CREATE TABLE IF NOT EXISTS tickets_devs (
  id_ticket INT NOT NULL,
  id_user INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_ticket, id_user),
  FOREIGN KEY (id_ticket) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla Logs (auditoría)
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50),
  entity_id INT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

INSERT INTO careers (name, active) VALUES
  ('Ingeniería en Tecnologías de la Información', TRUE),
  ('Ingeniería en Sistemas Computacionales', TRUE),
  ('Ingeniería Industrial', TRUE),
  ('Ingeniería Mecatrónica', TRUE);

-- Contraseña de todos los usuarios de prueba: password
INSERT INTO users (name, last_name, username, email, career_id, password, rol) VALUES
  ('Admin', 'Sistema', 'admin', 'admin@upa.edu.mx', 1, '$2a$10$fd/dRdtxR2sXADSnB.xzQOpEkdhgaX4gEqkjHxk.rt8YLypMp0a5y', 'admin'),
  ('Developer', 'Uno', 'dev1', 'dev1@upa.edu.mx', 1, '$2a$10$fd/dRdtxR2sXADSnB.xzQOpEkdhgaX4gEqkjHxk.rt8YLypMp0a5y', 'dev'),
  ('Usuario', 'Normal', 'user1', 'user1@upa.edu.mx', 2, '$2a$10$fd/dRdtxR2sXADSnB.xzQOpEkdhgaX4gEqkjHxk.rt8YLypMp0a5y', 'user');

INSERT INTO types (type, description, area) VALUES
  ('Bug', 'Error en el sistema', 'Desarrollo'),
  ('Feature', 'Nueva funcionalidad', 'Producto'),
  ('Soporte', 'Ayuda al usuario', 'Soporte Técnico'),
  ('Mejora', 'Mejora de funcionalidad existente', 'Desarrollo');

INSERT INTO categories (name, description) VALUES
  ('Backend', 'Problemas del servidor'),
  ('Frontend', 'Problemas de interfaz'),
  ('Base de Datos', 'Problemas con datos'),
  ('Infraestructura', 'Problemas de servidores');

INSERT INTO tickets (title, description, type_id, status, priority, created_by) VALUES
  ('Error en login', 'El sistema no permite iniciar sesión', 1, 'open', 'high', 3),
  ('Nuevo reporte KPI', 'Se requiere reporte mensual', 2, 'in_progress', 'medium', 3),
  ('Soporte acceso', 'Usuario no puede acceder', 3, 'open', 'low', 3);
