import { authSchema, createUser, signToken } from "@/lib/auth";
import { jsonResponse, OPTIONS } from "@/lib/cors";

export { OPTIONS };

export function POST(request: Request) {
  return request
    .json()
    .then((body) => {
      const result = authSchema.safeParse(body);

      if (!result.success) {
        return jsonResponse({ errors: result.error.issues }, { status: 400 });
      }

      return createUser(result.data.email, result.data.password).then((user) => {
        const token = signToken({ sub: user.id, email: user.email });

        return jsonResponse({ token, user: { id: user.id, email: user.email } }, { status: 201 });
      });
    })
    .catch(() => jsonResponse({ error: "No se pudo crear el usuario" }, { status: 400 }));
}
