'use client'
import { useState } from 'react'

const data30 = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  impressions: Math.floor(50 + Math.random() * 80),
  saves: Math.floor(10 + Math.random() * 30),
  cancels: Math.floor(20 + Math.random() * 40),
}))

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const maxVal = Math.max(...data30.map((d) => d.impressions))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {(
          [
            ['Save Rate', '34.6%', 'text-green-400'],
            ['Impressions', '1,847', 'text-white'],
            ['Saves', '640', 'text-amber-400'],
            ['Cancels', '89', 'text-red-400'],
          ] as [string, string, string][]
        ).map(([label, value, color]) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* CSS bar chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Impressions vs Saves (30 days)</h3>
        <div className="flex items-end gap-1 h-40">
          {data30.map((d, i) => (
            <div key={i} className="flex-1 flex items-end gap-px">
              <div
                className="flex-1 bg-amber-500/40 rounded-t"
                style={{ height: `${(d.impressions / maxVal) * 100}%` }}
                title={`Impressions: ${d.impressions}`}
              />
              <div
                className="flex-1 bg-green-500/60 rounded-t"
                style={{ height: `${(d.saves / maxVal) * 100}%` }}
                title={`Saves: ${d.saves}`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-amber-500/40" />
            Impressions
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-green-500/60" />
            Saves
          </span>
        </div>
      </div>

      {/* Step funnel */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Step Dropout Funnel</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-white/10">
              <th className="pb-2">Step</th>
              <th className="pb-2">Entered</th>
              <th className="pb-2">Exited</th>
              <th className="pb-2">Dropout Rate</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['Survey (Why are you leaving?)', 1847, 312, '16.9%'],
                ['Offer (50% discount)', 1535, 890, '58.0%'],
                ['Confirmation', 645, 5, '0.8%'],
              ] as [string, number, number, string][]
            ).map(([name, entered, exited, rate]) => (
              <tr key={name} className="border-b border-white/5">
                <td className="py-3 text-slate-300">{name}</td>
                <td className="py-3">{entered.toLocaleString()}</td>
                <td className="py-3">{exited.toLocaleString()}</td>
                <td className="py-3 text-amber-400">{rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
