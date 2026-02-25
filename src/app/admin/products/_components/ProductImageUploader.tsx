"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ProductImageUploaderProps = {
  productId: number;
  currentImageUrl?: string | null;
};

export function ProductImageUploader({ productId, currentImageUrl }: ProductImageUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl ?? "");

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("업로드할 이미지를 선택해주세요.");
      setMessage("");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.set("file", file);
      uploadFormData.set("prefix", "products");
      uploadFormData.set("access", "public");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadPayload = (await uploadResponse.json()) as { error?: string; detail?: string; url?: string };
      if (!uploadResponse.ok || !uploadPayload.url) {
        setError(uploadPayload.error ?? "이미지 업로드에 실패했습니다.");
        return;
      }

      const updateResponse = await fetch(`/api/admin/products/${productId}/image`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadPayload.url }),
      });

      const updatePayload = (await updateResponse.json()) as { error?: string };
      if (!updateResponse.ok) {
        setError(updatePayload.error ?? "상품 이미지 저장에 실패했습니다.");
        return;
      }

      setPreviewUrl(uploadPayload.url);
      setMessage("이미지를 저장했습니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 rounded border border-slate-200 p-2">
      <p className="text-xs font-medium">이미지 업로드</p>
      <input ref={fileInputRef} type="file" accept="image/*" className="text-xs" aria-label="상품 이미지 선택" />
      <button
        type="button"
        onClick={handleUpload}
        disabled={isUploading}
        className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-60"
      >
        {isUploading ? "업로드 중..." : "이미지 업로드"}
      </button>
      {message ? <p className="text-xs text-green-700">{message}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {previewUrl ? <img src={previewUrl} alt="상품 썸네일" className="h-16 w-16 rounded border border-slate-300 object-cover" /> : null}
    </div>
  );
}

