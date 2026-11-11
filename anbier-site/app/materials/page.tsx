import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getContent } from "../lib/content/store";
import MaterialsGrid from "./MaterialsGrid";

export const metadata = {
  title: "材質 Materials | AMB 艾柏設計",
  description: "AMB 艾柏設計常用主材——金屬、石材、木作、泥作與織品的特性與適用位置。",
};

export default async function MaterialsPage() {
  const { materials } = await getContent();
  return (
    <>
      <Nav />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-6 lg:px-12 mb-14">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-accent" />
              <span className="text-accent text-xs tracking-[0.5em]">
                {materials.kicker}
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05]">
              {materials.title}
            </h1>
            <p className="mt-6 text-foreground/60 max-w-2xl leading-relaxed">
              {materials.subtitle}
            </p>
          </div>
        </section>

        <section className="px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            <MaterialsGrid items={materials.items} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
