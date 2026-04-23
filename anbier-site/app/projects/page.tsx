import Link from "next/link";
import Image from "next/image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { projects } from "../data/projects";

export const metadata = {
  title: "作品 Works | AMB 艾柏設計",
  description: "AMB 艾柏設計完整作品列表——住宅、商業、公共空間。",
};

export default function AllProjectsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 pt-32 pb-24">
        <section className="px-6 lg:px-12 mb-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px w-10 bg-accent" />
              <span className="text-accent text-xs tracking-[0.5em]">
                ALL WORKS
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.05]">
              作品總覽
            </h1>
            <p className="mt-6 text-foreground/60 max-w-2xl leading-relaxed">
              每一件作品，都是 AMB 艾柏設計對「家」與「場所」的不同提問。
              共 {projects.length} 件精選作品。
            </p>
          </div>
        </section>

        <section className="px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group block relative overflow-hidden bg-surface"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                  <span className="absolute top-5 left-5 px-3 py-1 text-[10px] tracking-[0.3em] border border-foreground/30 text-foreground/80 backdrop-blur-sm">
                    {p.category}
                  </span>
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-6 lg:p-8">
                      <p className="text-accent text-[10px] tracking-[0.4em] mb-2">
                        {p.year} · {p.location}
                      </p>
                      <h3 className="font-serif text-2xl lg:text-3xl text-foreground mb-1">
                        {p.title}
                      </h3>
                      <p className="text-xs tracking-[0.2em] text-foreground/60 italic">
                        {p.titleEn}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
