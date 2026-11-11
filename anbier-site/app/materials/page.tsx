import CatalogPage from "../components/CatalogPage";
import { getContent } from "../lib/content/store";

export const metadata = {
  title: "材質 Materials | AMB 艾柏設計",
  description: "AMB 艾柏設計常用主材——金屬、石材、木作、泥作與織品的特性與適用位置。",
};

export default async function MaterialsPage() {
  const { materials } = await getContent();
  return <CatalogPage kind="material" section={materials} />;
}
