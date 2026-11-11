import Nav from "./Nav";
import Footer from "./Footer";
import CatalogGrid from "./CatalogGrid";
import { catalogCategories, type CatalogKind } from "../lib/content/catalog";
import type { CatalogSection } from "../lib/content/types";

export default function CatalogPage({
  kind,
  section,
}: {
  kind: CatalogKind;
  section: CatalogSection;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-6 lg:px-12 mb-14">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-accent" />
              <span className="text-accent text-xs tracking-[0.5em]">{section.kicker}</span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05]">
              {section.title}
            </h1>
            <p className="mt-6 text-foreground/60 max-w-2xl leading-relaxed">{section.subtitle}</p>
          </div>
        </section>

        <section className="px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            <CatalogGrid kind={kind} items={section.items} categoryOrder={catalogCategories(section)} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
