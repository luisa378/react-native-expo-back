import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { query } from "@/lib/db";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export const authSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no esta configurada");
  }

  return secret;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(":");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST);
  return timingSafeEqual(Buffer.from(originalHash, "hex"), hash);
}

export function signToken(payload: { sub: string; email: string }) {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    })
  );
  const signature = createHmac("sha256", getJwtSecret()).update(`${header}.${body}`).digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string) {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) return null;

  const expected = createHmac("sha256", getJwtSecret()).update(`${header}.${body}`).digest("base64url");

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
    sub: string;
    email: string;
    exp: number;
  };

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function createUser(email: string, password: string): Promise<UserRow> {
  return query<UserRow>(
    `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash
    `,
    [email.toLowerCase(), hashPassword(password)]
  ).then(([user]) => user);
}

export function findUserByEmail(email: string): Promise<UserRow | null> {
  return query<UserRow>(
    "SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1",
    [email.toLowerCase()]
  ).then(([user]) => user ?? null);
}

export function authRequired(request: Request) {
  if (process.env.AUTH_REQUIRED !== "true") {
    return null;
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
