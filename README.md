# NoteFlow API

Backend REST con Next.js, TypeScript, Zod y PostgreSQL en Neon.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Completa `DATABASE_URL` en `.env.local` con el connection string de Neon. Ejecuta `sql/schema.sql` en la consola SQL de Neon antes de levantar la API.

## Variables de entorno

- `DATABASE_URL`: connection string de PostgreSQL/Neon.
- `JWT_SECRET`: clave privada para firmar tokens.
- `AUTH_REQUIRED`: usa `true` para exigir `Authorization: Bearer <token>` en rutas protegidas cuando anadas login al front.

## Endpoints

`GET /api/notes`

Devuelve todas las notas, tareas e ideas.

`POST /api/auth/register`

Registra usuario:

```json
{ "email": "luisa@example.com", "password": "password123" }
```

`POST /api/auth/login`

Devuelve token JWT firmado:

```json
{ "email": "luisa@example.com", "password": "password123" }
```

`POST /api/notes`

Crea contenido. Bodies validos:

```json
{ "type": "note", "title": "Titulo", "content": "Texto" }
```

```json
{ "type": "checklist", "title": "Entrega", "items": ["Crear API"] }
```

```json
{ "type": "idea", "title": "Mejora", "tags": ["ux"], "color": "#FEF3C7" }
```

`GET /api/notes/:id`

Devuelve un contenido por id.

`PATCH /api/notes/:id`

Actualiza campos basicos:

```json
{ "title": "Nuevo titulo" }
```

`DELETE /api/notes/:id`

Elimina la nota. Responde `204 No Content`.

`GET /api/notes/:id/checklist-items`

Lista las tareas de una checklist.

`POST /api/notes/:id/checklist-items`

Crea una tarea:

```json
{ "text": "Nueva tarea" }
```

`PATCH /api/checklist-items/:itemId`

Marca/desmarca o cambia texto:

```json
{ "isCompleted": true }
```

`DELETE /api/checklist-items/:itemId`

Elimina una tarea. Responde `204 No Content`.

## Integracion con la app movil

En el front define `EXPO_PUBLIC_API_URL`. En emulador web puede ser:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

En un dispositivo fisico usa la IP local del ordenador, por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
```
