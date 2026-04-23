import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { projects, getProject } from "../../data/projects";
import ProjectGallery from "./ProjectGallery";

export async function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProject(id);
  if (!p) return {};
  return {
    title: `${p.title} ${p.titleEn} | AMB 艾柏設計`,
    description: p.description[0],
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.id === id);
  const prev = projects[(idx - 1 + projects.length) % projects.length];
  const next = projects[(idx + 1) % projects.length];

  return (
    <>
      <Nav />
      <main className="flex-1 pt-20">
        {/* Hero banner */}
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-[1400px] mx-auto w-full px-6 lg:px-12 pb-16">
              <div className="flex items-center gap-3 text-accent text-xs tracking-[0.4em] mb-5">
                <span className="h-px w-10 bg-accent" />
                <span>{project.category}</span>
                <span className="text-foreground/40">/</span>
                <span>
                  {project.year} · {project.location}
                </span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light leading-[1.05]">
                {project.title}
              </h1>
              <p className="mt-4 text-sm md:text-base tracking-[0.2em] text-foreground/60 italic">
                {project.titleEn}
              </p>
            </div>
          </div>
        </section>

        {/* Concept + Info */}
        <section className="py-24 lg:py-32 px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-4 mb-6">
                <span className="h-px w-10 bg-accent" />
                <span className="text-accent text-xs tracking-[0.5em]">
                  CONCEPT
                </span>
              </div>
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl leading-[1.4] text-foreground italic mb-12">
                「{project.concept}」
              </p>
              <div className="space-y-5 text-foreground/70 leading-loose">
                {project.description.map((d, i) => (
                  <p key={i}>{d}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-28 bg-surface p-8 lg:p-10 border border-white/5">
                <div className="text-[10px] tracking-[0.5em] text-accent mb-6">
                  PROJECT INFO
                </div>
                <dl className="space-y-5">
                  {Object.entries(project.info).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between gap-6 pb-5 border-b border-white/10 last:border-b-0 last:pb-0"
                    >
                      <dt className="text-xs tracking-[0.2em] text-foreground/50">
                        {k}
                      </dt>
                      <dd className="text-sm text-foreground/90 text-right">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="pb-24 lg:pb-32 px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="h-px w-10 bg-accent" />
                  <span className="text-accent text-xs tracking-[0.5em]">
                    GALLERY
                  </span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-light">
                  作品影像
                </h2>
              </div>
              <div className="text-[10px] tracking-[0.3em] text-foreground/50 hidden md:block">
                {project.gallery.length} IMAGES · 點擊放大
              </div>
            </div>
            <ProjectGallery
              images={project.gallery}
              title={project.title}
            />
          </div>
        </section>

        {/* Prev / Next navigation */}
        <section className="border-t border-white/10 px-6 lg:px-12">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2">
            <Link
              href={`/projects/${prev.id}`}
              className="group flex flex-col gap-3 py-10 pr-6 border-r border-white/10 hover:bg-surface transition-colors duration-300"
            >
              <span className="flex items-center gap-3 text-[10px] tracking-[0.4em] text-foreground/50 group-hover:text-accent transition-colors">
                <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                  <path
                    d="M0 4H19M4 1L1 4L4 7"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
                上一個作品
              </span>
              <span className="font-serif text-xl md:text-2xl text-foreground/80 group-hover:text-foreground">
                {prev.title}
              </span>
              <span className="text-[11px] tracking-[0.2em] text-foreground/40 italic">
                {prev.titleEn}
              </span>
            </Link>
            <Link
              href={`/projects/${next.id}`}
              className="group flex flex-col items-end gap-3 py-10 pl-6 text-right hover:bg-surface transition-colors duration-300"
            >
              <span className="flex items-center gap-3 text-[10px] tracking-[0.4em] text-foreground/50 group-hover:text-accent transition-colors">
                下一個作品
                <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                  <path
                    d="M20 4H1M16 1L19 4L16 7"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              </span>
              <span className="font-serif text-xl md:text-2xl text-foreground/80 group-hover:text-foreground">
                {next.title}
              </span>
              <span className="text-[11px] tracking-[0.2em] text-foreground/40 italic">
                {next.titleEn}
              </span>
            </Link>
          </div>
        </section>

        {/* Back to all */}
        <div className="py-14 flex justify-center border-t border-white/10">
          <Link
            href="/#portfolio"
            className="group flex items-center gap-3 text-sm tracking-[0.3em] text-foreground/70 hover:text-accent transition-colors"
          >
            <span className="h-px w-10 bg-current transition-all duration-500 group-hover:w-16" />
            返回作品總覽
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
