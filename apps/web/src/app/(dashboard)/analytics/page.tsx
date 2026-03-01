'use client'
import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react'

interface FlowStats {
  flowId: string
  flowName: string
  impressions: number
  saves: number
  cancels: number
  saveRate: number
}

interface AggregatedStats {
  totalImpressions: number
  totalSaves: number
  totalCancels: number
  saveRate: number
  flowStats: FlowStats[]
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AggregatedStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all flows first
        const flowsRes = await fetch('/api/flows')
        if (!flowsRes.ok) throw new Error('Failed to load flows')
        const { flows } = await flowsRes.json()

        if (!flows || flows.length === 0) {
          setStats({
            totalImpressions: 0,
            totalSaves: 0,
            totalCancels: 0,
            saveRate: 0,
            flowStats: [],
          })
          return
        }

        // Fetch stats for each flow
        const statsResults = await Promise.all(
          flows.map(async (flow: { id: string; name: string }) => {
            const res = await fetch(`/api/flows/${flow.id}/stats`)
            if (!res.ok) return null
            const data = await res.json()
            return {
              flowId: flow.id,
              flowName: flow.name,
              impressions: data.impressions ?? 0,
              saves: data.saves ?? 0,
              cancels: data.cancels ?? 0,
              saveRate: data.saveRate ?? 0,
            } satisfies FlowStats
          })
        )

        const validStats = statsResults.filter((s): s is FlowStats => s !== null)

        const totalImpressions = validStats.reduce((sum, s) => sum + s.impressions, 0)
        const totalSaves = validStats.reduce((sum, s) => sum + s.saves, 0)
        const totalCancels = validStats.reduce((sum, s) => sum + s.cancels, 0)
        const saveRate =
          totalSaves + totalCancels > 0
            ? Math.round((totalSaves / (totalSaves + totalCancels)) * 100)
            : 0

        setStats({ totalImpressions, totalSaves, totalCancels, saveRate, flowStats: validStats })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading analytics…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  if (!stats || stats.totalImpressions === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="text-center py-16 text-slate-400">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No data yet</p>
          <p className="text-sm mt-1">Analytics will appear once your flows start receiving traffic.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(
          [
            ['Save Rate', `${stats.saveRate}%`, 'text-green-400'],
            ['Impressions', stats.totalImpressions.toLocaleString(), 'text-white'],
            ['Saves', stats.totalSaves.toLocaleString(), 'text-amber-400'],
            ['Cancels', stats.totalCancels.toLocaleString(), 'text-red-400'],
          ] as [string, string, string][]
        ).map(([label, value, color]) => (
          <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-slate-400">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Per-flow breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Per-Flow Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-white/10">
              <th className="pb-2">Flow</th>
              <th className="pb-2 text-right">Impressions</th>
              <th className="pb-2 text-right">Saves</th>
              <th className="pb-2 text-right">Cancels</th>
              <th className="pb-2 text-right">Save Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.flowStats.map((fs) => (
              <tr key={fs.flowId} className="border-b border-white/5">
                <td className="py-3 text-slate-300">{fs.flowName}</td>
                <td className="py-3 text-right">{fs.impressions.toLocaleString()}</td>
                <td className="py-3 text-right text-amber-400">{fs.saves.toLocaleString()}</td>
                <td className="py-3 text-right text-red-400">{fs.cancels.toLocaleString()}</td>
                <td className="py-3 text-right text-green-400">{fs.saveRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
