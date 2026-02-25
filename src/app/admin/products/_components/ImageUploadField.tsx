"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  initialImageUrl?: string | null;
};

export function ImageUploadField({ initialImageUrl }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadMessage("");
      setUploadError("업로드할 이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !payload.url) {
        setUploadError(payload.error ?? "업로드에 실패했습니다.");
        return;
      }

      setImageUrl(payload.url);
      setUploadMessage("이미지 업로드가 완료되었습니다.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setUploadError("업로드 중 네트워크 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <legend className="px-1 text-sm font-semibold">이미지 업로드</legend>
      <p className="text-xs text-slate-600">허용 형식: JPEG, PNG, WEBP (최대 5MB)</p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="text-sm"
          aria-label="상품 이미지 파일 선택"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isUploading ? "업로드 중..." : "이미지 업로드"}
        </button>
      </div>

      {uploadError ? (
        <p className="text-sm text-red-600" role="alert">
          {uploadError}
        </p>
      ) : null}

      {uploadMessage ? <p className="text-sm text-green-700">{uploadMessage}</p> : null}

      <label htmlFor="imageUrl" className="block text-sm font-medium">
        이미지 URL
      </label>
      <input
        id="imageUrl"
        name="imageUrl"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://..."
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />

      {imageUrl ? (
        <div className="space-y-1">
          <p className="text-xs text-slate-600">미리보기</p>
          <img src={imageUrl} alt="상품 이미지 미리보기" className="h-40 w-40 rounded border border-slate-300 object-cover" />
        </div>
      ) : null}
    </fieldset>
  );
}
