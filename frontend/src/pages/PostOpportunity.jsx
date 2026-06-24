import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useUser } from '../context/UserContext'

export default function PostOpportunity() {
  const { user, showToast } = useUser()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: 'gig', title: '', department: '', description: '',
    skills_needed: '', duration_days: '', bandwidth: 'Part-time', slots: 1,
  })

  const isHR = user?.role === 'hr_admin'
  const isManager = user?.role === 'manager' || isHR

  if (!isManager) return <div className="p-8 text-brand-muted">Access restricted to managers and HR admins.</div>

  function submit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      skills_needed: form.skills_needed.split(',').map(s => s.trim()).filter(Boolean),
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      slots: Number(form.slots),
    }
    api.post('/opportunities', payload).then(() => {
      showToast('Posted to the HR admin review queue. Once approved it goes live and matching runs automatically.')
      navigate('/opportunities')
    }).catch(() => showToast('Error posting opportunity.', 'error'))
  }

  const field = (label, key, type = 'text', props = {}) => (
    <div>
      <label className="block text-sm font-medium text-brand-ink mb-1">{label}</label>
      {type === 'textarea'
        ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" rows={4} {...props} />
        : <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" {...props} />
      }
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-ink mb-6">Post an Opportunity</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Opportunity Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {user?.role !== 'hr_admin' ? null : <option value="vacancy">Vacancy</option>}
            <option value="gig">Gig</option>
            <option value="immersion">Developmental Job Immersion</option>
            {user?.role === 'hr_admin' && <option value="vacancy">Vacancy</option>}
          </select>
        </div>

        {field('Title', 'title', 'text', { required: true, placeholder: 'e.g. ExCo Priority: Financial-Inclusion Dashboard' })}

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Department</label>
          <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            {['','Operations','Risk','Finance','Digital Products','Marketing','HR'].map(d =>
              <option key={d} value={d}>{d || '— Select —'}</option>
            )}
          </select>
        </div>

        {field('Description', 'description', 'textarea', { required: true, placeholder: 'Describe the opportunity, what the person will do, and the expected outcome.' })}
        {field('Key Skills Needed (comma-separated)', 'skills_needed', 'text', { placeholder: 'e.g. data visualization, python, stakeholder management' })}

        <div className="grid grid-cols-2 gap-4">
          {field('Duration (days)', 'duration_days', 'number', { placeholder: form.type === 'vacancy' ? 'Leave blank for permanent' : '30' })}
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1">Bandwidth</label>
            <select value={form.bandwidth} onChange={e => setForm(f => ({ ...f, bandwidth: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
              <option>Part-time</option>
              <option>Full-time</option>
              <option>Flexible</option>
            </select>
          </div>
        </div>
        {field('Available Slots', 'slots', 'number', { min: 1 })}

        <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#C00000' }}>
          Submit for Review →
        </button>
      </form>
    </div>
  )
}
