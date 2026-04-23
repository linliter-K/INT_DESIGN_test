export type Project = {
  id: string;
  title: string;
  titleEn: string;
  category: "住宅空間" | "商業空間" | "公共空間";
  year: string;
  location: string;
  cover: string;
  gallery: string[];
  info: {
    坪數: string;
    類型: string;
    格局: string;
    風格: string;
    工期: string;
    主材: string;
  };
  description: string[];
  concept: string;
};

function gallery(slug: string, count: number, extMap?: Record<number, "png">): string[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const ext = extMap?.[i + 1] ?? "jpg";
    return `/placeholder/${slug}/${n}.${ext}`;
  });
}

export const projects: Project[] = [
  {
    id: "equilibrium",
    title: "靜謐均衡",
    titleEn: "Equilibrium — The Sherwood Residence",
    category: "住宅空間",
    year: "2025",
    location: "台北 信義",
    cover: "/placeholder/residence_41051206052025.jpg",
    gallery: gallery("equilibrium", 15),
    info: {
      坪數: "58 坪",
      類型: "新成屋",
      格局: "3 房 2 廳 2 衛",
      風格: "現代 × 工業",
      工期: "5 個月",
      主材: "黑鐵、石材、胡桃木",
    },
    description: [
      "以「均衡」為命題，將剛硬的工業語彙與溫潤的自然材質交織，營造出沉穩卻不冷冽的居家氛圍。",
      "公共區以開放式設計串聯玄關、客廳與餐廚，讓光線得以在動線中自由流動；主臥則透過灰階色調與柔軟織品，回歸私密與放鬆的本質。",
    ],
    concept:
      "在物件與空間的張力之間，尋找屋主日常真正需要的重量與輕盈。",
  },
  {
    id: "pleasant",
    title: "輕盈生活",
    titleEn: "Pleasant — The Sherwood Residence",
    category: "住宅空間",
    year: "2025",
    location: "台北 大安",
    cover: "/placeholder/residence_04421707052025.jpg",
    gallery: gallery("pleasant", 9, { 2: "png", 3: "png" }),
    info: {
      坪數: "42 坪",
      類型: "新成屋",
      格局: "3 房 2 廳 2 衛",
      風格: "現代簡約",
      工期: "4 個月",
      主材: "白橡木、岩板、鐵件",
    },
    description: [
      "以「輕盈」為基調，採用大面積淺色木皮與霧白塗料，讓整體空間保持視覺上的呼吸感。",
      "客廳選擇低背沙發搭配細框家具，降低視覺壓迫；餐廚則以中島串接，成為家人日常互動的中心。",
    ],
    concept: "讓家成為一首短詩——省去冗贅，只留下讓人想回家的理由。",
  },
  {
    id: "yihai",
    title: "頤海複合居所",
    titleEn: "Yihai Compound Residence",
    category: "住宅空間",
    year: "2025",
    location: "新北 林口",
    cover: "/placeholder/residence_03281122042025.jpg",
    gallery: gallery("yihai", 26),
    info: {
      坪數: "75 坪",
      類型: "複合式住宅",
      格局: "4 房 3 廳 3 衛",
      風格: "工業 × 東方",
      工期: "7 個月",
      主材: "清水模、金屬網、柚木",
    },
    description: [
      "「複合」不僅指空間的多元機能，更指涉生活與工作的共存。此案業主為跨國創業家，空間必須兼顧接待、辦公與家庭三種狀態。",
      "透過一道可變動的金屬網隔屏，公共區能在不同時段轉換為招待廳、辦公室或家庭電影院。",
    ],
    concept: "讓一個家，能在二十四小時內擁有三種表情。",
  },
  {
    id: "serenity",
    title: "靜謐",
    titleEn: "Serenity",
    category: "住宅空間",
    year: "2025",
    location: "台北 內湖",
    cover: "/placeholder/residence_52571007052025.jpg",
    gallery: gallery("serenity", 17),
    info: {
      坪數: "38 坪",
      類型: "中古屋翻新",
      格局: "2 房 2 廳 2 衛",
      風格: "日式現代",
      工期: "4 個月",
      主材: "天然石材、實木、和紙",
    },
    description: [
      "屋主為一對將退休的夫妻，期望家能成為日常冥想的場所。設計以「減法」為原則，保留最低限度的家具與陳設。",
      "光線成為主角——大面積落地窗搭配和紙拉門，讓光影隨時間在地板上緩慢移動。",
    ],
    concept: "真正的靜謐，不是安靜，而是能聽見自己呼吸的節奏。",
  },
  {
    id: "lambency",
    title: "微光",
    titleEn: "Lambency",
    category: "住宅空間",
    year: "2025",
    location: "台北 士林",
    cover: "/placeholder/residence_18351105052025.jpg",
    gallery: gallery("lambency", 12),
    info: {
      坪數: "45 坪",
      類型: "新成屋",
      格局: "3 房 2 廳 2 衛",
      風格: "現代輕奢",
      工期: "5 個月",
      主材: "灰玻、銅件、大理石",
    },
    description: [
      "以「光」為核心，全室以反射性材質為主軸——灰玻、拋光石材、金屬。讓人造光與自然光得以互相折射、疊加。",
      "晚間開啟間接照明後，整個空間呈現出微微發光的感覺，如同將屋主最珍愛的那一刻黃昏永久保存。",
    ],
    concept: "家是光的容器。",
  },
  {
    id: "gathering",
    title: "聚落",
    titleEn: "Gathering — The Village Residence",
    category: "住宅空間",
    year: "2025",
    location: "桃園",
    cover: "/placeholder/residence_13041728042025.jpg",
    gallery: gallery("gathering", 12),
    info: {
      坪數: "65 坪",
      類型: "透天別墅",
      格局: "4 房 3 廳 3 衛",
      風格: "現代 × 侘寂",
      工期: "6 個月",
      主材: "手工磚、藝術塗料、實木",
    },
    description: [
      "屋主是三代同堂的大家庭，設計命題是：如何讓每個人都保有自己的節奏，卻仍能在某些片刻自然聚集。",
      "以「村落」為意象，將餐廚中島擴大為家庭共用的長桌，成為家人自然匯聚的核心。",
    ],
    concept: "家不是分割的房間，而是一座座想走向彼此的島嶼。",
  },
  {
    id: "aurora",
    title: "極光居所",
    titleEn: "Aurora House",
    category: "住宅空間",
    year: "2023",
    location: "台中",
    cover: "/placeholder/residence_19451111082023.jpg",
    gallery: gallery("aurora", 10),
    info: {
      坪數: "50 坪",
      類型: "新成屋",
      格局: "3 房 2 廳 2 衛",
      風格: "現代北歐",
      工期: "5 個月",
      主材: "白橡木、大理石、鐵件",
    },
    description: [
      "以北歐的自然意象為靈感，將極光的色彩光譜轉化為空間中的漸層色系——淺灰、冷藍、溫白。",
      "兒童房採用可變性高的收納系統，讓空間能隨孩子成長而重新配置。",
    ],
    concept: "讓家裡保有一點遠方。",
  },
  {
    id: "no2311",
    title: "NO.2311",
    titleEn: "NO.2311",
    category: "商業空間",
    year: "2023",
    location: "台北 松山",
    cover: "/placeholder/residence_38471107092023.jpg",
    gallery: gallery("no2311", 11),
    info: {
      坪數: "85 坪",
      類型: "商業辦公",
      格局: "接待 + 開放辦公 + 會議",
      風格: "工業現代",
      工期: "3 個月",
      主材: "清水模、鐵網、OSB 板",
    },
    description: [
      "一間新創公司的辦公空間。業主希望空間本身就能成為面試與招募時的品牌宣言。",
      "保留原始樓板與天花的裸露感，以鐵件與木作構築出可靈活調整的工作區；會議室採用玻璃隔間但搭配投射紋理，兼顧開放與隱私。",
    ],
    concept: "工作場域，也能是一件可以被使用的作品。",
  },
  {
    id: "inner-peace",
    title: "靜心",
    titleEn: "Inner Peace",
    category: "住宅空間",
    year: "2022",
    location: "新竹",
    cover: "/placeholder/residence_04401315062022.jpg",
    gallery: gallery("inner-peace", 16),
    info: {
      坪數: "48 坪",
      類型: "中古屋翻新",
      格局: "3 房 2 廳 2 衛",
      風格: "現代禪意",
      工期: "5 個月",
      主材: "柚木、黑御影石、棉麻",
    },
    description: [
      "業主為科技業主管，長期處於高壓工作節奏。家，必須是能讓神經真正放鬆的場所。",
      "全室採用低彩度色系與自然材質，搭配大面積落地窗，讓戶外綠意成為室內最重要的裝飾。",
    ],
    concept: "心之所安，便是吾鄉。",
  },
];

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
