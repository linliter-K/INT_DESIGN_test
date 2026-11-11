import type { CatalogSection } from "./types";

// 材質與軟裝共用同一套「分類 + 卡片」結構
export type CatalogKind = "material" | "furnishing";
export type RefKind = "project" | CatalogKind;

export const KIND_LABEL: Record<RefKind, string> = {
  project: "作品",
  material: "材質",
  furnishing: "軟裝",
};

export const CATALOG_PATH: Record<CatalogKind, string> = {
  material: "/materials",
  furnishing: "/furnishings",
};

// 以分類清單的順序為主，再補上卡片裡出現、但清單沒列到的分類（舊資料或手動改過的情況）
export function catalogCategories(section: CatalogSection): string[] {
  const list = [...(section.categories ?? [])];
  for (const m of section.items) {
    if (m.category && !list.includes(m.category)) list.push(m.category);
  }
  return list;
}
