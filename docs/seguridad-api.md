# Seguridad de API

## SQL injection

SQL injection ocurre cuando una entrada del usuario se concatena directamente dentro de una consulta SQL. Por ejemplo, un titulo malicioso podria cerrar una cadena y anadir instrucciones destructivas.

Ejemplo vulnerable:

```ts
const query = "SELECT * FROM notes WHERE title = '" + title + "'";
```

La solucion es usar consultas parametrizadas. La consulta y los valores viajan separados, y PostgreSQL trata los parametros como datos, no como codigo:

```ts
query("SELECT * FROM notes WHERE title = $1", [title]).then((rows) => {
  // usar rows aqui
});
```

## Variables de entorno

`DATABASE_URL` debe vivir en `.env.local` durante desarrollo y en el panel de variables del proveedor en produccion. No debe aparecer en el codigo ni subirse a GitHub, porque permitiria conectarse a la base de datos.

## Errores

La API devuelve mensajes genericos como `Error interno` en fallos de servidor. El detalle real de PostgreSQL no se envia al cliente porque puede revelar nombres de tablas, columnas o estructura interna.
