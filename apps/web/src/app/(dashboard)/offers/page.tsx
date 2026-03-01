'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function OffersPage() {
  const [offerType, setOfferType] = useState('discount')
  const [coupon, setCoupon] = useState('50OFF3M')
  const [pauseDuration, setPauseDuration] = useState('1')
  const [targetPlan, setTargetPlan] = useState('starter')
  const [testMode, setTestMode] = useState(false)
  const [copied, setCopied] = useState(false)

  const snippet = `CancelKit.init({
  customerId: '{{ customer.id }}',
  planId: '{{ subscription.plan }}',
  testMode: ${testMode},
})`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Offer Configuration</h1>
      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Offer Type</h3>
          <div className="flex gap-3 mb-4">
            {['discount', 'pause', 'downgrade'].map((t) => (
              <button
                key={t}
                onClick={() => setOfferType(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  offerType === t
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {offerType === 'discount' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Stripe Coupon</label>
              <select
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="50OFF3M">50% OFF first 3 months</option>
                <option value="1MFREE">1 Month Free</option>
                <option value="100OFF">100% OFF (cancel free month)</option>
                <option value="20OFF">20% OFF forever</option>
              </select>
            </div>
          )}
          {offerType === 'pause' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Pause Duration</label>
              <select
                value={pauseDuration}
                onChange={(e) => setPauseDuration(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="1">1 month</option>
                <option value="2">2 months</option>
                <option value="3">3 months</option>
              </select>
            </div>
          )}
          {offerType === 'downgrade' && (
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Target Plan</label>
              <select
                value={targetPlan}
                onChange={(e) => setTargetPlan(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="starter">Starter ($5/mo)</option>
                <option value="basic">Basic ($9/mo)</option>
                <option value="free">Free (downgrade)</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Integration Snippet</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Test Mode</span>
              <button
                onClick={() => setTestMode(!testMode)}
                className={`w-10 h-5 rounded-full transition-colors relative ${testMode ? 'bg-amber-500' : 'bg-white/10'}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    testMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-[#0f172a] rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
              {snippet}
            </pre>
            <button onClick={copy} className="absolute top-2 right-2 p-2 rounded hover:bg-white/10">
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
