'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewFlowPage() {
  const [name, setName] = useState('')
  const router = useRouter()
  const create = () => {
    if (name.trim()) router.push('/dashboard/flows/1')
  }
  return (
    <div className="max-w-lg mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Create New Flow</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Flow name..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-amber-500 mb-4"
      />
      <button
        onClick={create}
        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors"
      >
        Create Flow
      </button>
    </div>
  )
}
