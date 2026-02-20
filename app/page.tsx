import { LandingHeader } from '@/components/landing/header'
import { LandingHero } from '@/components/landing/hero'
import { LandingFeatures } from '@/components/landing/features'
import { LandingPricing } from '@/components/landing/pricing'
import { LandingTestimonials } from '@/components/landing/testimonials'
import { LandingCTA } from '@/components/landing/cta'
import { LandingShowcase } from '@/components/landing/showcase'
import { LandingFooter } from '@/components/landing/footer'
import { LandingDownload } from '@/components/landing/download'
import { getSession } from '@/actions/auth-actions'
import { redirect } from 'next/navigation'

export default async function Landing() {
  // Check if user is already logged in
  const session = await getSession()

  if (session) {
    // User is logged in, redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingShowcase />
        <LandingDownload />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
