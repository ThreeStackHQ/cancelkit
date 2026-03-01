'use client'
import { useState } from 'react'
import { Calculator } from 'lucide-react'

export function ROICalculator() {
  const [mrr, setMrr] = useState('')
  const [churnRate, setChurnRate] = useState('')
  const [result, setResult] = useState<number | null>(null)

  const calculate = () => {
    const mrrNum = parseFloat(mrr)
    const churnNum = parseFloat(churnRate)
    if (!isNaN(mrrNum) && !isNaN(churnNum) && mrrNum > 0 && churnNum > 0) {
      setResult(mrrNum * (churnNum / 100) * 0.35)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">ROI Calculator</h2>
          <p className="text-sm text-slate-400">See how much revenue you could save</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Monthly Recurring Revenue</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              placeholder="10,000"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Monthly Churn Rate (%)</label>
          <div className="relative">
            <input
              type="number"
              value={churnRate}
              onChange={(e) => setChurnRate(e.target.value)}
              placeholder="5"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 pr-8 py-3 text-sm focus:outline-none focus:border-amber-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
          </div>
        </div>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors mb-4"
      >
        Calculate Savings
      </button>

      {result !== null && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">Estimated Monthly Savings</p>
          <p className="text-3xl font-bold text-green-400">
            ${Math.round(result).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Based on a 35% save rate with CancelKit</p>
        </div>
      )}
    </div>
  )
}
