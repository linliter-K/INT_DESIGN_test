import CatalogPage from "../components/CatalogPage";
import { getContent } from "../lib/content/store";

export const metadata = {
  title: "軟裝 Furnishing | AMB 艾柏設計",
  description: "AMB 艾柏設計軟裝選品——沙發、桌椅、燈具、窗簾與智能家電的搭配建議。",
};

export default async function FurnishingsPage() {
  const { furnishings } = await getContent();
  return <CatalogPage kind="furnishing" section={furnishings} />;
}
