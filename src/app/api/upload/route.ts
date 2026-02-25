import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "");
}

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getYearMonthPath() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}/${mm}`;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다.", detail: "관리자 로그인 후 다시 시도해주세요." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawPrefix = String(formData.get("prefix") ?? "products");
    const rawAccess = String(formData.get("access") ?? "public");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "file 필드가 필요합니다.", detail: "multipart/form-data의 file을 전달하세요." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "허용되지 않은 파일 형식입니다.", detail: "jpg/png/webp 이미지 파일만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기 제한을 초과했습니다.", detail: "최대 5MB까지 업로드할 수 있습니다." },
        { status: 400 },
      );
    }

    const access = rawAccess === "private" ? "private" : "public";
    const prefix = sanitizeSegment(rawPrefix || "products") || "products";
    const safeFilename = sanitizeFilename(file.name || "image");
    const pathname = `${prefix}/${getYearMonthPath()}/${randomUUID().slice(0, 8)}-${safeFilename || "image"}`;

    const blob = await put(pathname, file, {
      access,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "업로드 처리 중 오류가 발생했습니다.",
        detail: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}
