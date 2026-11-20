"use client";

import { useRef, useState } from "react";
import Image from "next/image";

// 3D 漫遊檔案很大、載入要十幾秒，所以先放封面，訪客點了才載入 iframe，避免拖慢整頁
export default function SimulationViewer({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const [active, setActive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  function fullscreen() {
    boxRef.current?.requestFullscreen?.().catch(() => {
      // iOS Safari 不支援元素全螢幕，直接開新分頁看
      window.open(src, "_blank", "noopener");
    });
  }

  return (
    <div>
      <div
        ref={boxRef}
        className="relative w-full aspect-[4/3] md:aspect-video bg-surface overflow-hidden border border-white/5"
      >
        {active ? (
          <iframe
            src={src}
            title={`${title} 3D 模擬影像`}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0 w-full h-full"
            aria-label="進入 3D 漫遊"
          >
            <Image src={poster} alt="" fill sizes="(max-width: 1400px) 100vw, 1400px" className="object-cover" />
            <span className="absolute inset-0 bg-background/60 group-hover:bg-background/45 transition-colors duration-500" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <span className="w-20 h-20 rounded-full border border-accent flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-background transition-colors duration-500">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-sm tracking-[0.4em] text-foreground">進入 3D 漫遊</span>
              <span className="text-[10px] tracking-[0.3em] text-foreground/50">首次載入約需 10–20 秒</span>
            </span>
          </button>
        )}
      </div>
      {active && (
        <div className="mt-4 flex justify-end gap-6 text-[10px] tracking-[0.3em] text-foreground/50">
          <button type="button" onClick={fullscreen} className="hover:text-accent transition-colors">
            全螢幕 ⤢
          </button>
          <a href={src} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
            新分頁開啟 ↗
          </a>
        </div>
      )}
    </div>
  );
}
