# 👶 BabyNames

Aplicación colaborativa para elegir nombres de bebé. Grupos de usuarios pueden proponer, votar y comentar nombres.

## Tecnologías

- **Backend**: Node.js + TypeScript + Express + Mongoose (DDD / Clean Architecture)
- **Frontend**: Vue 3 + TailwindCSS + Pinia
- **Base de datos**: MongoDB 7
- **Infraestructura**: Docker Compose + Nginx

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose

## 🚀 Ejecutar la aplicación

```bash
# 1. Clonar el repositorio y entrar al directorio
cd app-v2

# 2. (Opcional) Configurar variables de entorno
#    Editar el fichero .env para cambiar credenciales del usuario root,
#    secreto JWT, etc.

# 3. Construir las imágenes
docker compose build

# 4. Levantar todos los servicios
docker compose up -d
```

La aplicación estará disponible en **http://localhost**

## 🔑 Primer acceso

Al iniciar por primera vez se crea automáticamente un usuario **root** con las credenciales configuradas en `.env`:

| Campo    | Valor por defecto      |
|----------|------------------------|
| Usuario  | `root`                 |
| Password | `root1234`             |

> ⚠️ **Cambia estas credenciales** en el fichero `.env` antes de desplegar en producción.

## 📋 Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Parar todos los servicios
docker compose down

# Parar y eliminar volúmenes (borra la base de datos)
docker compose down -v

# Reconstruir tras cambios en el código
docker compose up -d --build
```

## 🏗️ Arquitectura

```
app-v2/
├── docker-compose.yml          # Orquestación de servicios
├── .env                        # Variables de entorno
├── nginx/                      # Configuración del reverse proxy
├── backend/                    # API REST (Node.js + TypeScript)
│   └── src/
│       ├── domain/             # Entidades y puertos (interfaces)
│       ├── application/        # Casos de uso
│       ├── infrastructure/     # Repos Mongoose, JWT, bcrypt
│       └── interface/          # Express: rutas, middleware, server
└── frontend/                   # SPA (Vue 3 + TailwindCSS)
    └── src/
        ├── pages/              # 7 páginas (Login, Ranking, Discover...)
        ├── stores/             # Pinia (auth, group, name, user)
        ├── router/             # Vue Router con guards
        └── services/           # Cliente API (Axios)
```

## 🌐 Servicios Docker

| Servicio   | Puerto | Descripción                        |
|------------|--------|------------------------------------|
| `nginx`    | 80     | Reverse proxy (punto de entrada)   |
| `backend`  | 3000   | API REST                           |
| `frontend` | 80     | SPA servida con Nginx              |
| `mongo`    | 27017  | Base de datos MongoDB              |

## 👥 Roles de usuario

| Rol     | Permisos                                                       |
|---------|----------------------------------------------------------------|
| `root`  | Todo. Crear admins y usuarios.                                 |
| `admin` | CRUD usuarios (solo tipo user), eliminar nombres, gestionar.   |
| `user`  | Proponer nombres, votar, comentar, crear/gestionar grupos.     |
