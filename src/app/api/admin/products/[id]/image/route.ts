import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { updateProductImage } from "@/lib/repositories/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "유효하지 않은 상품 ID입니다." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { imageUrl?: string };
    const imageUrl = String(body?.imageUrl ?? "").trim();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl 값이 필요합니다." }, { status: 400 });
    }

    const updated = await updateProductImage(productId, imageUrl);
    return NextResponse.json({
      ok: true,
      product: {
        id: updated.id,
        imageUrl: updated.imageUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "상품 이미지 저장에 실패했습니다.",
        detail: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}

