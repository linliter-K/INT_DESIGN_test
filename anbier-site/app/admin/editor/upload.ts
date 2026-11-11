const MAX_EDGE = 2400;
const SKIP_BELOW = 1.5 * 1024 * 1024;

// 手機或相機原圖常常 5–15MB，超過 Vercel 上傳上限，所以先在瀏覽器縮圖再送
async function compress(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("不是圖片檔");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < SKIP_BELOW && file.type !== "image/heic") {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/jpeg", 0.85)
  );
  if (!blob) throw new Error("圖片壓縮失敗");
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await compress(file));
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(res.status === 401 ? "登入已過期，請重新登入" : data.error || "上傳失敗");
  }
  return data.url as string;
}
