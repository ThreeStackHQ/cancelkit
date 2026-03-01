'use client'
import Link from 'next/link'
import { Plus, GitBranch } from 'lucide-react'

const mockFlows = [
  { id: '1', name: 'Standard Offboarding', status: 'active', steps: 3, impressions: 1847, saveRate: 38.2 },
  { id: '2', name: 'Churn Prevention Trial', status: 'active', steps: 4, impressions: 923, saveRate: 29.4 },
  { id: '3', name: 'High-Value Retention', status: 'draft', steps: 2, impressions: 0, saveRate: 0 },
]

export default function FlowsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Flows</h1>
          <p className="text-slate-400 text-sm mt-1">Build cancellation flows to retain subscribers</p>
        </div>
        <Link href="/dashboard/flows/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="h-4 w-4" />New Flow
        </Link>
      </div>
      <div className="space-y-3">
        {mockFlows.map(flow => (
          <div key={flow.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{flow.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${flow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {flow.status}
                </span>
              </div>
              <div className="flex gap-4 text-sm text-slate-400 mt-1">
                <span>{flow.steps} steps</span>
                <span>{flow.impressions.toLocaleString()} impressions</span>
                {flow.saveRate > 0 && <span className="text-green-400">{flow.saveRate}% save rate</span>}
              </div>
            </div>
            <Link href={`/dashboard/flows/${flow.id}`} className="text-sm text-amber-400 hover:text-amber-300">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
