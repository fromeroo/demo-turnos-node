# Demo Turnos — Backend (Node.js + TypeScript)

API REST para la gestión de turnos. Construida con **Express**, **TypeORM** y **SQL Server**. Autenticación basada en **JWT**.

---

## Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose
- Node.js 20+ _(solo para desarrollo local sin Docker)_

---

## Estructura del proyecto

```
src/
├── config/         → Conexión a la base de datos (TypeORM)
├── entities/       → Modelos: User, Turno
├── middleware/     → Autenticación JWT y autorización por rol
└── routes/         → auth, turnos, users
```

---

## Levantar con Docker (recomendado)

> Este `docker-compose.yml` levanta los tres servicios: base de datos, API y frontend Angular.  
> Asegurate de tener también el proyecto `demo-turnos-angular` clonado en la misma carpeta padre.

```
Proyectos/
├── demo-turnos-node/       
└── demo-turnos-angular/
```

```bash
# Desde la carpeta demo-turnos-node
docker-compose up --build
```

| Servicio   | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost:4200    |
| API        | http://localhost:3000    |
| SQL Server | localhost:1433           |

> La primera vez el contenedor de SQL Server puede tardar ~60 segundos en estar listo. La API se reiniciará automáticamente hasta que la DB esté disponible.

---

## Desarrollo local (sin Docker)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=Admin1234!
DB_NAME=turnos_db
JWT_SECRET=jwt_secret_demo_2024
```

### 3. Iniciar la API

```bash
npm run dev
```

---

## Endpoints

### Auth

| Método | Ruta                  | Descripción              | Auth requerida |
|--------|-----------------------|--------------------------|----------------|
| POST   | `/api/auth/register`  | Registrar usuario        | No             |
| POST   | `/api/auth/login`     | Iniciar sesión → JWT     | No             |

### Turnos

| Método | Ruta                        | Descripción                             | Roles          |
|--------|-----------------------------|-----------------------------------------|----------------|
| GET    | `/api/turnos`               | Listar turnos (admin/empleado: todos)   | Autenticado    |
| POST   | `/api/turnos`               | Crear turno                             | cliente, admin |
| PATCH  | `/api/turnos/:id/estado`    | Cambiar estado del turno                | empleado, admin|
| DELETE | `/api/turnos/:id`           | Cancelar turno                          | Autenticado    |

### Usuarios

| Método | Ruta                    | Descripción         | Roles |
|--------|-------------------------|---------------------|-------|
| GET    | `/api/users`            | Listar usuarios     | admin |
| PATCH  | `/api/users/:id/rol`    | Cambiar rol         | admin |

---

## Roles

| Rol       | Descripción                                      |
|-----------|--------------------------------------------------|
| `admin`   | Acceso total                                     |
| `empleado`| Puede ver todos los turnos y cambiar su estado   |
| `cliente` | Puede crear turnos y cancelar los propios        |

---

## Estados de un turno

| Estado      | Descripción                    |
|-------------|--------------------------------|
| `pendiente` | Recién creado                  |
| `atendido`  | Marcado como atendido          |
| `cancelado` | Cancelado por cliente o admin  |
