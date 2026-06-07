import { query } from "@/lib/db";
import { jsonResponse, OPTIONS } from "@/lib/cors";
import { checklistItemSchema } from "@/lib/notes";
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
      query(
        `
          SELECT id, text, is_completed AS "isCompleted"
          FROM checklist_items
          WHERE note_id = $1
          ORDER BY created_at ASC
        `,
        [id]
      )
    )
    .then((items) => jsonResponse(items))
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}

export function POST(request: Request, { params }: Params) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return Promise.all([params, request.json()])
    .then(([{ id }, body]) => {
      const result = checklistItemSchema.safeParse(body);

      if (!result.success) {
        return jsonResponse({ errors: result.error.issues }, { status: 400 });
      }

      return query(
        `
          INSERT INTO checklist_items (note_id, text)
          VALUES ($1, $2)
          RETURNING id, text, is_completed AS "isCompleted"
        `,
        [id, result.data.text]
      ).then(([item]) =>
        query("UPDATE notes SET updated_at = NOW() WHERE id = $1", [id]).then(() =>
          jsonResponse(item, { status: 201 })
        )
      );
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}
