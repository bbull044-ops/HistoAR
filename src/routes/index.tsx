import { createFileRoute } from "@tanstack/react-router";
import { useLenis } from "@/hooks/use-lenis";
import { FieldTexture } from "@/components/field-texture";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/sections/hero";
import { Experience } from "@/components/sections/experience";
import { Timeline } from "@/components/sections/timeline";
import { Learn } from "@/components/sections/learn";
import { ARShowcase } from "@/components/sections/ar-showcase";
import { Quiz } from "@/components/sections/quiz";
import { AIGuide } from "@/components/sections/ai-guide";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useLenis();
  return (
    <main className="relative min-h-screen overflow-hidden">
      <FieldTexture />
      <Nav />
      <Hero />
      <Experience />
      <Timeline />
      <Learn />
      <ARShowcase />
      <Quiz />
      <AIGuide />
      <Footer />
    </main>
  );
}
