export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-xl tracking-[0.3em]">
                AMB
              </span>
              <span className="text-[10px] tracking-[0.4em] text-muted">
                艾柏設計
              </span>
            </div>
            <p className="text-xs text-foreground/50 leading-relaxed">
              以工業風與現代風為核心的設計事務所，為每一位業主量身打造屬於自己的生活風景。
            </p>
          </div>

          <FooterCol
            title="導覽"
            links={[
              { href: "#home", label: "首頁" },
              { href: "#portfolio", label: "作品" },
              { href: "#services", label: "服務" },
              { href: "#about", label: "關於" },
              { href: "#contact", label: "聯絡" },
            ]}
          />

          <FooterCol
            title="服務"
            links={[
              { href: "#services", label: "住宅設計" },
              { href: "#services", label: "商業空間" },
              { href: "#services", label: "設計諮詢" },
              { href: "#services", label: "工程統包" },
            ]}
          />

          <FooterCol
            title="聯絡資訊"
            links={[
              { href: "tel:+886", label: "+886-2-XXXX-XXXX" },
              { href: "mailto:hello@anbier.design", label: "hello@anbier.design" },
              { href: "#", label: "Instagram" },
              { href: "#", label: "Facebook" },
            ]}
          />
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} AMB 艾柏設計. All rights reserved.
          </p>
          <p className="text-[10px] tracking-[0.3em] text-foreground/30">
            CRAFTED · SPACE · STORY
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-[10px] tracking-[0.4em] text-accent mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-xs text-foreground/60 hover:text-accent transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
