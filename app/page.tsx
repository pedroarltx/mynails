import { HeroSection } from "@/components/home/hero-section"
import { ServicesSection } from "@/components/home/services-section"
import { FeaturesSection } from "@/components/home/features-section"
import { ContactSection } from "@/components/home/contact-section"
import { SiteLayout } from "@/components/layout/site-layout"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export default function Home() {
  return (
    <SiteLayout>
      <SiteHeader />
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <ContactSection />
      <SiteFooter />
    </SiteLayout>
  )
}

