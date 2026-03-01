import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingDown, Zap, BarChart3, CreditCard, Code2, Check, X } from 'lucide-react'
import { ROICalculator } from './_components/roi-calculator'

export const metadata: Metadata = {
  title: 'CancelKit — Stop Losing Subscribers to Cancellations',
  description:
    'CancelKit turns cancellation flows into retention wins. Smart flows, Stripe-native offers, and real analytics to reduce churn. Free to start.',
  keywords: ['cancellation flow', 'churn reduction', 'saas retention', 'stripe offboarding'],
  openGraph: {
    title: 'CancelKit — Stop Losing Subscribers to Cancellations',
    description: 'Smart cancellation flows that save subscribers and reduce churn. Stripe-native, 2-line install.',
    url: 'https://cancelkit.threestack.io',
    siteName: 'CancelKit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CancelKit — Stop Losing Subscribers to Cancellations',
    description: 'Smart cancellation flows that save subscribers and reduce churn.',
  },
}

const features = [
  {
    icon: CreditCard,
    title: 'Stripe-Native Offers',
    desc: 'Apply coupons, pause subscriptions, or downgrade plans directly via Stripe — no custom webhook code.',
  },
  {
    icon: Code2,
    title: '2-Line Install',
    desc: "Drop one script tag and call CancelKit.init(). You're live in under 5 minutes.",
  },
  {
    icon: TrendingDown,
    title: 'Beautiful Cancel Flow',
    desc: 'A polished, branded cancellation modal that guides users through your retention flow before they leave.',
  },
  {
    icon: BarChart3,
    title: 'Real Analytics',
    desc: 'Track impressions, saves, dropout funnels, and save rates across all your flows.',
  },
]

const comparison = [
  { feature: 'Cancellation flows', cancelKit: true, churnkey: true },
  { feature: 'Stripe-native offers', cancelKit: true, churnkey: true },
  { feature: 'Free tier', cancelKit: true, churnkey: false },
  { feature: 'Starting price', cancelKit: '$0/mo', churnkey: '$49/mo' },
  { feature: 'Custom branding', cancelKit: true, churnkey: true },
  { feature: 'Analytics dashboard', cancelKit: true, churnkey: true },
  { feature: 'Pause subscription', cancelKit: true, churnkey: true },
  { feature: 'A/B testing', cancelKit: false, churnkey: true },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-amber-500" />
            <span className="font-bold text-lg">CancelKit</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/docs" className="text-sm text-slate-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm text-amber-400 mb-8">
          <Zap className="h-3.5 w-3.5" />
          Reduce churn by up to 35%
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Stop losing subscribers
          <br />
          <span className="text-amber-400">to cancellations.</span>
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Turn cancellations into saves with smart, Stripe-native flows. Build beautiful offboarding
          experiences, make targeted offers, and keep more subscribers — in minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            Start Free
          </Link>
          <Link
            href="/dashboard/flows/1"
            className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <ROICalculator />
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to stop churn</h2>
          <p className="text-slate-400">Built for SaaS teams who want to retain customers without the complexity.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why CancelKit?</h2>
          <p className="text-slate-400">Full-featured retention flows — without the enterprise price tag.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Feature</th>
                <th className="px-6 py-4 text-center">
                  <span className="text-amber-400 font-bold">CancelKit</span>
                  <span className="block text-xs text-slate-400 font-normal">Free</span>
                </th>
                <th className="px-6 py-4 text-center">
                  <span className="text-slate-300 font-bold">Churnkey</span>
                  <span className="block text-xs text-slate-400 font-normal">$49/mo</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(({ feature, cancelKit, churnkey }, i) => (
                <tr key={feature} className={i < comparison.length - 1 ? 'border-b border-white/5' : ''}>
                  <td className="px-6 py-3.5 text-slate-300">{feature}</td>
                  <td className="px-6 py-3.5 text-center">
                    {typeof cancelKit === 'boolean' ? (
                      cancelKit ? (
                        <Check className="h-4 w-4 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-amber-400 font-semibold">{cancelKit}</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {typeof churnkey === 'boolean' ? (
                      churnkey ? (
                        <Check className="h-4 w-4 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-slate-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-slate-300">{churnkey}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to stop the churn?</h2>
          <p className="text-slate-400 mb-8">
            Join hundreds of SaaS teams using CancelKit to retain more subscribers. Free to start — no credit card required.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold px-10 py-4 rounded-xl text-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-amber-500" />
            <span>CancelKit by ThreeStack</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
