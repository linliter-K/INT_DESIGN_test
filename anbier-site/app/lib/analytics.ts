import { Redis } from "@upstash/redis";

// 每天一組 key：a:<種類>:<YYYY-MM-DD>；保留約 13 個月，夠看去年同期
const PREFIX = "a:";
const TTL_SECONDS = 60 * 60 * 24 * 400;

export type TrackEvent =
  | { t: "pv"; path: string; vid: string; ref?: string; device: "mobile" | "desktop" }
  | { t: "dur"; path: string; sec: number }
  | { t: "click"; label: string }
  | { t: "save"; image: string; title: string; kind: string; href: string }
  | { t: "inquiry" };

// Vercel 的 Upstash 整合會給 KV_* 或 UPSTASH_* 其中一組名稱
function redisFromEnv() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token, enableAutoPipelining: true }) : null;
}

export function isAnalyticsConnected() {
  return redisFromEnv() !== null;
}

// 本機沒接 Redis 時用記憶體模擬同樣的指令，讓 localhost 也能測整套流程（重開 dev server 會清空）
type Store = {
  hincrby(key: string, field: string, n: number): Promise<unknown>;
  hset(key: string, values: Record<string, string>): Promise<unknown>;
  hgetall(key: string): Promise<Record<string, unknown> | null>;
  pfadd(key: string, member: string): Promise<unknown>;
  pfcount(...keys: string[]): Promise<number>;
  expire(key: string, sec: number): Promise<unknown>;
};

const g = globalThis as unknown as { __ambMemStore?: Map<string, Map<string, number | string> | Set<string>> };

function memoryStore(): Store {
  const db = (g.__ambMemStore ??= new Map());
  const hash = (k: string) => {
    let h = db.get(k);
    if (!(h instanceof Map)) db.set(k, (h = new Map()));
    return h as Map<string, number | string>;
  };
  const set = (k: string) => {
    let s = db.get(k);
    if (!(s instanceof Set)) db.set(k, (s = new Set()));
    return s as Set<string>;
  };
  return {
    async hincrby(k, f, n) {
      const h = hash(k);
      h.set(f, Number(h.get(f) ?? 0) + n);
    },
    async hset(k, values) {
      const h = hash(k);
      for (const [f, v] of Object.entries(values)) h.set(f, v);
    },
    async hgetall(k) {
      const h = db.get(k);
      return h instanceof Map ? Object.fromEntries(h) : null;
    },
    async pfadd(k, m) {
      set(k).add(m);
    },
    async pfcount(...keys) {
      const all = new Set<string>();
      for (const k of keys) {
        const s = db.get(k);
        if (s instanceof Set) s.forEach((m) => all.add(m));
      }
      return all.size;
    },
    async expire() {},
  };
}

function store(): Store {
  return (redisFromEnv() as unknown as Store | null) ?? memoryStore();
}

// 以台灣時間切日，避免凌晨的瀏覽被算到前一天
export function dayKey(offsetDays = 0, now = Date.now()) {
  return new Date(now + 8 * 3600_000 - offsetDays * 86400_000).toISOString().slice(0, 10);
}

const key = (kind: string, day: string) => `${PREFIX}${kind}:${day}`;

async function bump(kind: string, day: string, field: string, n = 1) {
  const s = store();
  const k = key(kind, day);
  await Promise.all([s.hincrby(k, field, n), s.expire(k, TTL_SECONDS)]);
}

