import { query } from "@/lib/db";
import { jsonResponse, noContentResponse, OPTIONS } from "@/lib/cors";
import { patchChecklistItemSchema } from "@/lib/notes";
import { authRequired } from "@/lib/auth";

export { OPTIONS };

interface Params {
  params: Promise<{ itemId: string }>;
}

export function PATCH(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return Promise.all([params, request.json()])
    .then(([{ itemId }, body]) => {
      const result = patchChecklistItemSchema.safeParse(body);

      if (!result.success) {
        return jsonResponse({ errors: result.error.issues }, { status: 400 });
      }

      return query<{ note_id: string }>(
        `
          UPDATE checklist_items
          SET
            text = COALESCE($2, text),
            is_completed = COALESCE($3, is_completed)
          WHERE id = $1
          RETURNING note_id
        `,
        [itemId, result.data.text ?? null, result.data.isCompleted ?? null]
      ).then(([item]) => {
        if (!item) {
          return jsonResponse({ error: "No encontrado" }, { status: 404 });
        }

        return query("UPDATE notes SET updated_at = NOW() WHERE id = $1", [item.note_id]).then(() =>
          jsonResponse({ ok: true })
        );
      });
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}

export function DELETE(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return params
    .then(({ itemId }) =>
      query<{ note_id: string }>("DELETE FROM checklist_items WHERE id = $1 RETURNING note_id", [itemId])
    )
    .then((deleted) => {
      if (!deleted.length) {
        return jsonResponse({ error: "No encontrado" }, { status: 404 });
      }

      return query("UPDATE notes SET updated_at = NOW() WHERE id = $1", [deleted[0].note_id]).then(() =>
        noContentResponse()
      );
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}
