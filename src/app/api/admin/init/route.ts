import { NextResponse } from "next/server";
import { initDatabaseByRequest } from "@/lib/runtimeDbInit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function readInitToken(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  const headerToken = request.headers.get("x-init-token");
  return headerToken?.trim() ?? null;
}

export async function POST(request: Request) {
  if (process.env.RUNTIME_DB_INIT_ENABLED !== "true") {
    return NextResponse.json(
      {
        error: "Runtime DB init is disabled. Set RUNTIME_DB_INIT_ENABLED=true to use this endpoint.",
      },
      { status: 403 },
    );
  }

  if (!process.env.INIT_DB_TOKEN) {
    return NextResponse.json(
      {
        error: "INIT_DB_TOKEN is missing.",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { seed?: boolean };
    const result = await initDatabaseByRequest({
      token: readInitToken(request),
      seed: Boolean(body?.seed),
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      initialized: result.initialized,
      skipped: result.skipped,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: "Runtime DB init failed.",
        detail,
      },
      { status: 500 },
    );
  }
}
