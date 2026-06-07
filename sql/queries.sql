-- Devuelve cada nota con sus items y etiquetas.
-- LEFT JOIN mantiene las notas aunque no tengan filas relacionadas.
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
GROUP BY n.id
ORDER BY n.created_at DESC;

-- Busca una nota por id usando parametros para evitar SQL injection.
SELECT *
FROM notes
WHERE id = $1;
