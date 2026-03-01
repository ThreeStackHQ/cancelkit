'use client'
import { useState } from 'react'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'

type StepType = 'survey' | 'offer' | 'message'
interface Step {
  id: string
  type: StepType
  question?: string
  options?: string[]
  offerType?: string
  offerText?: string
  ctaText?: string
  messageText?: string
}

const defaultStep = (type: StepType): Step => ({
  id: Math.random().toString(36).slice(2),
  type,
  question: 'Why are you cancelling?',
  options: ['Too expensive', 'Not using it', 'Missing features', 'Other'],
  offerType: 'discount',
  offerText: '50% off your next 3 months',
  ctaText: 'Claim Offer',
  messageText: "We're sorry to see you go. Your subscription will remain active until the end of the billing period.",
})

export default function FlowBuilderPage() {
  const [steps, setSteps] = useState<Step[]>([defaultStep('survey'), defaultStep('offer')])
  const [active, setActive] = useState(0)

  const moveUp = (i: number) => {
    if (i === 0) return
    const s = [...steps]
    const tmp = s[i - 1] as Step
    s[i - 1] = s[i] as Step
    s[i] = tmp
    setSteps(s)
  }
  const moveDown = (i: number) => {
    if (i === steps.length - 1) return
    const s = [...steps]
    const tmp = s[i + 1] as Step
    s[i + 1] = s[i] as Step
    s[i] = tmp
    setSteps(s)
  }
  const remove = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<Step>) =>
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const step = steps[active]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Flow Builder</h1>
        <button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
      <div className="flex gap-6">
        {/* Step list */}
        <div className="w-64 space-y-2">
          {steps.map((s, i) => (
            <div
              key={s.id}
              onClick={() => setActive(i)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 ${
                active === i
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">{s.type}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); moveUp(i) }}
                  className="p-1 hover:text-white text-slate-500"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveDown(i) }}
                  className="p-1 hover:text-white text-slate-500"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(i) }}
                  className="p-1 hover:text-red-400 text-slate-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            {(['survey', 'offer', 'message'] as StepType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSteps([...steps, defaultStep(t)])}
                className="flex-1 text-xs py-1.5 rounded border border-white/10 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 transition-colors capitalize"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        {step && (
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold capitalize">{step.type} Step</h3>

            {step.type === 'survey' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Question</label>
                  <input
                    value={step.question}
                    onChange={(e) => update(active, { question: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Answer Options</label>
                  {(step.options || []).map((opt, oi) => (
                    <div key={oi} className="flex gap-2 mb-2">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const opts = [...(step.options || [])]
                          opts[oi] = e.target.value
                          update(active, { options: opts })
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() =>
                          update(active, { options: (step.options || []).filter((_, i) => i !== oi) })
                        }
                        className="text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => update(active, { options: [...(step.options || []), 'New option'] })}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    + Add option
                  </button>
                </div>
              </>
            )}

            {step.type === 'offer' && (
              <>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Offer Type</label>
                  <select
                    value={step.offerType}
                    onChange={(e) => update(active, { offerType: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="discount">Discount</option>
                    <option value="pause">Pause subscription</option>
                    <option value="downgrade">Downgrade plan</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Offer Text</label>
                  <input
                    value={step.offerText}
                    onChange={(e) => update(active, { offerText: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">CTA Button Text</label>
                  <input
                    value={step.ctaText}
                    onChange={(e) => update(active, { ctaText: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            )}

            {step.type === 'message' && (
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Message</label>
                <textarea
                  value={step.messageText}
                  onChange={(e) => update(active, { messageText: e.target.value })}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            )}

            {/* Preview */}
            <div className="mt-6 p-4 bg-[#0f172a] rounded-xl border border-white/10">
              <p className="text-xs text-slate-500 mb-3">Preview</p>
              <div className="bg-[#1e293b] rounded-lg p-4">
                {step.type === 'survey' && (
                  <>
                    <p className="font-medium mb-3">{step.question}</p>
                    {(step.options || []).map((o, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2 text-sm">
                        <input type="radio" readOnly />
                        <label>{o}</label>
                      </div>
                    ))}
                  </>
                )}
                {step.type === 'offer' && (
                  <div className="text-center py-4">
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full mb-3 inline-block">
                      Special Offer
                    </span>
                    <p className="font-semibold text-lg mt-2">{step.offerText}</p>
                    <button className="mt-4 bg-amber-500 text-black font-semibold px-6 py-2 rounded-lg text-sm">
                      {step.ctaText}
                    </button>
                  </div>
                )}
                {step.type === 'message' && (
                  <p className="text-sm text-slate-300">{step.messageText}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
