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
