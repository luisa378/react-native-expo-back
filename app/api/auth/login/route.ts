import { authSchema, findUserByEmail, signToken, verifyPassword } from "@/lib/auth";
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

      return findUserByEmail(result.data.email).then((user) => {
        if (!user || !verifyPassword(result.data.password, user.password_hash)) {
          return jsonResponse({ error: "Credenciales invalidas" }, { status: 401 });
        }

        const token = signToken({ sub: user.id, email: user.email });
        return jsonResponse({ token, user: { id: user.id, email: user.email } });
      });
    })
    .catch(() => jsonResponse({ error: "Error interno" }, { status: 500 }));
}
