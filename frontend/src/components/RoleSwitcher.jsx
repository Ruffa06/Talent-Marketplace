import React, { useState } from 'react'
import { useUser } from '../context/UserContext'

const ROLE_LABELS = { employee: 'Employee', manager: 'Manager', hr_admin: 'HR Admin' }

export default function RoleSwitcher() {
  const { user, users, switchUser } = useUser()
  const [open, setOpen] = useState(false)

  if (!user) return null
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-white hover:opacity-80"
      >
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold text-sm">
          {user.name[0]}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-sm font-semibold leading-none">{user.name}</div>
          <div className="text-xs opacity-75">{ROLE_LABELS[user.role]}</div>
        </div>
        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="px-3 py-2 bg-card text-xs text-muted font-semibold uppercase tracking-wider">Switch User</div>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => { switchUser(u.id); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 hover:bg-card flex items-center gap-3 ${user.id === u.id ? 'bg-red-50' : ''}`}
            >
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {u.name[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-ink">{u.name}</div>
                <div className="text-xs text-muted">{u.department} · {ROLE_LABELS[u.role]}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
