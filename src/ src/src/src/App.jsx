import React, { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'ltos@v1'

const PILLARS = [
  { id: 'health', name: 'Health Mastery', icon: '💪' },
  { id: 'mindset', name: 'Mindset Mastery', icon: '🧠' },
  { id: 'skills', name: 'Skill Growth', icon: '🚀' },
  { id: 'finance', name: 'Financial Power', icon: '💼' },
  { id: 'relationships', name: 'Relationships', icon: '🤝' },
  { id: 'inner', name: 'Inner Strength', icon: '🧘' },
]

const MORNING = [
  { id: 'gratitude', label: '3× Gratitude' },
  { id: 'visualization', label: '10m Visualization' },
  { id: 'movement', label: '10m Movement' },
  { id: 'learning', label: '5m Learning' },
  { id: 'targets', label: 'Set 3 Targets' },
]

const EVENING = [
  { id: 'selfcheck', label: 'Self-Check (Mind/Body/Emotions/Direction)' },
  { id: 'wins', label: 'Log 3 Wins' },
  { id: 'plan', label: 'Plan Tomorrow’s 3 Targets' },
]

function startOfDay(ts = Date.now()) {
  const d = new Date(ts); d.setHours(0,0,0,0); return d.getTime()
}
function dateKey(ts = Date.now()) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function daysBetween(a, b) {
  return Math.floor((startOfDay(b) - startOfDay(a)) / 86400000)
}

function useLocalState(initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch(_) {}
    return initial
  })
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])
  return [state, setState]
}

