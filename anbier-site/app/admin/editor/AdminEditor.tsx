"use client";

import { useEffect, useState, useTransition } from "react";
import { saveContent, logout } from "../actions";
import type { SiteContent, Project } from "../../lib/content/types";
import {
  TextInput,
  TextArea,
  LinesInput,
  ImageInput,
  GalleryInput,
  ListEditor,
  Grid2,
  RICH_HINT,
  IconBtn,
  Section,
} from "./fields";
import InquiriesPanel from "./InquiriesPanel";
import CatalogEditor from "./CatalogEditor";
import UsersPanel from "./UsersPanel";
import type { AdminSession } from "../../lib/session";

const TABS = [
  { key: "inquiries", label: "詢問" },
  { key: "home", label: "首頁主視覺" },
  { key: "projects", label: "作品" },
  { key: "materials", label: "材質" },
  { key: "furnishings", label: "軟裝" },
  { key: "services", label: "服務" },
  { key: "about", label: "關於" },
  { key: "contact", label: "聯絡 / 頁尾" },
  { key: "users", label: "帳號", ownerOnly: true },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function AdminEditor({
  initial,
  storageMode,
  session,
  emailConfigured,
}: {
  initial: SiteContent;
  storageMode: "blob" | "local";
  session: AdminSession;
  emailConfigured: boolean;
}) {
  const [content, setContent] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<TabKey>("inquiries");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving, startSaving] = useTransition();

  // 防止改了一堆忘記存就關掉分頁
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => ({ ...c, [key]: value }));
    setDirty(true);
    setStatus(null);
  }

  function save() {
    startSaving(async () => {
      try {
        await saveContent(content);
        setDirty(false);
        setStatus({ ok: true, msg: `已儲存並發布 ${new Date().toLocaleTimeString()}` });
      } catch (e) {
        setStatus({ ok: false, msg: (e as Error).message || "儲存失敗" });
      }
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-lg tracking-[0.3em]">AMB</span>
            <span className="text-[10px] tracking-[0.4em] text-accent">網站後台</span>
            {storageMode === "local" && (
              <span
                title="修改會存進 repo 的 content/site-content.json，推送後正式站就會更新"
                className="text-[10px] px-2 py-0.5 border border-yellow-500/40 text-yellow-400"
              >
                本機模式（推送後生效）
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground/50">登入身分：{session.name}</span>
            {status && (
              <span className={`text-xs ${status.ok ? "text-green-400" : "text-red-400"}`}>
                {status.msg}
              </span>
            )}
            {dirty && !status && <span className="text-xs text-yellow-400">有未儲存的變更</span>}
            <a href="/" target="_blank" className="text-xs text-foreground/60 hover:text-accent">
              查看網站 ↗
            </a>
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="px-5 py-2 text-xs tracking-[0.3em] bg-accent text-background disabled:opacity-40 transition-opacity"
            >
              {saving ? "儲存中…" : "儲存並發布"}
            </button>
            <button
              onClick={() => {
                if (!dirty || window.confirm("還有未儲存的變更，確定要登出？")) logout();
              }}
              className="text-xs text-foreground/50 hover:text-foreground"
            >
              登出
            </button>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
          {TABS.filter((t) => !("ownerOnly" in t) || session.isOwner).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {tab === "inquiries" && <InquiriesPanel emailConfigured={emailConfigured} />}
        {tab === "users" && session.isOwner && <UsersPanel />}

        {tab === "home" && (
          <>
            <Section title="主視覺（首頁最上方）">
              <ImageInput
                label="背景大圖"
                value={content.hero.image}
                onChange={(v) => set("hero", { ...content.hero, image: v })}
              />
              <TextInput label="小標" value={content.hero.kicker} onChange={(v) => set("hero", { ...content.hero, kicker: v })} />
              <TextArea label="大標題" hint={RICH_HINT} rows={2} value={content.hero.title} onChange={(v) => set("hero", { ...content.hero, title: v })} />
              <TextArea label="副標說明" value={content.hero.subtitle} onChange={(v) => set("hero", { ...content.hero, subtitle: v })} />
              <Grid2>
                <TextInput label="主要按鈕文字" value={content.hero.ctaPrimary} onChange={(v) => set("hero", { ...content.hero, ctaPrimary: v })} />
                <TextInput label="次要按鈕文字" value={content.hero.ctaSecondary} onChange={(v) => set("hero", { ...content.hero, ctaSecondary: v })} />
              </Grid2>
              <TextInput label="左側直排小字" value={content.hero.sideText} onChange={(v) => set("hero", { ...content.hero, sideText: v })} />
            </Section>
            <Section title="作品區塊標題">
              <TextInput label="小標" value={content.portfolio.kicker} onChange={(v) => set("portfolio", { ...content.portfolio, kicker: v })} />
              <TextInput label="標題" value={content.portfolio.title} onChange={(v) => set("portfolio", { ...content.portfolio, title: v })} />
              <TextArea label="說明" value={content.portfolio.subtitle} onChange={(v) => set("portfolio", { ...content.portfolio, subtitle: v })} />
            </Section>
          </>
        )}

        {tab === "projects" && (
          <ProjectsEditor projects={content.projects} onChange={(v) => set("projects", v)} />
        )}

        {tab === "materials" && (
          <CatalogEditor
            key="materials"
            noun="材質"
            usageLabel="適用位置"
            section={content.materials}
            onChange={(v) => set("materials", v)}
          />
        )}

        {tab === "furnishings" && (
          <CatalogEditor
            key="furnishings"
            noun="軟裝"
            usageLabel="適用空間"
            section={content.furnishings}
            onChange={(v) => set("furnishings", v)}
          />
        )}

        {tab === "services" && (
          <>
            <Section title="服務區塊標題">
              <TextInput label="小標" value={content.services.kicker} onChange={(v) => set("services", { ...content.services, kicker: v })} />
              <TextInput label="標題" value={content.services.title} onChange={(v) => set("services", { ...content.services, title: v })} />
              <TextArea label="說明" value={content.services.subtitle} onChange={(v) => set("services", { ...content.services, subtitle: v })} />
            </Section>
            <Section title="服務項目">
              <ListEditor
                items={content.services.items}
                onChange={(v) => set("services", { ...content.services, items: v })}
                title={(s) => s.title}
                addLabel="+ 新增服務"
                create={() => ({
                  num: String(content.services.items.length + 1).padStart(2, "0"),
                  title: "新服務",
                  en: "",
                  desc: "",
                  points: [],
                })}
                render={(s, setS) => (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_1fr] gap-4">
                      <TextInput label="編號" value={s.num} onChange={(v) => setS({ ...s, num: v })} />
                      <TextInput label="名稱" value={s.title} onChange={(v) => setS({ ...s, title: v })} />
                      <TextInput label="英文名稱" value={s.en} onChange={(v) => setS({ ...s, en: v })} />
                    </div>
                    <TextArea label="說明" rows={2} value={s.desc} onChange={(v) => setS({ ...s, desc: v })} />
                    <LinesInput label="細項" rows={4} value={s.points} onChange={(v) => setS({ ...s, points: v })} />
                  </>
                )}
              />
            </Section>
          </>
        )}

        {tab === "about" && (
          <>
            <Section title="關於我們">
              <ImageInput label="圖片" aspect="aspect-[4/5]" value={content.about.image} onChange={(v) => set("about", { ...content.about, image: v })} />
              <TextInput label="小標" value={content.about.kicker} onChange={(v) => set("about", { ...content.about, kicker: v })} />
              <TextArea label="標題" hint={RICH_HINT} rows={2} value={content.about.title} onChange={(v) => set("about", { ...content.about, title: v })} />
              <ParagraphsInput value={content.about.paragraphs} onChange={(v) => set("about", { ...content.about, paragraphs: v })} />
            </Section>
            <Section title="數據">
              <ListEditor
                items={content.about.stats}
                onChange={(v) => set("about", { ...content.about, stats: v })}
                title={(s) => `${s.num} ${s.label}`}
                addLabel="+ 新增數據"
                create={() => ({ num: "0", label: "新數據", en: "" })}
                render={(s, setS) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput label="數字" value={s.num} onChange={(v) => setS({ ...s, num: v })} />
                    <TextInput label="名稱" value={s.label} onChange={(v) => setS({ ...s, label: v })} />
                    <TextInput label="英文" value={s.en} onChange={(v) => setS({ ...s, en: v })} />
                  </div>
                )}
              />
            </Section>
          </>
        )}

        {tab === "contact" && (
          <>
            <Section title="聯絡區塊">
              <TextInput label="小標" value={content.contact.kicker} onChange={(v) => set("contact", { ...content.contact, kicker: v })} />
              <TextArea label="標題" hint={RICH_HINT} rows={2} value={content.contact.title} onChange={(v) => set("contact", { ...content.contact, title: v })} />
              <TextArea label="說明" value={content.contact.intro} onChange={(v) => set("contact", { ...content.contact, intro: v })} />
              <TextArea label="地址" hint="可按 Enter 換行" rows={2} value={content.contact.address} onChange={(v) => set("contact", { ...content.contact, address: v })} />
              <Grid2>
                <TextInput label="電話" value={content.contact.phone} onChange={(v) => set("contact", { ...content.contact, phone: v })} />
                <TextInput label="Email" value={content.contact.email} onChange={(v) => set("contact", { ...content.contact, email: v })} />
              </Grid2>
              <LinesInput label="營業時間" value={content.contact.hours} onChange={(v) => set("contact", { ...content.contact, hours: v })} />
              <Grid2>
                <TextInput label="表單送出後標題" value={content.contact.successTitle} onChange={(v) => set("contact", { ...content.contact, successTitle: v })} />
                <TextInput label="表單送出後說明" value={content.contact.successText} onChange={(v) => set("contact", { ...content.contact, successText: v })} />
              </Grid2>
            </Section>
            <Section title="頁尾">
              <TextArea label="品牌簡介" rows={2} value={content.footer.tagline} onChange={(v) => set("footer", { ...content.footer, tagline: v })} />
              <Grid2>
                <TextInput label="Instagram 網址" placeholder="https://instagram.com/…" hint="留空就不顯示" value={content.footer.instagram} onChange={(v) => set("footer", { ...content.footer, instagram: v })} />
                <TextInput label="Facebook 網址" placeholder="https://facebook.com/…" hint="留空就不顯示" value={content.footer.facebook} onChange={(v) => set("footer", { ...content.footer, facebook: v })} />
              </Grid2>
              <TextInput label="右下角標語" value={content.footer.slogan} onChange={(v) => set("footer", { ...content.footer, slogan: v })} />
            </Section>
          </>
        )}
      </main>
    </div>
  );
}

function ParagraphsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      {value.map((p, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1">
            <TextArea
              label={`段落 ${i + 1}`}
              value={p}
              onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))}
            />
          </div>
          <div className="pt-7">
            <IconBtn label="刪除段落" danger onClick={() => onChange(value.filter((_, k) => k !== i))}>
              ✕
            </IconBtn>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="text-xs text-accent hover:underline"
      >
        + 新增段落
      </button>
    </div>
  );
}

