import { getContent } from "../lib/content/store";
import NavClient from "./NavClient";

// Nav 本體是 client component 拿不到後台內容，由這層 server 包裝把 IG／FB 網址傳進去
export default async function Nav() {
  const { footer } = await getContent();
  return <NavClient social={{ instagram: footer.instagram, facebook: footer.facebook }} />;
}
