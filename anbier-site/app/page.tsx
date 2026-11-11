import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Services from "./components/Services";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { getContent } from "./lib/content/store";

export default async function Home() {
  const content = await getContent();
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero hero={content.hero} />
        <Portfolio portfolio={content.portfolio} projects={content.projects} />
        <Services services={content.services} />
        <About about={content.about} />
        <Contact contact={content.contact} />
      </main>
      <Footer />
    </>
  );
}