function Progress({ value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-xl overflow-hidden">
      <div className="h-full bg-black/80 dark:bg-white/80" style={{ width: `${pct}%` }} />
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export default function App() {
  const [s, setS] = useLocalState({
    themeDark: true,
    mantra: 'I act as my future self, today.',
    cycleStart: startOfDay(),
    goals: [
      { id: 'g1', text: 'Health: 10k steps daily', done: false },
      { id: 'g2', text: 'Skill: 1h focused learning/day', done: false },
      { id: 'g3', text: 'Finance: 20% savings rate', done: false },
    ],
    rituals: {},        // { [date]: { morning:{id:bool}, evening:{id:bool} } }
    actions: {},        // { [pillarId]: [{ ts, note }] }
    heat: {},           // { [date]: 0|1|2 }
    resilience: { fears: '', counterMoves: '', emergency: '' },
  })

  useEffect(() => {
    const root = document.documentElement
    if (s.themeDark) root.classList.add('dark'); else root.classList.remove('dark')
  }, [s.themeDark])

  const todayK = dateKey()
  const today = s.rituals[todayK] || { morning: {}, evening: {} }

  const completion = useMemo(() => {
    const total = MORNING.length + EVENING.length
    const done = MORNING.filter(i => today.morning[i.id]).length + EVENING.filter(i => today.evening[i.id]).length
    const pct = done / total
    return pct >= 0.99 ? 2 : pct > 0 ? 1 : 0
  }, [today])

  useEffect(() => {
    setS(x => ({ ...x, heat: { ...x.heat, [todayK]: completion } }))
  }, [completion])

  function toggle(period, id) {
    setS(x => {
      const r = x.rituals[todayK] || { morning: {}, evening: {} }
      const updated = { ...r, [period]: { ...r[period], [id]: !r[period][id] } }
      return { ...x, rituals: { ...x.rituals, [todayK]: updated } }
    })
  }

  function logAction(pillarId, note) {
    if (!note || !note.trim()) return
    setS(x => {
      const list = x.actions[pillarId] || []
      return { ...x, actions: { ...x.actions, [pillarId]: [...list, { ts: Date.now(), note }] } }
    })
  }

  function streakCount() {
    let n = 0
    for (let i = 0; i < 365; i++) {
      const k = dateKey(startOfDay(Date.now() - i*86400000))
      if ((s.heat[k] ?? 0) === 2) n++; else break
    }
    return n
  }

  const cycleDays = 90
  const elapsed = Math.min(cycleDays, Math.max(0, daysBetween(s.cycleStart, Date.now()) + 1))
  const pct = Math.round((elapsed / cycleDays) * 100)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LTOS – Life Transformation Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Your personal OS for unstoppable growth.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setS(x => ({ ...x, themeDark: !x.themeDark }))} className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700">
            {s.themeDark ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </div>

      {/* Identity & Cycle */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card className="p-4 col-span-2">
          <div className="mb-2 font-semibold">Future Self Mantra</div>
          <input value={s.mantra} onChange={(e) => setS(x => ({ ...x, mantra: e.target.value }))}
                 className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none" />
          <div className="mt-2 text-sm text-neutral-500">Tip: short, active, identity-based.</div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold mb-2">90-Day Cycle</div>
          <div className="text-sm mb-2">Day <b>{elapsed}</b> of <b>{cycleDays}</b> ({pct}%)</div>
          <Progress value={pct} />
          <div className="mt-3 text-sm">
            Started on:
            <input type="date"
                   value={new Date(s.cycleStart).toISOString().slice(0,10)}
                   onChange={(e) => setS(x => ({ ...x, cycleStart: startOfDay(new Date(e.target.value).getTime()) }))}
                   className="ml-2 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
          </div>
          <div className="mt-2 text-sm">🔥 Streak: <b>{streakCount()}</b> day(s)</div>
        </Card>
      </div>

      {/* Rituals */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card className="p-4">
          <div className="font-semibold mb-2">Morning Ritual</div>
          <div className="flex flex-col gap-2">
            {MORNING.map(i => (
              <label key={i.id} className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4" checked={!!today.morning[i.id]} onChange={() => toggle('morning', i.id)} />
                <span>{i.label}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="font-semibold mb-2">Evening Ritual</div>
          <div className="flex flex-col gap-2">
            {EVENING.map(i => (
              <label key={i.id} className="flex items-center gap-3">
                <input type="checkbox" className="h-4 w-4" checked={!!today.evening[i.id]} onChange={() => toggle('evening', i.id)} />
                <span>{i.label}</span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      {/* Pillars */}
      <div className="mt-6">
        <div className="font-semibold mb-2">Future-Proof Pillars</div>
        <div className="grid md:grid-cols-3 gap-4">
          {PILLARS.map(p => <Pillar key={p.id} p={p} actions={s.actions[p.id] || []} onLog={(note) => logAction(p.id, note)} />)}
        </div>
      </div>

      {/* Goals */}
      <div className="mt-6">
        <div className="font-semibold mb-2">90-Day Goals (Big 3)</div>
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            {s.goals.map(g => (
              <div key={g.id} className="flex items-center gap-3">
                <input type="checkbox" checked={g.done} onChange={() => setS(x => ({ ...x, goals: x.goals.map(a => a.id===g.id ? { ...a, done: !a.done } : a) }))} />
                <input value={g.text} onChange={(e) => setS(x => ({ ...x, goals: x.goals.map(a => a.id===g.id ? { ...a, text: e.target.value } : a) }))}
                       className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Resilience */}
      <div className="mt-6">
        <div className="font-semibold mb-2">Anticipation Protocol (Resilience)</div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="font-medium mb-2">Top Fears</div>
            <textarea rows={6} value={s.resilience.fears} onChange={(e)=>setS(x=>({...x, resilience:{...x.resilience, fears:e.target.value}}))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
          </Card>
          <Card className="p-4">
            <div className="font-medium mb-2">Counter-Moves</div>
            <textarea rows={6} value={s.resilience.counterMoves} onChange={(e)=>setS(x=>({...x, resilience:{...x.resilience, counterMoves:e.target.value}}))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
          </Card>
          <Card className="p-4">
            <div className="font-medium mb-2">Emergency Plans</div>
            <textarea rows={6} value={s.resilience.emergency} onChange={(e)=>setS(x=>({...x, resilience:{...x.resilience, emergency:e.target.value}}))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
          </Card>
        </div>
      </div>

      <div className="h-12" />
    </div>
  )
}

function Pillar({ p, actions, onLog }) {
  const [note, setNote] = useState('')
  const todayCount = useMemo(() => actions.filter(a => startOfDay(a.ts) === startOfDay()).length, [actions])
  const weekPct = useMemo(() => {
    const now = Date.now()
    const last7 = actions.filter(a => daysBetween(a.ts, now) <= 6).length
    return Math.min(100, Math.round((last7 / 7) * 100))
  }, [actions])
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{p.icon} {p.name}</div>
        <div className="text-sm text-neutral-500">Today: <b>{todayCount}</b></div>
      </div>
      <div className="mt-3">
        <div className="text-xs text-neutral-500 mb-1">7-day momentum: {weekPct}%</div>
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded">
          <div className="h-2 bg-black/80 dark:bg-white/80 rounded" style={{ width: `${weekPct}%` }} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          placeholder="Log a meaningful action…"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { onLog(note); setNote('') } }}
          className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        />
        <button onClick={() => { onLog(note); setNote('') }}
                className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700">
          Log
        </button>
      </div>
      {actions.length > 0 && (
        <div className="mt-3 max-h-36 overflow-auto pr-1 space-y-2 text-sm">
          {actions.slice().reverse().map((a, i) => (
            <div key={i} className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <div className="text-neutral-700 dark:text-neutral-300">{a.note}</div>
              <div className="text-[11px] text-neutral-500">{new Date(a.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
    }
