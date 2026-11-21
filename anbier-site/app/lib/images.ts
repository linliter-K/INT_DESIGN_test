// 要跟 next.config.ts 的 images.qualities 一致，不在清單內的值會被強制改回 75
export const IMAGE_QUALITY = 85;

// 作品卡片是直式 4:5，但封面常是橫式 3:2：object-cover 要放大到填滿高度，
// 實際需要的圖寬 ≈ 卡片寬 × 1.25 × 1.5 ≈ 1.9 倍，只報卡片寬度的話瀏覽器會拿到太小的圖而糊掉
export const PROJECT_CARD_SIZES = "(min-width: 1024px) 63vw, (min-width: 768px) 94vw, 188vw";