function ProjectsEditor({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (v: Project[]) => void;
}) {
  const [sel, setSel] = useState(0);
  const p = projects[sel];

  function update(next: Project) {
    onChange(projects.map((x, i) => (i === sel ? next : x)));
  }

  function add() {
    const id = `project-${Date.now().toString(36)}`;
    onChange([
      ...projects,
      {
        id,
        title: "新作品",
        titleEn: "",
        category: "住宅空間",
        year: String(new Date().getFullYear()),
        location: "",
        cover: "",
        gallery: [],
        info: { 坪數: "", 類型: "", 格局: "", 風格: "", 工期: "", 主材: "" },
        description: [""],
        concept: "",
      },
    ]);
    setSel(projects.length);
  }

  function remove() {
    if (!window.confirm(`確定刪除作品「${p.title}」？（按「儲存並發布」後才會真正從網站移除）`)) return;
    onChange(projects.filter((_, i) => i !== sel));
    setSel(Math.max(0, sel - 1));
  }

  function move(d: number) {
    const j = sel + d;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[sel], next[j]] = [next[j], next[sel]];
    onChange(next);
    setSel(j);
  }

  const infoRows = Object.entries(p?.info ?? {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="bg-surface border border-white/5 self-start lg:sticky lg:top-32">
        <div className="max-h-[60vh] overflow-y-auto">
          {projects.map((x, i) => (
            <button
              key={`${x.id}-${i}`}
              onClick={() => setSel(i)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left border-b border-white/5 transition-colors ${
                i === sel ? "bg-accent/15" : "hover:bg-white/5"
              }`}
            >
              <span className="relative w-10 h-12 shrink-0 bg-background overflow-hidden">
                {x.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm truncate ${i === sel ? "text-accent" : ""}`}>{x.title}</span>
                <span className="block text-[10px] text-foreground/40 truncate">{x.category} · {x.year}</span>
              </span>
            </button>
          ))}
        </div>
        <button onClick={add} className="w-full py-3 text-xs tracking-[0.3em] text-accent hover:bg-accent/10">
          + 新增作品
        </button>
      </aside>

      {p ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">{p.title}</h2>
            <div className="flex gap-2 text-xs">
              <button onClick={() => move(-1)} className="px-3 py-1.5 border border-white/15 hover:border-accent">↑ 往前排</button>
              <button onClick={() => move(1)} className="px-3 py-1.5 border border-white/15 hover:border-accent">↓ 往後排</button>
              <a href={`/projects/${p.id}`} target="_blank" className="px-3 py-1.5 border border-white/15 hover:border-accent">預覽 ↗</a>
              <button onClick={remove} className="px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10">刪除作品</button>
            </div>
          </div>

          <Section title="基本資料">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
              <ImageInput label="封面" aspect="aspect-[4/5]" value={p.cover} onChange={(v) => update({ ...p, cover: v })} />
              <div className="space-y-4">
                <Grid2>
                  <TextInput label="作品名稱" value={p.title} onChange={(v) => update({ ...p, title: v })} />
                  <TextInput label="英文名稱" value={p.titleEn} onChange={(v) => update({ ...p, titleEn: v })} />
                </Grid2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextInput label="分類" value={p.category} onChange={(v) => update({ ...p, category: v })} hint="住宅空間 / 商業空間…" />
                  <TextInput label="年份" value={p.year} onChange={(v) => update({ ...p, year: v })} />
                  <TextInput label="地點" value={p.location} onChange={(v) => update({ ...p, location: v })} />
                </div>
                <TextInput
                  label="網址代碼"
                  hint={`網址會是 /projects/${p.id}（只能用小寫英文、數字、-）`}
                  value={p.id}
                  onChange={(v) => update({ ...p, id: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                />
              </div>
            </div>
          </Section>

          <Section title="設計理念與描述">
            <TextArea label="設計理念（大字引言）" rows={2} value={p.concept} onChange={(v) => update({ ...p, concept: v })} />
            <ParagraphsInput value={p.description} onChange={(v) => update({ ...p, description: v })} />
          </Section>

          <Section title="作品資訊表">
            <div className="space-y-2">
              {infoRows.map(([k, v], i) => (
                <div key={i} className="grid grid-cols-[140px_1fr_auto] gap-2 items-center">
                  <input
                    className="bg-background border border-white/15 focus:border-accent outline-none px-3 py-2 text-sm"
                    value={k}
                    onChange={(e) => {
                      const rows = infoRows.map((r, j) => (j === i ? [e.target.value, r[1]] : r));
                      update({ ...p, info: Object.fromEntries(rows) });
                    }}
                  />
                  <input
                    className="bg-background border border-white/15 focus:border-accent outline-none px-3 py-2 text-sm"
                    value={v}
                    onChange={(e) => update({ ...p, info: { ...p.info, [k]: e.target.value } })}
                  />
                  <IconBtn
                    label="刪除欄位"
                    danger
                    onClick={() => update({ ...p, info: Object.fromEntries(infoRows.filter((_, j) => j !== i)) })}
                  >
                    ✕
                  </IconBtn>
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => update({ ...p, info: { ...p.info, [`新欄位${infoRows.length + 1}`]: "" } })}
              >
                + 新增欄位
              </button>
            </div>
          </Section>

          <Section title="作品影像">
            <GalleryInput value={p.gallery} onChange={(v) => update({ ...p, gallery: v })} />
          </Section>
        </div>
      ) : (
        <p className="text-foreground/50">還沒有作品，按左側「新增作品」開始。</p>
      )}
    </div>
  );
}
