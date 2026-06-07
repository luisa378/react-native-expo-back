import { createNote, getNotes, noteSchema } from "@/lib/notes";
import { jsonResponse, OPTIONS } from "@/lib/cors";
import { authRequired } from "@/lib/auth";

export { OPTIONS };

export function GET(request: Request) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return getNotes()
    .then((notes) => jsonResponse(notes))
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}

export function POST(request: Request) {
  if (process.env.AUTH_REQUIRED === "true" && !authRequired(request)) {
    return jsonResponse({ error: "No autorizado" }, { status: 401 });
  }

  return request
    .json()
    .then((body) => {
      const result = noteSchema.safeParse(body);

      if (!result.success) {
        return jsonResponse({ errors: result.error.issues }, { status: 400 });
      }

      return createNote(result.data).then((note) => jsonResponse(note, { status: 201 }));
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}
