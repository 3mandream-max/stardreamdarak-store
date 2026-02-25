"use client";

type DeleteProductButtonProps = {
  productName: string;
  formAction: (formData: FormData) => void;
};

export function DeleteProductButton({ productName, formAction }: DeleteProductButtonProps) {
  return (
    <button
      type="submit"
      formAction={formAction}
      onClick={(event) => {
        if (!window.confirm(`정말 "${productName}" 상품을 삭제하시겠습니까?`)) {
          event.preventDefault();
        }
      }}
      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700"
    >
      삭제
    </button>
  );
}

