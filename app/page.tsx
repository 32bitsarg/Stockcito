import Link from 'next/link'

import { LandingHeader } from '@/components/landing/header'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingTestimonials } from '@/components/landing/testimonials'
import { LandingCTA } from '@/components/landing/cta'
import { LandingFooter } from '@/components/landing/footer'

export default function Landing() {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <LandingHeader />
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingCTA />
        <LandingFooter />
      </div>
    </div>
  )
}
