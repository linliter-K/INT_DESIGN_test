"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SortableList, SortableItem, DragHandle, arrayMove } from "./sortable";
import { uploadImage } from "./upload";

const inputCls =
  "w-full bg-background border border-white/15 focus:border-accent outline-none px-3 py-2 text-sm text-foreground transition-colors";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.2em] text-accent mb-2">
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11px] text-foreground/40">{hint}</span>}
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${inputCls} resize-y leading-relaxed`}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export const RICH_HINT = "按 Enter 換行；用 *星號* 包住的字會變成金色斜體強調";

// 一行一筆的清單（例如營業時間、特色標籤），比逐筆新增欄位直覺
export function LinesInput({
  label,
  value,
  onChange,
  hint = "一行一項",
  rows = 3,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  const [text, setText] = useState(value.join("\n"));
  // 清單被外部改動（例如上方刪掉一張卡片）時，要跟著換掉輸入框內容
  if (parseLines(text).join("\n") !== value.join("\n")) {
    setText(value.join("\n"));
  }
  return (
    <TextArea
      label={label}
      hint={hint}
      rows={rows}
      value={text}
      onChange={(t) => {
        setText(t);
        onChange(parseLines(t));
      }}
    />
  );
}

function parseLines(t: string) {
  return t
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function useUploader() {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  async function upload(files: File[]): Promise<string[]> {
    setError(null);
    setBusy((n) => n + files.length);
    const urls: string[] = [];
    for (const f of files) {
      try {
        urls.push(await uploadImage(f));
      } catch (e) {
        setError(`${f.name}：${(e as Error).message}`);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    return urls;
  }
  return { busy, error, upload };
}

export function ImageInput({
  label,
  value,
  onChange,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { busy, error, upload } = useUploader();

  return (
    <div>
      <span className="block text-[11px] tracking-[0.2em] text-accent mb-2">{label}</span>
      <div className="flex gap-4 items-start">
        <div
          className={`relative w-40 shrink-0 ${aspect} bg-background border border-white/10 overflow-hidden`}
        >
          {value ? (
            // 後台預覽用原生 img，避免為每張預覽跑 Next 影像最佳化
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-xs text-foreground/30">
              無圖片
            </span>
          )}
          {busy > 0 && (
            <span className="absolute inset-0 grid place-items-center bg-background/70 text-xs text-accent">
              上傳中…
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 text-xs tracking-[0.2em] border border-accent/50 text-accent hover:bg-accent hover:text-background transition-colors"
          >
            {value ? "更換圖片" : "上傳圖片"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              const [url] = await upload(files);
              if (url) onChange(url);
            }}
          />
          {error && <span className="text-xs text-red-400 max-w-56">{error}</span>}
        </div>
      </div>
    </div>
  );
}

export function GalleryInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { busy, error, upload } = useUploader();
  // 上傳是非同步的，期間使用者可能又刪改了圖片，完成時要接在最新清單後面
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  // 同一張圖可能出現兩次，用「網址＋第幾次出現」當拖曳 id，排序後仍穩定
  const seen = new Map<string, number>();
  const galleryIds = value.map((src) => {
    const n = (seen.get(src) ?? 0) + 1;
    seen.set(src, n);
    return `${src}#${n}`;
  });

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] tracking-[0.2em] text-accent">
          作品影像（{value.length} 張）
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 text-xs tracking-[0.2em] border border-accent/50 text-accent hover:bg-accent hover:text-background transition-colors"
        >
          {busy > 0 ? `上傳中（剩 ${busy} 張）…` : "+ 新增圖片（可多選）"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            const urls = await upload(files);
            if (urls.length) onChange([...latest.current, ...urls]);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      {value.length > 1 && <p className="text-[11px] text-foreground/40 mb-2">按住圖片拖曳可調整順序（手機請長按）</p>}
      <SortableList ids={galleryIds} onMove={(from, to) => onChange(arrayMove(value, from, to))} grid>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {value.map((src, i) => (
          <SortableItem key={galleryIds[i]} id={galleryIds[i]} className="group aspect-[4/3] bg-background overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing touch-manipulation">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute top-1 left-1 px-1.5 text-[10px] bg-background/80">{i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/85 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconBtn label="往前" onClick={() => move(i, -1)}>←</IconBtn>
              <IconBtn label="刪除" onClick={() => onChange(value.filter((_, k) => k !== i))} danger>
                ✕
              </IconBtn>
              <IconBtn label="往後" onClick={() => move(i, 1)}>→</IconBtn>
            </div>
          </SortableItem>
        ))}
      </div>
      </SortableList>
    </div>
  );
}

export function IconBtn({
  children,
  onClick,
  label,
  danger,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`px-2.5 py-1 text-xs ${danger ? "text-red-400 hover:bg-red-500/20" : "text-foreground/80 hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}

// 可增刪排序的卡片清單（服務項目、數據、材質…共用）
export function ListEditor<T>({
  items,
  onChange,
  create,
  title,
  render,
  addLabel = "+ 新增一筆",
}: {
  items: T[];
  onChange: (v: T[]) => void;
  create: () => T;
  title: (item: T, i: number) => string;
  render: (item: T, set: (v: T) => void, i: number) => ReactNode;
  addLabel?: string;
}) {
  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  // 欄位一改物件就換新，所以用位置當 id；拖曳只在放開時才改陣列，期間 id 不變
  const ids = items.map((_, i) => `row-${i}`);
  return (
    <div className="space-y-4">
      <SortableList ids={ids} onMove={(from, to) => onChange(arrayMove(items, from, to))}>
      {items.map((item, i) => (
        <SortableItem key={ids[i]} id={ids[i]} handle className="border border-white/10 bg-background/40">
          {(handle) => (<>
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
            <span className="text-sm text-foreground/80 flex items-center">
              <DragHandle {...handle} />
              <span className="text-accent mr-2">{String(i + 1).padStart(2, "0")}</span>
              {title(item, i)}
            </span>
            <div className="flex">
              <IconBtn label="上移" onClick={() => move(i, -1)}>↑</IconBtn>
              <IconBtn label="下移" onClick={() => move(i, 1)}>↓</IconBtn>
              <IconBtn
                label="刪除"
                danger
                onClick={() => {
                  if (window.confirm(`確定刪除「${title(item, i)}」？`)) {
                    onChange(items.filter((_, k) => k !== i));
                  }
                }}
              >
                刪除
              </IconBtn>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {render(item, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}
          </div>
          </>)}
        </SortableItem>
      ))}
      </SortableList>
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="w-full py-3 text-xs tracking-[0.3em] border border-dashed border-white/20 text-foreground/60 hover:border-accent hover:text-accent transition-colors"
      >
        {addLabel}
      </button>
    </div>
  );
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-surface border border-white/5">
      <h2 className="px-6 py-4 border-b border-white/10 font-serif text-xl">{title}</h2>
      <div className="p-6 space-y-5">{children}</div>
    </section>
  );
}
