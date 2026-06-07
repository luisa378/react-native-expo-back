# Backend, REST y base de datos relacional

## Arquitectura cliente-servidor

NoteFlow queda separada en tres capas. La app movil es el cliente, la API REST es el servidor y PostgreSQL es la base de datos. La app no se conecta directamente a PostgreSQL porque eso obligaria a incluir el connection string en el binario, exponiendo acceso completo a la base de datos.

La API valida datos, decide que operaciones estan permitidas y oculta los errores internos. El cliente solo conoce rutas HTTP como `/api/notes`.

## API REST

Una API REST usa recursos y metodos HTTP:

- `GET`: leer datos.
- `POST`: crear datos.
- `PATCH`: modificar parte de un recurso.
- `DELETE`: eliminar datos.

Codigos usados:

- `200 OK`: lectura o actualizacion correcta.
- `201 Created`: recurso creado.
- `204 No Content`: recurso eliminado sin cuerpo de respuesta.
- `400 Bad Request`: datos invalidos.
- `404 Not Found`: recurso inexistente.
- `500 Internal Server Error`: fallo interno sin exponer detalles sensibles.

## SQL y modelo relacional

PostgreSQL organiza los datos en tablas. En NoteFlow hay tres tablas:

- `notes`: entidad principal para notas, checklists e ideas.
- `checklist_items`: tareas asociadas a una nota de tipo `checklist`.
- `note_tags`: etiquetas asociadas a una nota de tipo `idea`.

La clave primaria (`PRIMARY KEY`) identifica cada fila con un UUID. Las claves externas (`FOREIGN KEY`) enlazan `checklist_items.note_id` y `note_tags.note_id` con `notes.id`. El `ON DELETE CASCADE` borra automaticamente las tareas y etiquetas cuando se elimina su nota.

## ACID

ACID resume las propiedades de una base de datos fiable: atomicidad, consistencia, aislamiento y durabilidad. En esta app es importante porque una checklist necesita mantener relacionada la nota principal con sus items.

## DDL y DML

DDL define estructura: `CREATE`, `ALTER`, `DROP`. DML manipula datos: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

## JOINs

`INNER JOIN` devuelve solo filas con coincidencia en ambas tablas. Lo usaria si quisiera listar unicamente notas que tienen items.

`LEFT JOIN` devuelve todas las filas de la tabla izquierda y rellena con `NULL` cuando no hay coincidencia. Lo uso para listar todas las notas aunque una nota normal no tenga items o una idea no tenga checklist.
