import { z } from "zod";
import { query } from "@/lib/db";

export type ContentType = "note" | "checklist" | "idea";

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface ApiNote {
  id: string;
  type: "note";
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiChecklist {
  id: string;
  type: "checklist";
  title: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiIdea {
  id: string;
  type: "idea";
  title: string;
  tags: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type AnyContent = ApiNote | ApiChecklist | ApiIdea;

interface NoteRow {
  id: string;
  title: string;
  content: string | null;
  type: ContentType;
  color: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{ id: string; text: string; is_completed: boolean }> | null;
  tags: string[] | null;
}

export const noteSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("note"),
    title: z.string().trim().min(3),
    content: z.string().trim().min(1)
  }),
  z.object({
    type: z.literal("checklist"),
    title: z.string().trim().min(3),
    items: z.array(z.string().trim().min(1)).min(1)
  }),
  z.object({
    type: z.literal("idea"),
    title: z.string().trim().min(3),
    tags: z.array(z.string().trim().min(1)).min(1),
    color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/)
  })
]);

export const patchNoteSchema = z.object({
  title: z.string().trim().min(3).optional(),
  content: z.string().trim().min(1).nullable().optional(),
  color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional()
});

export const checklistItemSchema = z.object({
  text: z.string().trim().min(1)
});

export const patchChecklistItemSchema = z.object({
  text: z.string().trim().min(1).optional(),
  isCompleted: z.boolean().optional()
});

const noteSelect = `
  SELECT
    n.*,
    COALESCE(
      json_agg(
        json_build_object('id', ci.id, 'text', ci.text, 'is_completed', ci.is_completed)
        ORDER BY ci.created_at ASC
      ) FILTER (WHERE ci.id IS NOT NULL),
      '[]'
    ) AS items,
    COALESCE(
      json_agg(nt.tag ORDER BY nt.created_at ASC) FILTER (WHERE nt.id IS NOT NULL),
      '[]'
    ) AS tags
  FROM notes n
  LEFT JOIN checklist_items ci ON n.id = ci.note_id
  LEFT JOIN note_tags nt ON n.id = nt.note_id
`;

function toApi(row: NoteRow): AnyContent {
  const base = {
    id: row.id,
    title: row.title,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };

  if (row.type === "checklist") {
    return {
      ...base,
      type: "checklist",
      items: (row.items ?? []).map((item) => ({
        id: item.id,
        text: item.text,
        isCompleted: item.is_completed
      }))
    };
  }

  if (row.type === "idea") {
    return {
      ...base,
      type: "idea",
      tags: row.tags ?? [],
      color: row.color ?? "#FEF3C7"
    };
  }

  return {
    ...base,
    type: "note",
    content: row.content ?? ""
  };
}

export function getNotes(): Promise<AnyContent[]> {
  return query<NoteRow>(`
    ${noteSelect}
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `).then((rows) => rows.map(toApi));
}

export function getNoteById(id: string): Promise<AnyContent | null> {
  return query<NoteRow>(
    `
      ${noteSelect}
      WHERE n.id = $1
      GROUP BY n.id
      LIMIT 1
    `,
    [id]
  ).then((rows) => (rows[0] ? toApi(rows[0]) : null));
}

export function createNote(input: z.infer<typeof noteSchema>): Promise<AnyContent | null> {
  const content = input.type === "note" ? input.content : null;
  const color = input.type === "idea" ? input.color : null;

  return query<{ id: string }>(
    "INSERT INTO notes (title, type, content, color) VALUES ($1, $2, $3, $4) RETURNING id",
    [input.title, input.type, content, color]
  ).then(([note]) => {
    const itemInserts =
      input.type === "checklist"
        ? Promise.all(
            input.items.map((text) =>
              query("INSERT INTO checklist_items (note_id, text) VALUES ($1, $2)", [note.id, text])
            )
          )
        : Promise.resolve([]);

    const tagInserts =
      input.type === "idea"
        ? Promise.all(
            input.tags.map((tag) =>
              query("INSERT INTO note_tags (note_id, tag) VALUES ($1, $2)", [note.id, tag])
            )
          )
        : Promise.resolve([]);

    return Promise.all([itemInserts, tagInserts]).then(() => getNoteById(note.id));
  });
}
