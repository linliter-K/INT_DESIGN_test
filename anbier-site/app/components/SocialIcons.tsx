// lucide 新版已移除品牌圖示，所以 IG／FB 用自畫 SVG（線條風格與站內其他圖示一致）
export type SocialLinks = { instagram?: string; facebook?: string };

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" strokeLinejoin="round" />
    </svg>
  );
}

export default function SocialIcons({
  instagram,
  facebook,
  size = 22,
  className = "",
}: SocialLinks & { size?: number; className?: string }) {
  const items = [
    instagram && { href: instagram, label: "Instagram", Icon: InstagramIcon },
    facebook && { href: facebook, label: "Facebook", Icon: FacebookIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  // 後台沒填網址就整排不顯示，避免出現點了沒反應的圖示
  if (items.length === 0) return null;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="text-foreground/60 hover:text-accent transition-colors"
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
