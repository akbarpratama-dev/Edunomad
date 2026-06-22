import { AuthedRedirect } from "@/components/landing/authed-redirect";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/sections/hero";
import { Problem } from "@/components/landing/sections/problem";
import { HowItWorks } from "@/components/landing/sections/how-it-works";
import { FeatureGrid } from "@/components/landing/sections/feature-grid";
import { ProjectShowcase } from "@/components/landing/sections/project-showcase";
import { Portfolio } from "@/components/landing/sections/portfolio";
import { Impact } from "@/components/landing/sections/impact";
import { Testimonials } from "@/components/landing/sections/testimonials";
import { Faq } from "@/components/landing/sections/faq";
import { Cta } from "@/components/landing/sections/cta";

export default function Home() {
  return (
    <div data-landing className="min-h-screen bg-ln-bg font-sans text-ln-ink antialiased">
      <AuthedRedirect />
      <a
        href="#main"
        className="sr-only rounded-lg bg-ln-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Lewati ke konten utama
      </a>
      <LandingHeader />
      <main id="main">
        <Hero />
        <Problem />
        <HowItWorks />
        <FeatureGrid />
        <ProjectShowcase />
        <Portfolio />
        <Impact />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}
