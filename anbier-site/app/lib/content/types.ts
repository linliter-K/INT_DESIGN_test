import type { Project } from "../../data/projects";

export type { Project };

// 標題欄位支援簡易標記：換行 = 斷行、*文字* = 古銅金斜體強調（後台不用懂 HTML 也能排版）
export type RichText = string;

export type ServiceItem = {
  num: string;
  title: string;
  en: string;
  desc: string;
  points: string[];
};

export type Stat = { num: string; label: string; en: string };

export type PlanItem = { label: string; desc: string };

export type Plan = {
  id: string;
  name: string;
  // 適用對象，例如「二房新成屋｜室內約 12–18 坪」
  audience: string;
  tagline: string;
  price: string;
  priceUnit: string;
  priceNote: string;
  image: string;
  highlights: string[];
  items: PlanItem[];
  extras: string;
  note: string;
};

export type PlansSection = {
  kicker: string;
  title: string;
  subtitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaPhone: string;
  items: Plan[];
};

export type CatalogItem = {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  image: string;
  description: string;
  features: string[];
  usage: string;
};

// 舊名稱保留，材質相關程式不用改
export type Material = CatalogItem;

export type CatalogSection = {
  kicker: string;
  title: string;
  subtitle: string;
  // 分類順序 = 前台篩選按鈕順序
  categories: string[];
  items: CatalogItem[];
};

export type SiteContent = {
  hero: {
    kicker: string;
    title: RichText;
    subtitle: string;
    image: string;
    sideText: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  portfolio: { kicker: string; title: string; subtitle: string };
  services: {
    kicker: string;
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  plans: PlansSection;
  about: {
    kicker: string;
    title: RichText;
    paragraphs: string[];
    image: string;
    stats: Stat[];
  };
  contact: {
    kicker: string;
    title: RichText;
    intro: string;
    address: string;
    phone: string;
    email: string;
    hours: string[];
    successTitle: string;
    successText: string;
  };
  footer: {
    tagline: string;
    instagram: string;
    facebook: string;
    slogan: string;
  };
  materials: CatalogSection;
  furnishings: CatalogSection;
  projects: Project[];
};
