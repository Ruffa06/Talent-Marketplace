import React from 'react'

export function Toast({ message, type = 'success' }) {
  const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-primary' : 'bg-navy'
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${bg} text-white px-5 py-3 rounded-lg shadow-lg max-w-sm text-sm animate-fade-in`}>
      {message}
    </div>
  )
}
