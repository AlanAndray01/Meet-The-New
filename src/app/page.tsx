import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";

export default function Home() {
  return (
    <main className="w-full max-w-360 mx-auto">
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
    </main>
  );
}
