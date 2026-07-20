import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useUser } from '../context/UserContext'

export default function PostOpportunity() {
  const { user, showToast } = useUser()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: 'gig', title: '', department: '', description: '',
    skills_needed: '', duration_from: '', duration_to: '', bandwidth: 'Part-time', slots: 1,
  })
  const [attachedFile, setAttachedFile] = useState(null)

  const isHR = user?.role === 'hr_admin'
  const isManager = user?.role === 'manager' || isHR
  if (!isManager) return <div className="p-8 text-brand-muted">Access restricted to managers and HR admins.</div>

  function submit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      skills_needed: form.skills_needed.split(',').map(s => s.trim()).filter(Boolean),
      slots: Number(form.slots),
      duration_from: form.duration_from || null,
      duration_to: form.duration_to || null,
    }
    api.post('/opportunities', payload).then(() => {
      showToast('Submitted for HR admin review. Once approved it goes live and matching runs automatically.')
      navigate('/matches')
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
      <h1 className="text-2xl font-bold text-brand-ink mb-1">Post an Opportunity</h1>
      <p className="text-sm text-brand-muted mb-6">All postings go to HR admin for review before becoming visible to employees.</p>
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-5">

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">Opportunity Type</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="gig">Gig</option>
            <option value="immersion">Developmental Job Immersion</option>
            {isHR && <option value="vacancy">Vacancy</option>}
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
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1">Start Date</label>
            <input type="date" value={form.duration_from} onChange={e => setForm(f => ({ ...f, duration_from: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1">End Date <span className="text-brand-muted font-normal">(leave blank if permanent)</span></label>
            <input type="date" value={form.duration_to} onChange={e => setForm(f => ({ ...f, duration_to: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-ink mb-1">Bandwidth</label>
            <select value={form.bandwidth} onChange={e => setForm(f => ({ ...f, bandwidth: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none">
              <option>Part-time</option><option>Full-time</option><option>Flexible</option>
            </select>
          </div>
          {field('Available Slots', 'slots', 'number', { min: 1 })}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-ink mb-1">
            Attachment <span className="text-brand-muted font-normal">(optional — JD, brief, or any file)</span>
          </label>
          <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-red-300 transition-colors">
            <span className="text-2xl">📎</span>
            <div className="flex-1 min-w-0">
              {attachedFile
                ? <><p className="text-sm font-medium text-brand-ink truncate">{attachedFile.name}</p>
                    <p className="text-xs text-brand-muted">{(attachedFile.size / 1024).toFixed(0)} KB</p></>
                : <><p className="text-sm text-brand-muted">Click to upload a file</p>
                    <p className="text-xs text-brand-muted">PDF, Word, Excel, PNG, or any format</p></>
              }
            </div>
            {attachedFile && (
              <button type="button" onClick={e => { e.preventDefault(); setAttachedFile(null) }}
                className="text-brand-muted hover:text-red-600 font-bold text-lg shrink-0">×</button>
            )}
            <input type="file" className="hidden" onChange={e => setAttachedFile(e.target.files[0] || null)} />
          </label>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          ⏳ After submission, your posting will show as <strong>Pending Admin Approval</strong> until HR reviews it.
        </div>

        <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#C00000' }}>
          Submit for Review →
        </button>
      </form>
    </div>
  )
}
