import { useEffect, useState } from 'react'
import api from '../api'
import { useUser } from '../context/UserContext'

const MAX_SKILLS = 8

function TagInput({ label, value, onChange, placeholder }) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (v && !value.includes(v) && value.length < MAX_SKILLS) {
      onChange([...value, v]); setInput('')
    }
  }
  return (
    <div>
      <label className="block text-sm font-medium text-brand-ink mb-1">
        {label} <span className="text-brand-muted font-normal text-xs">({value.length}/{MAX_SKILLS})</span>
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map(s => (
          <span key={s} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
            {s}
            <button type="button" onClick={() => onChange(value.filter(x => x !== s))}
              className="text-indigo-400 hover:text-indigo-700 font-bold leading-none">×</button>
          </span>
        ))}
      </div>
      {value.length < MAX_SKILLS ? (
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder={placeholder}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          <button type="button" onClick={add}
            className="px-3 py-2 text-sm rounded-lg text-white" style={{ backgroundColor: '#C00000' }}>Add</button>
        </div>
      ) : (
        <p className="text-xs text-brand-muted">Maximum {MAX_SKILLS} skills reached.</p>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, showToast } = useUser()
  const [form, setForm] = useState({
    aspiration_text: '', current_skills: [], skills_to_develop: [], is_open_to_opportunities: true,
  })

  useEffect(() => {
    if (!user) return
    api.get(`/profiles/${user.id}`).then(r => setForm({ ...r.data })).catch(() => {})
  }, [user])

  function save(e) {
    e.preventDefault()
    api.put(`/profiles/${user.id}`, form).then(() => showToast('Profile updated.'))
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-1">My Profile</h1>
      <p className="text-sm text-brand-muted mb-6">This is what the AI uses to match you to opportunities.</p>

      <form onSubmit={save} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#C00000' }}>
            {user.name[0]}
          </div>
          <div>
            <p className="font-semibold text-brand-ink">{user.name}</p>
            <p className="text-sm text-brand-muted">{user.department}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">I want to grow in… <span className="text-brand-muted font-normal">(aspiration)</span></label>
          <textarea value={form.aspiration_text} onChange={e => setForm(f => ({ ...f, aspiration_text: e.target.value }))}
            rows={3} placeholder="Describe where you want to take your career…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
        </div>

        <TagInput label="My top skills" value={form.current_skills}
          onChange={v => setForm(f => ({ ...f, current_skills: v }))}
          placeholder="e.g. data analysis (press Enter or Add)" />

        <TagInput label="Skills I want to develop" value={form.skills_to_develop}
          onChange={v => setForm(f => ({ ...f, skills_to_develop: v }))}
          placeholder="e.g. facilitation" />

        <div className="flex items-center justify-between p-4 bg-brand-grey rounded-xl">
          <div>
            <p className="text-sm font-medium text-brand-ink">Open to opportunities</p>
            <p className="text-xs text-brand-muted">Managers and HR can see your profile when this is on</p>
          </div>
          <button type="button" onClick={() => setForm(f => ({ ...f, is_open_to_opportunities: !f.is_open_to_opportunities }))}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ backgroundColor: form.is_open_to_opportunities ? '#1B7A43' : '#D1D5DB' }}>
            <span className="absolute top-0.5 transition-all w-5 h-5 rounded-full bg-white shadow"
              style={{ left: form.is_open_to_opportunities ? '26px' : '2px' }} />
          </button>
        </div>

        <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#C00000' }}>
          Save Profile
        </button>
      </form>
    </div>
  )
}
