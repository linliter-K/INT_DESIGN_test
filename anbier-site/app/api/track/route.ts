import { recordEvent, type TrackEvent } from "../../lib/analytics";
import { getContent } from "../../lib/content/store";
import { KIND_LABEL } from "../../lib/content/catalog";

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// 只收站內路徑，去掉 query / hash，避免同一頁被拆成很多筆、也避免有人塞亂七八糟的字進排行
function cleanPath(v: unknown) {
  const p = str(v, 200).split(/[?#]/)[0];
  return /^\/[\w\-/%.]*$/.test(p) && !p.startsWith("/admin") && !p.startsWith("/api") ? p.slice(0, 100) : "";
}

export async function POST(request: Request) {
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    // sendBeacon 送來的是純文字，所以不靠 Content-Type 判斷
    body = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }

  let event: TrackEvent | null = null;
  switch (body.t) {
    case "pv": {
      const path = cleanPath(body.path);
      const vid = str(body.vid, 40);
      if (!path || !/^[\w-]{8,40}$/.test(vid)) break;
      let ref = "";
      try {
        const host = new URL(str(body.ref, 300)).hostname.replace(/^www\./, "");
        // 自己網站內部跳轉不算來源
        if (host && host !== new URL(request.url).hostname) ref = host.slice(0, 60);
      } catch {}
      event = { t: "pv", path, vid, ref: ref || undefined, device: body.device === "mobile" ? "mobile" : "desktop" };
      break;
    }
    case "dur": {
      const path = cleanPath(body.path);
      const sec = Math.round(Number(body.sec));
      // 停留不到 1 秒是誤觸，超過 30 分鐘多半是開著分頁去做別的事
      if (path && sec >= 1) event = { t: "dur", path, sec: Math.min(sec, 1800) };
      break;
    }
    case "click": {
      const label = str(body.label, 60).replace(/\s+/g, " ");
      if (label) event = { t: "click", label };
      break;
    }
    case "save": {
      const image = str(body.image, 500);
      const content = await getContent();
      const known = new Set<string>([
        ...content.projects.flatMap((p) => [p.cover, ...p.gallery]),
        ...content.materials.items.map((m) => m.image),
        ...content.furnishings.items.map((m) => m.image),
      ]);
      if (!known.has(image)) break;
      const kind = str(body.kind, 20);
      const href = str(body.href, 200);
      event = {
        t: "save",
        image,
        title: str(body.title, 80),
        kind: Object.hasOwn(KIND_LABEL, kind) ? kind : "project",
        href: href.startsWith("/") ? href : "/",
      };
      break;
    }
  }
  if (!event) return new Response(null, { status: 400 });

  try {
    await recordEvent(event);
  } catch (e) {
    // 監測壞掉不能影響訪客瀏覽，記 log 就好
    console.error("記錄監測事件失敗", e);
  }
  return new Response(null, { status: 204 });
}
