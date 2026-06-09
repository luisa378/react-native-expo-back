import { query } from "@/lib/db";
import { jsonResponse, noContentResponse, OPTIONS } from "@/lib/cors";
import { getNoteById, patchNoteSchema } from "@/lib/notes";
import { authRequired } from "@/lib/auth";

export { OPTIONS };

interface Params {
  params: Promise<{ id: string }>;
}

export function GET(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return params
    .then(({ id }) =>
      getNoteById(id).then((note) => {
        if (!note) {
          return jsonResponse({ error: "No encontrado" }, { status: 404 });
        }

        return jsonResponse(note);
      })
    )
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}

export function PATCH(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return Promise.all([params, request.json()])
    .then(([{ id }, body]) => {
      const result = patchNoteSchema.safeParse(body);

      if (!result.success) {
        return jsonResponse({ errors: result.error.issues }, { status: 400 });
      }

      const fields = result.data;

      return getNoteById(id).then((current) => {
        if (!current) {
          return jsonResponse({ error: "No encontrado" }, { status: 404 });
        }

        return query(
          `
            UPDATE notes
            SET
              title = COALESCE($2, title),
              content = COALESCE($3, content),
              color = COALESCE($4, color),
              updated_at = NOW()
            WHERE id = $1
          `,
          [id, fields.title ?? null, fields.content ?? null, fields.color ?? null]
        )
          .then(() => getNoteById(id))
          .then((note) => jsonResponse(note));
      });
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}

export function DELETE(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return params
    .then(({ id }) =>
      Promise.all([
        query("DELETE FROM checklist_items WHERE note_id = $1", [id]),
        query("DELETE FROM note_tags WHERE note_id = $1", [id])
      ]).then(() => query<{ id: string }>("DELETE FROM notes WHERE id = $1 RETURNING id", [id]))
    )
    .then((deleted) => {
      if (!deleted.length) {
        return jsonResponse({ error: "No encontrado" }, { status: 404 });
      }

      return noContentResponse();
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}
