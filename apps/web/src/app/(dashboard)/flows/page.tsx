'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, GitBranch, Loader2, AlertCircle } from 'lucide-react'

interface Flow {
  id: string
  name: string
  triggerType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFlows() {
      try {
        const res = await fetch('/api/flows')
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? `Request failed (${res.status})`)
        }
        const data = await res.json()
        setFlows(data.flows ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flows')
      } finally {
        setLoading(false)
      }
    }
    fetchFlows()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flows</h1>
          <p className="text-slate-400 text-sm mt-1">Build cancellation flows to retain subscribers</p>
        </div>
        <Link
          href="/flows/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />New Flow
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading flows…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && flows.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No flows yet</p>
          <p className="text-sm mt-1">Create your first cancellation flow to start retaining subscribers.</p>
          <Link
            href="/flows/new"
            className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />New Flow
          </Link>
        </div>
      )}

      {!loading && !error && flows.length > 0 && (
        <div className="space-y-3">
          {flows.map((flow) => (
            <div
              key={flow.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{flow.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      flow.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {flow.isActive ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                  <span className="capitalize">{flow.triggerType.replace('-', ' ')}</span>
                  <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Link
                href={`/flows/${flow.id}`}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