export async function recordEvent(e: TrackEvent) {
  const day = dayKey();
  const s = store();
  switch (e.t) {
    case "pv": {
      const uv = key("uv", day);
      await Promise.all([
        bump("pv", day, e.path),
        s.pfadd(uv, e.vid),
        s.expire(uv, TTL_SECONDS),
        bump("dev", day, e.device),
        e.ref ? bump("ref", day, e.ref) : null,
      ]);
      return;
    }
    case "dur":
      // 平均停留 = 總秒數 ÷ 瀏覽數；手機會分好幾段送，所以不另外計「次數」
      await bump("dur", day, e.path, e.sec);
      return;
    case "click":
      await bump("click", day, e.label);
      return;
    case "save":
      // 計數以圖片網址為鍵；名稱等資訊另存一份，後台排行才能顯示縮圖與標題
      await Promise.all([
        bump("save", day, e.image),
        s.hset(`${PREFIX}saveinfo`, { [e.image]: JSON.stringify({ title: e.title, kind: e.kind, href: e.href }) }),
      ]);
      return;
    case "inquiry":
      await bump("inq", day, "total");
      return;
  }
}

export type Ranked = { name: string; value: number };
export type SaveRanked = Ranked & { title: string; kind: string; href: string };

export type AnalyticsReport = {
  days: number;
  connected: boolean;
  totals: {
    visitors: number;
    pageviews: number;
    avgSeconds: number;
    saves: number;
    inquiries: number;
    clicks: number;
  };
  daily: { day: string; visitors: number; pageviews: number }[];
  pages: { path: string; views: number; avgSeconds: number }[];
  clicks: Ranked[];
  saves: SaveRanked[];
  referrers: Ranked[];
  devices: Ranked[];
};

function sumHashes(hashes: (Record<string, unknown> | null)[]) {
  const out = new Map<string, number>();
  for (const h of hashes) {
    if (!h) continue;
    for (const [f, v] of Object.entries(h)) out.set(f, (out.get(f) ?? 0) + Number(v));
  }
  return out;
}

const rank = (m: Map<string, number>, limit = 20): Ranked[] =>
  [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

const total = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);

export async function getReport(days: number): Promise<AnalyticsReport> {
  const s = store();
  // 由舊到新，圖表才會從左往右走
  const dayList = Array.from({ length: days }, (_, i) => dayKey(days - 1 - i));
  const fetchAll = (kind: string) => Promise.all(dayList.map((d) => s.hgetall(key(kind, d))));

  const [pvDaily, durDaily, clickDaily, saveDaily, refDaily, devDaily, inqDaily, uvDaily, uvTotal, saveInfo] =
    await Promise.all([
      fetchAll("pv"),
      fetchAll("dur"),
      fetchAll("click"),
      fetchAll("save"),
      fetchAll("ref"),
      fetchAll("dev"),
      fetchAll("inq"),
      Promise.all(dayList.map((d) => s.pfcount(key("uv", d)))),
      s.pfcount(...dayList.map((d) => key("uv", d))),
      s.hgetall(`${PREFIX}saveinfo`),
    ]);

  const pv = sumHashes(pvDaily);
  const dur = sumHashes(durDaily);
  const saves = sumHashes(saveDaily);
  const clicks = sumHashes(clickDaily);

  const pages = [...pv.entries()]
    .map(([path, views]) => ({
      path,
      views,
      avgSeconds: Math.round((dur.get(path) ?? 0) / views),
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 30);

  const parseInfo = (raw: unknown) => {
    try {
      return typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, string>) ?? {};
    } catch {
      return {};
    }
  };

  return {
    days,
    connected: isAnalyticsConnected(),
    totals: {
      visitors: uvTotal,
      pageviews: total(pv),
      avgSeconds: total(pv) ? Math.round(total(dur) / total(pv)) : 0,
      saves: total(saves),
      inquiries: total(sumHashes(inqDaily)),
      clicks: total(clicks),
    },
    daily: dayList.map((day, i) => ({
      day,
      visitors: uvDaily[i],
      pageviews: total(sumHashes([pvDaily[i]])),
    })),
    pages,
    clicks: rank(clicks),
    saves: rank(saves).map((r) => {
      const info = parseInfo(saveInfo?.[r.name]);
      return { ...r, title: info.title ?? "", kind: info.kind ?? "project", href: info.href ?? "/" };
    }),
    referrers: rank(sumHashes(refDaily), 10),
    devices: rank(sumHashes(devDaily), 5),
  };
}
