import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingDown, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — CancelKit',
  description: 'Simple, transparent pricing for CancelKit. Start free, upgrade when you grow.',
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'For indie hackers and early-stage products.',
    limit: '100 saves/mo',
    cta: 'Get Started',
    href: '/dashboard',
    highlight: false,
    features: [
      '100 saves per month',
      '1 active flow',
      'Stripe-native offers',
      'Analytics dashboard',
      'Community support',
    ],
  },
  {
    name: 'Indie',
    price: '$19',
    period: '/mo',
    desc: 'For growing SaaS products with real churn.',
    limit: '1,000 saves/mo',
    cta: 'Start Indie',
    href: '/dashboard',
    highlight: true,
    features: [
      '1,000 saves per month',
      'Unlimited flows',
      'Stripe-native offers',
      'Advanced analytics',
      'Email support',
      'Custom branding',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    desc: 'For high-volume products that need unlimited retention.',
    limit: 'Unlimited saves',
    cta: 'Go Pro',
    href: '/dashboard',
    highlight: false,
    features: [
      'Unlimited saves',
      'Unlimited flows',
      'Stripe-native offers',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Webhook integrations',
      'Team members',
    ],
  },
]

const featureRows = [
  { feature: 'Monthly saves', free: '100', indie: '1,000', pro: 'Unlimited' },
  { feature: 'Active flows', free: '1', indie: 'Unlimited', pro: 'Unlimited' },
  { feature: 'Stripe-native offers', free: true, indie: true, pro: true },
  { feature: 'Analytics dashboard', free: true, indie: true, pro: true },
  { feature: 'Custom branding', free: false, indie: true, pro: true },
  { feature: 'Email support', free: false, indie: true, pro: true },
  { feature: 'Priority support', free: false, indie: false, pro: true },
  { feature: 'Webhook integrations', free: false, indie: false, pro: true },
  { feature: 'Team members', free: false, indie: false, pro: true },
]

const faqs = [
  {
    q: 'Does this work with any billing system?',
    a: 'CancelKit is designed for Stripe-powered products. It integrates directly with Stripe to apply coupons, pause subscriptions, and downgrade plans. Support for other billing providers is on the roadmap.',
  },
  {
    q: 'How is save rate calculated?',
    a: "Save rate is the percentage of users who accepted a retention offer and did not cancel. It's calculated as: (users who accepted offer) / (total users who entered a flow) × 100.",
  },
  {
    q: 'How long does it take to set up?',
    a: 'Most teams are live in under 5 minutes. You add a script tag to your app, call CancelKit.init() with your customer ID and plan, and the cancellation modal handles the rest.',
  },
  {
    q: 'Can I customize the flows?',
    a: 'Yes! The Flow Builder lets you add survey steps, offer steps, and message steps in any order. You can customize question text, answer options, offer types, CTA copy, and more.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-[#0a1628]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-amber-500" />
            <span className="font-bold text-lg">CancelKit</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/docs" className="text-sm text-slate-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="text-sm text-white font-medium">
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
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg">Start free. Upgrade when you grow. No hidden fees.</p>
      </section>

      {/* Pricing tiers */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 flex flex-col ${
                tier.highlight
                  ? 'bg-amber-500/10 border-2 border-amber-500'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {tier.highlight && (
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wide mb-4">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">{tier.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-400">{tier.desc}</p>
                <p className="text-xs text-amber-400 mt-2 font-medium">{tier.limit}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                  tier.highlight
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'border border-white/20 hover:border-white/40 text-white'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature table */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Feature Comparison</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Feature</th>
                <th className="px-6 py-4 text-center text-slate-300 font-semibold">Free</th>
                <th className="px-6 py-4 text-center text-amber-400 font-semibold">Indie</th>
                <th className="px-6 py-4 text-center text-slate-300 font-semibold">Pro</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map(({ feature, free, indie, pro }, i) => (
                <tr key={feature} className={i < featureRows.length - 1 ? 'border-b border-white/5' : ''}>
                  <td className="px-6 py-3.5 text-slate-300">{feature}</td>
                  {[free, indie, pro].map((val, j) => (
                    <td key={j} className="px-6 py-3.5 text-center">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="h-4 w-4 text-green-400 mx-auto" />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )
                      ) : (
                        <span className={j === 1 ? 'text-amber-400' : 'text-slate-300'}>{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-2">{q}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-12">
          <h2 className="text-2xl font-bold mb-3">Start saving subscribers today</h2>
          <p className="text-slate-400 mb-6">Free forever. No credit card required.</p>
          <Link
            href="/dashboard"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3.5 rounded-xl transition-colors"
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
