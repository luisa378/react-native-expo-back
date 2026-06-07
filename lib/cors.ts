import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export function jsonResponse<T>(body: T, init?: ResponseInit): Response {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init?.headers
    }
  });
}

export function noContentResponse(): Response {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function OPTIONS(): Response {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}
