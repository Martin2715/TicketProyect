# 🎫 Ticket System API

**Universidad Politécnica de Aguascalientes**  
Asignatura: Programación Web | Grupo: 4D | Fecha: Abril 2026

---

## 📋 Requisitos

- Node.js v16+
- MySQL 8+
- npm

---

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de MySQL

# 3. Crear la base de datos y tablas
mysql -u root -p < config/schema.sql

# 4. Iniciar el servidor
npm start

# Desarrollo con auto-reload
npm run dev
```

---

## ⚙️ Variables de entorno (.env)

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ticket_system
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h
```

---

## 📁 Estructura del proyecto

```
ticket-system/
├── config/
│   ├── db.js           # Conexión a MySQL
│   └── schema.sql      # Script de base de datos
├── controllers/
│   ├── authController.js
│   ├── usersController.js
│   ├── careersController.js
│   ├── typesController.js
│   ├── ticketsController.js
│   └── kpiController.js
├── middlewares/
│   ├── auth.js         # Verificación JWT y roles
│   ├── errorHandler.js # Manejo global de errores
│   └── logger.js       # Auditoría y logs
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── careers.js
│   ├── typesCategories.js
│   ├── tickets.js
│   └── kpi.js
├── logs/               # Archivos de log diarios (auto-generado)
├── index.js            # Servidor principal
├── .env.example
├── .gitignore
├── package.json
└── TicketSystem_Postman.json
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`) requieren JWT:

```
Authorization: Bearer <token>
```

**Usuario de prueba (password: `password`):**
| Username | Rol   |
|----------|-------|
| admin    | admin |
| dev1     | dev   |
| user1    | user  |

---

## 📡 Endpoints

### Auth
| Método | Ruta           | Descripción         |
|--------|----------------|---------------------|
| POST   | /auth/login    | Iniciar sesión      |
| GET    | /auth/profile  | Ver perfil propio   |

### Users
| Método | Ruta                 | Descripción                  |
|--------|----------------------|------------------------------|
| POST   | /users               | Crear usuario (admin)        |
| GET    | /users               | Listar usuarios (paginado)   |
| GET    | /users/filter        | Filtrar usuarios             |
| GET    | /users/:id           | Obtener usuario por ID       |
| PUT    | /users/:id           | Actualizar usuario (admin)   |
| PATCH  | /users/:id/status    | Cambiar estado (admin)       |
| DELETE | /users/:id           | Eliminar usuario (admin)     |

### Careers
| Método | Ruta              | Descripción           |
|--------|-------------------|-----------------------|
| GET    | /careers          | Listar carreras       |
| GET    | /careers/filter   | Filtrar carreras      |
| POST   | /careers          | Crear carrera (admin) |
| PUT    | /careers/:id      | Actualizar (admin)    |
| DELETE | /careers/:id      | Eliminar (admin)      |

### Types & Categories
| Método | Ruta          | Descripción               |
|--------|---------------|---------------------------|
| GET    | /types        | Listar tipos de ticket    |
| POST   | /types        | Crear tipo (admin)        |
| PUT    | /types/:id    | Actualizar tipo (admin)   |
| DELETE | /types/:id    | Eliminar tipo (admin)     |
| GET    | /categories   | Listar categorías         |

### Tickets
| Método | Ruta                   | Descripción                    |
|--------|------------------------|--------------------------------|
| POST   | /tickets               | Crear ticket                   |
| GET    | /tickets               | Listar tickets (con filtros)   |
| GET    | /tickets/filter        | Filtrado avanzado              |
| GET    | /tickets/:id           | Obtener ticket por ID          |
| PUT    | /tickets/:id           | Actualizar ticket              |
| PATCH  | /tickets/:id/status    | Cambiar estado                 |
| DELETE | /tickets/:id           | Eliminar ticket (admin)        |
| POST   | /tickets/assign        | Asignar a desarrollador        |
| GET    | /tickets/user/:id      | Tickets por usuario            |

### KPI
| Método | Ruta                    | Descripción                      |
|--------|-------------------------|----------------------------------|
| GET    | /kpi/tickets/status     | Tickets agrupados por estado     |
| GET    | /kpi/tickets/user       | Tickets agrupados por usuario    |
| GET    | /kpi/tickets/avg-time   | Tiempo promedio de resolución    |
| GET    | /kpi/tickets/priority   | Tickets agrupados por prioridad  |

---

## 🧪 Pruebas con Postman

1. Importar el archivo `TicketSystem_Postman.json` en Postman
2. La variable `{{token}}` se asigna automáticamente al hacer Login
3. Ejecutar las peticiones en orden (Auth → Users → Tickets)

---

## 📊 Códigos HTTP usados

| Código | Significado           |
|--------|-----------------------|
| 200    | OK                    |
| 201    | Created               |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 500    | Internal Server Error |
