import Link from "next/link";
import { getContent } from "../lib/content/store";

export default async function Footer() {
  const { footer, contact, services } = await getContent();

  const contactLinks = [
    { href: `tel:${contact.phone.replace(/[^\d+]/g, "")}`, label: contact.phone },
    { href: `mailto:${contact.email}`, label: contact.email },
    ...(footer.instagram ? [{ href: footer.instagram, label: "Instagram" }] : []),
    ...(footer.facebook ? [{ href: footer.facebook, label: "Facebook" }] : []),
  ];

  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 gap-10 mb-12 md:flex md:justify-between">
          <div className="col-span-2 md:max-w-[260px]">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-xl tracking-[0.3em]">
                AMB
              </span>
              <span className="text-[10px] tracking-[0.4em] text-muted">
                艾柏設計
              </span>
            </div>
            <p className="text-xs text-foreground/50 leading-relaxed">
              {footer.tagline}
            </p>
          </div>

          <FooterCol
            title="導覽"
            links={[
              { href: "/#home", label: "首頁" },
              { href: "/#portfolio", label: "作品" },
              { href: "/materials", label: "材質" },
              { href: "/furnishings", label: "軟裝" },
              { href: "/#services", label: "服務" },
              { href: "/#about", label: "關於" },
              { href: "/#contact", label: "聯絡" },
            ]}
          />

          <FooterCol
            title="服務"
            links={services.items.map((s) => ({
              href: "/#services",
              label: s.title,
            }))}
          />

          <FooterCol title="聯絡資訊" links={contactLinks} />
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* 後台入口刻意做得跟一般版權字樣一模一樣，不加 hover 效果 */}
          <Link
            href="/admin"
            prefetch={false}
            className="text-xs text-foreground/40 cursor-text"
          >
            © {new Date().getFullYear()} AMB 艾柏設計. All rights reserved.
          </Link>
          <p className="text-[10px] tracking-[0.3em] text-foreground/30">
            {footer.slogan}
          </p>
        </div>
      </div>
    </footer>
  );
}

// 每 4 個連結換一列（照順序填滿再換），頁尾才不會拉得很長
// （導覽 7 個 → 首頁/作品/材質/軟裝 | 服務/關於/聯絡）
const PER_COLUMN = 4;

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  const columns: (typeof links)[] = [];
  for (let i = 0; i < links.length; i += PER_COLUMN) {
    columns.push(links.slice(i, i + PER_COLUMN));
  }
  return (
    <div>
      <h4 className="text-[10px] tracking-[0.4em] text-accent mb-4">{title}</h4>
      <div className="flex gap-x-10">
        {columns.map((col, c) => (
          <ul key={c} className="space-y-2">
            {col.map((l, i) => (
              <li key={i}>
                <a
                  href={l.href}
                  className="text-xs text-foreground/60 hover:text-accent transition-colors whitespace-nowrap"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
