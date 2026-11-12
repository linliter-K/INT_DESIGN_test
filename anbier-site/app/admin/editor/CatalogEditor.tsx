"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem, arrayMove, useDragSensors } from "./sortable";
import type { CatalogItem, CatalogSection } from "../../lib/content/types";
import { catalogCategories } from "../../lib/content/catalog";
import {
  Field,
  TextInput,
  TextArea,
  LinesInput,
  ImageInput,
  Grid2,
  IconBtn,
  Section,
} from "./fields";

const ALL = "__all__";
const CAT = "cat:";
const ITEM = "item:";

// 拖分類只能撞到分類；拖品項可以撞到品項（排序）或左側分類（換分類）
const collision: CollisionDetection = (args) => {
  const isCat = String(args.active.id).startsWith(CAT);
  const droppableContainers = args.droppableContainers.filter((d) =>
    isCat ? String(d.id).startsWith(CAT) : true
  );
  const hit = pointerWithin({ ...args, droppableContainers });
  if (hit.length) return hit;
  return closestCenter({
    ...args,
    droppableContainers: droppableContainers.filter((d) => String(d.id).startsWith(isCat ? CAT : ITEM)),
  });
};

function newMaterialId() {
  return `m-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export default function CatalogEditor({
  section: materials,
  onChange,
  noun,
  usageLabel,
}: {
  section: CatalogSection;
  onChange: (v: CatalogSection) => void;
  // 「材質」或「軟裝」，用在標題與按鈕文字
  noun: string;
  usageLabel: string;
}) {
  const categories = catalogCategories(materials);
  const [sel, setSel] = useState<string>(categories[0] ?? ALL);
  const [newCat, setNewCat] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // 預設全部收合只看縮圖＋名稱，品項一多才好找；要改細項再個別展開
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // 被刪掉或改名的分類不能繼續停在選取狀態
  const current = sel === ALL || categories.includes(sel) ? sel : ALL;
  const count = (c: string) => materials.items.filter((m) => m.category === c).length;
  const shown = materials.items
    .map((m, index) => ({ m, index }))
    .filter(({ m }) => current === ALL || m.category === current);

  function update(patch: Partial<CatalogSection>) {
    onChange({ ...materials, categories, ...patch });
  }

  function addCategory() {
    const name = newCat.trim();
    if (!name) return;
    if (categories.includes(name)) {
      setError(`「${name}」已經存在`);
      return;
    }
    update({ categories: [...categories, name] });
    setNewCat("");
    setError(null);
    setSel(name);
  }

  function renameCategory(from: string, to: string) {
    const name = to.trim();
    setRenaming(null);
    if (!name || name === from) return;
    if (categories.includes(name)) {
      setError(`「${name}」已經存在`);
      return;
    }
    update({
      categories: categories.map((c) => (c === from ? name : c)),
      items: materials.items.map((m) => (m.category === from ? { ...m, category: name } : m)),
    });
    setError(null);
    setSel(name);
  }

  function deleteCategory(c: string) {
    const n = count(c);
    if (n > 0) {
      setError(`「${c}」底下還有 ${n} 個${noun}，請先把它們改到其他分類或刪除`);
      return;
    }
    if (!window.confirm(`確定刪除分類「${c}」？`)) return;
    update({ categories: categories.filter((x) => x !== c) });
    setError(null);
    setSel(ALL);
  }

  function moveCategory(c: string, d: number) {
    const i = categories.indexOf(c);
    const j = i + d;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[i], next[j]] = [next[j], next[i]];
    update({ categories: next });
  }

  function setItem(index: number, m: CatalogItem) {
    update({ items: materials.items.map((x, i) => (i === index ? m : x)) });
  }

  // 在分類內上下移：跟同分類的上一個／下一個材質交換位置
  function moveItem(pos: number, d: number) {
    const a = shown[pos];
    const b = shown[pos + d];
    if (!a || !b) return;
    const items = [...materials.items];
    [items[a.index], items[b.index]] = [items[b.index], items[a.index]];
    update({ items });
  }

  const sensors = useDragSensors();
  const [notice, setNotice] = useState<string | null>(null);

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const a = String(active.id);
    const o = String(over.id);
    if (a.startsWith(CAT) && o.startsWith(CAT)) {
      const from = categories.indexOf(a.slice(CAT.length));
      const to = categories.indexOf(o.slice(CAT.length));
      if (from >= 0 && to >= 0) update({ categories: arrayMove(categories, from, to) });
      return;
    }
    if (!a.startsWith(ITEM)) return;
    const from = materials.items.findIndex((m) => m.id === a.slice(ITEM.length));
    if (from < 0) return;
    if (o.startsWith(CAT)) {
      const category = o.slice(CAT.length);
      const m = materials.items[from];
      if (m.category === category) return;
      // 移到新分類的最後面，跟手動改分類下拉的結果一致
      const rest = materials.items.filter((_, i) => i !== from);
      update({ items: [...rest, { ...m, category }] });
      setNotice(`「${m.name}」已移到「${category}」`);
      return;
    }
    const to = materials.items.findIndex((m) => m.id === o.slice(ITEM.length));
    if (to >= 0) update({ items: arrayMove(materials.items, from, to) });
  }

  function removeItem(index: number) {
    const m = materials.items[index];
    if (!window.confirm(`確定刪除「${m.name || "未命名"}」？`)) return;
    update({ items: materials.items.filter((_, i) => i !== index) });
  }

  function addItem() {
    const category = current === ALL ? categories[0] ?? "其他" : current;
    const id = newMaterialId();
    // 新增的通常馬上要填資料，直接展開
    setExpanded((prev) => new Set(prev).add(id));
    update({
      categories: categories.includes(category) ? categories : [...categories, category],
      items: [
        ...materials.items,
        {
          id,
          name: `新${noun}`,
          nameEn: "",
          category,
          image: "",
          description: "",
          features: [],
          usage: "",
        },
      ],
    });
  }

  return (
    <div className="space-y-6">
      <Section title={`${noun}頁標題`}>
        <TextInput label="小標" value={materials.kicker} onChange={(v) => update({ kicker: v })} />
        <TextInput label="標題" value={materials.title} onChange={(v) => update({ title: v })} />
        <TextArea label="說明" value={materials.subtitle} onChange={(v) => update({ subtitle: v })} />
      </Section>

      <DndContext sensors={sensors} collisionDetection={collision} onDragEnd={onDragEnd} onDragStart={() => setNotice(null)}>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-surface border border-white/5 self-start lg:sticky lg:top-32">
          <div className="px-4 py-3 border-b border-white/10 text-[11px] tracking-[0.2em] text-accent">
            分類
          </div>
          <CategoryRow label="全部" count={materials.items.length} active={current === ALL} onClick={() => setSel(ALL)} />
          <SortableContext items={categories.map((c) => CAT + c)} strategy={verticalListSortingStrategy}>
          {categories.map((c) => (
            <div key={c} className="group relative">
              {renaming === c ? (
                <input
                  autoFocus
                  defaultValue={c}
                  onBlur={(e) => renameCategory(c, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-full bg-background border border-accent outline-none px-4 py-2.5 text-sm"
                />
              ) : (
                <SortableItem id={CAT + c} className="touch-manipulation">
                  <CategoryRow label={c} count={count(c)} active={current === c} onClick={() => setSel(c)} />
                </SortableItem>
              )}
            </div>
          ))}
          </SortableContext>
          <p className="px-4 py-2 text-[10px] leading-relaxed text-foreground/40">
            拖曳分類可調整順序；把右側{noun}拖到這裡的分類上可直接換分類
          </p>
          <div className="p-3 border-t border-white/10 space-y-2">
            <div className="flex gap-2">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCategory();
                  }
                }}
                placeholder={`新分類名稱，例如：${noun === "材質" ? "磁磚" : "地毯"}`}
                className="flex-1 min-w-0 bg-background border border-white/15 focus:border-accent outline-none px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-3 text-xs border border-accent/50 text-accent hover:bg-accent hover:text-background transition-colors"
              >
                新增
              </button>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">
              {current === ALL ? `全部${noun}` : current}
              <span className="ml-3 text-sm text-foreground/40">{shown.length} 個</span>
            </h2>
            {current !== ALL && (
              <div className="flex gap-2 text-xs">
                <button onClick={() => moveCategory(current, -1)} className="px-3 py-1.5 border border-white/15 hover:border-accent">↑ 分類往前</button>
                <button onClick={() => moveCategory(current, 1)} className="px-3 py-1.5 border border-white/15 hover:border-accent">↓ 分類往後</button>
                <button onClick={() => setRenaming(current)} className="px-3 py-1.5 border border-white/15 hover:border-accent">改名</button>
                <button onClick={() => deleteCategory(current)} className="px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10">刪除分類</button>
              </div>
            )}
          </div>
          {shown.length > 0 && (
            <div className="flex justify-end gap-3 text-xs text-foreground/50">
              <button type="button" onClick={() => setExpanded(new Set(shown.map(({ m }) => m.id)))} className="hover:text-accent">全部展開</button>
              <span className="text-foreground/20">|</span>
              <button type="button" onClick={() => setExpanded(new Set())} className="hover:text-accent">全部收合</button>
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {notice && <p className="text-sm text-green-400">{notice}</p>}

          {shown.length === 0 && (
            <p className="text-foreground/50 text-sm border border-dashed border-white/15 px-4 py-6 text-center">
              這個分類還沒有{noun}。
            </p>
          )}

          <SortableContext items={shown.map(({ m }) => ITEM + m.id)} strategy={verticalListSortingStrategy}>
          {shown.map(({ m, index }, pos) => {
            const open = expanded.has(m.id);
            return (
            <SortableItem key={m.id} id={ITEM + m.id} handle className={`border bg-surface ${open ? "border-accent/40" : "border-white/10"}`}>
              {(handle) => (<>
              {/* 只有標題列能拖，展開後的輸入框選字不會誤觸拖曳 */}
              <div {...handle} className={`flex items-center gap-3 pl-2 pr-2 py-2 cursor-grab active:cursor-grabbing touch-manipulation ${open ? "border-b border-white/10" : ""}`}>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left group"
                >
                  <span className="relative w-14 h-14 shrink-0 bg-background overflow-hidden">
                    {m.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground/30">無圖</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm truncate group-hover:text-accent">
                      <span className="text-accent mr-2">{String(pos + 1).padStart(2, "0")}</span>
                      {m.name || "（未命名）"}
                    </span>
                    <span className="block text-[11px] text-foreground/40 truncate">
                      {[current === ALL ? m.category : "", m.nameEn].filter(Boolean).join(" · ") || " "}
                    </span>
                  </span>
                </button>
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className="px-3 py-1.5 mr-1 text-xs border border-white/15 hover:border-accent hover:text-accent"
                  >
                    {open ? "收合 ▲" : "展開 ▼"}
                  </button>
                  <IconBtn label="上移" onClick={() => moveItem(pos, -1)}>↑</IconBtn>
                  <IconBtn label="下移" onClick={() => moveItem(pos, 1)}>↓</IconBtn>
                  <IconBtn label="刪除" danger onClick={() => removeItem(index)}>刪除</IconBtn>
                </div>
              </div>
              {open && (
              <div className="p-4 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
                <ImageInput label="圖片" aspect="aspect-square" value={m.image} onChange={(v) => setItem(index, { ...m, image: v })} />
                <div className="space-y-4">
                  <Grid2>
                    <TextInput label="名稱" value={m.name} onChange={(v) => setItem(index, { ...m, name: v })} />
                    <TextInput label="英文名稱" value={m.nameEn} onChange={(v) => setItem(index, { ...m, nameEn: v })} />
                  </Grid2>
                  <Field label="分類">
                    <select
                      value={m.category}
                      onChange={(e) => setItem(index, { ...m, category: e.target.value })}
                      className="w-full bg-background border border-white/15 focus:border-accent outline-none px-3 py-2 text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <TextArea label="介紹" value={m.description} onChange={(v) => setItem(index, { ...m, description: v })} />
                  <Grid2>
                    <LinesInput label="特色標籤" value={m.features} onChange={(v) => setItem(index, { ...m, features: v })} />
                    <TextInput label={usageLabel} value={m.usage} onChange={(v) => setItem(index, { ...m, usage: v })} />
                  </Grid2>
                </div>
              </div>
              )}
              </>)}
            </SortableItem>
            );
          })}
          </SortableContext>

          <button
            type="button"
            onClick={addItem}
            className="w-full py-3 text-xs tracking-[0.3em] border border-dashed border-white/20 text-foreground/60 hover:border-accent hover:text-accent transition-colors"
          >
            + 新增{noun}{current !== ALL && `到「${current}」`}
          </button>
        </div>
      </div>
      </DndContext>
    </div>
  );
}

function CategoryRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm border-b border-white/5 transition-colors ${
        active ? "bg-accent/15 text-accent" : "hover:bg-white/5"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="text-[11px] text-foreground/40">{count}</span>
    </button>
  );
}
