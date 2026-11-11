import { projects } from "../../data/projects";
import type { SiteContent } from "./types";

// 後台尚未存過任何內容時的初始版本；也是新增欄位時的補值來源
export const defaultContent: SiteContent = {
  hero: {
    kicker: "— AMB INTERIOR DESIGN",
    title: "在光影之間\n*雕塑*生活",
    subtitle:
      "以工業風的沉穩骨架，承載現代生活的輕盈。AMB 艾柏設計相信，空間不只是容器，而是敘事本身。",
    image: "/placeholder/covers/equilibrium.png",
    sideText: "INTERIOR · ARCHITECTURE · SPACE",
    ctaPrimary: "探索作品",
    ctaSecondary: "預約諮詢 →",
  },
  portfolio: {
    kicker: "SELECTED WORKS",
    title: "近期作品",
    subtitle:
      "從住宅到商業空間，每個案子都是一次關於生活方式的提案。以下為 AMB 近期部分作品選粹。",
  },
  services: {
    kicker: "WHAT WE DO",
    title: "服務項目",
    subtitle:
      "以工業風與現代風為核心，橫跨各式設計語彙——從私領域的家，到公領域的商業場所。",
    items: [
      {
        num: "01",
        title: "住宅空間設計",
        en: "Residential Design",
        desc: "從格局配置到軟裝挑選，量身打造屬於屋主生活節奏的家。",
        points: ["格局規劃", "風格定位", "軟裝佈置", "燈光照明"],
      },
      {
        num: "02",
        title: "商業空間設計",
        en: "Commercial Design",
        desc: "為品牌打造兼顧視覺辨識與顧客體驗的商業場域。",
        points: ["餐飲空間", "零售門市", "辦公空間", "展示空間"],
      },
      {
        num: "03",
        title: "設計諮詢",
        en: "Design Consultation",
        desc: "針對屋主既有空間提供專業風格、動線與採購建議。",
        points: ["風格評估", "動線檢討", "採購建議", "色彩計畫"],
      },
      {
        num: "04",
        title: "工程統包施工",
        en: "Construction Management",
        desc: "從拆除、水電到木作、系統櫃，全案監造一條龍。",
        points: ["泥作木作", "水電工程", "系統櫃體", "完工保固"],
      },
    ],
  },
  about: {
    kicker: "ABOUT AMB",
    title: "讓每一處轉角，\n都有*被凝視*的理由。",
    paragraphs: [
      "AMB 艾柏設計成立於 2009 年，從一間小型設計工作室出發，至今已完成超過 200 件住宅與商業空間設計。我們相信「設計是生活的骨架」——每一次規劃都從屋主的日常節奏開始。",
      "以工業風與現代風為我們的設計語彙核心，但不拘泥於單一風格；依據每位業主的個性與需求，靈活融入日式、北歐、輕奢、侘寂等不同元素，創造出真正屬於你的場所。",
    ],
    image: "/placeholder/covers/serenity.png",
    stats: [
      { num: "15+", label: "設計年資", en: "Years" },
      { num: "200+", label: "完工案件", en: "Projects" },
      { num: "98%", label: "客戶滿意度", en: "Satisfaction" },
      { num: "12", label: "設計獎項", en: "Awards" },
    ],
  },
  contact: {
    kicker: "GET IN TOUCH",
    title: "談談你的\n*理想空間*",
    intro:
      "不論是正在裝修的新家、想翻新的老宅，或是品牌開店計畫——留下訊息，我們會在 1 個工作日內回覆。",
    address: "台北市大安區仁愛路四段 XXX 號 X 樓\n（暫定地址，待替換）",
    phone: "+886-2-XXXX-XXXX",
    email: "hello@anbier.design",
    hours: ["週一至週五 10:00 – 19:00", "週末採預約制"],
    successTitle: "訊息已送出",
    successText: "感謝您的來信，AMB 團隊會於 1 個工作日內與您聯繫。",
  },
  footer: {
    tagline:
      "以工業風與現代風為核心的設計事務所，為每一位業主量身打造屬於自己的生活風景。",
    instagram: "",
    facebook: "",
    slogan: "CRAFTED · SPACE · STORY",
  },
  materials: {
    kicker: "MATERIAL LIBRARY",
    title: "材質選樣",
    subtitle:
      "材質決定空間的溫度。以下是 AMB 常用的主材，每一種都經過實際施作驗證——觸感、耐用度與老化後的樣貌，我們都替你想過。",
    items: [
      {
        id: "black-iron",
        name: "黑鐵",
        nameEn: "Blackened Steel",
        category: "金屬",
        image: "/placeholder/materials/black-iron.png",
        description:
          "工業風的靈魂材質。經過發黑與封蠟處理後，保留鍛造痕跡與自然色差，越用越有味道。",
        features: ["線條俐落", "可薄可承重", "可訂製造型"],
        usage: "樓梯扶手、層架、隔屏、門框",
      },
      {
        id: "concrete",
        name: "清水模",
        nameEn: "Fair-faced Concrete",
        category: "泥作",
        image: "/placeholder/materials/concrete.png",
        description:
          "保留混凝土最原始的質地與模板紋理。也可用清水模塗料在既有牆面上仿作，兼顧預算與效果。",
        features: ["質樸沉穩", "低彩度百搭", "可仿作施工"],
        usage: "主牆、天花、商業空間地坪",
      },
      {
        id: "walnut",
        name: "胡桃木",
        nameEn: "Walnut",
        category: "木作",
        image: "/placeholder/materials/walnut.png",
        description:
          "深褐色調帶有細緻流動的紋理，能為冷調的工業語彙注入溫潤感，是我們最常用的實木皮之一。",
        features: ["紋理細緻", "色澤溫潤", "質感高級"],
        usage: "櫃體門片、餐桌、牆面木皮",
      },
      {
        id: "white-oak",
        name: "白橡木",
        nameEn: "White Oak",
        category: "木作",
        image: "/placeholder/materials/white-oak.png",
        description:
          "淺色直紋，北歐與日式空間的首選。搭配霧面塗裝，能讓空間保持明亮與呼吸感。",
        features: ["明亮清爽", "直紋耐看", "耐磨耐用"],
        usage: "木地板、系統櫃、天花造型",
      },
      {
        id: "marble",
        name: "大理石",
        nameEn: "Marble",
        category: "石材",
        image: "/placeholder/materials/marble.png",
        description:
          "每一塊都是獨一無二的天然紋路。適合作為空間焦點，搭配黑鐵或木作能平衡奢華與日常感。",
        features: ["天然紋理", "質感奢華", "每片皆不同"],
        usage: "電視主牆、中島檯面、玄關地坪",
      },
      {
        id: "slate",
        name: "岩板",
        nameEn: "Sintered Stone",
        category: "石材",
        image: "/placeholder/materials/slate.png",
        description:
          "高溫燒結的大板材，有石材的外觀卻更耐刮、耐熱、不吃色，是廚房檯面的實用選擇。",
        features: ["耐刮耐熱", "不吃色", "大板無縫"],
        usage: "廚房檯面、浴室牆面、餐桌面",
      },
      {
        id: "terrazzo",
        name: "磨石子",
        nameEn: "Terrazzo",
        category: "泥作",
        image: "/placeholder/materials/terrazzo.png",
        description:
          "台灣老屋的記憶材質，經現代配色重新詮釋後，成為兼具懷舊與設計感的地坪選擇。",
        features: ["懷舊復古", "可客製配色", "耐用好清潔"],
        usage: "地坪、樓梯踏面、浴室檯面",
      },
      {
        id: "linen",
        name: "棉麻織品",
        nameEn: "Linen",
        category: "織品",
        image: "/placeholder/materials/linen.png",
        description:
          "天然纖維的柔軟與皺褶感，能軟化硬材質主導的空間，用於窗簾與寢具最能感受到差異。",
        features: ["透氣自然", "柔化空間", "觸感舒適"],
        usage: "窗簾、寢具、沙發布套",
      },
    ],
  },
  projects,
};
