import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get('/users').then(r => {
      setUsers(r.data)
      const savedId = localStorage.getItem('userId')
      const found = r.data.find(u => u.id === Number(savedId))
      setUser(found || r.data[0])
      if (!savedId && r.data[0]) localStorage.setItem('userId', r.data[0].id)
    })
  }, [])

  function switchUser(userId) {
    const found = users.find(u => u.id === Number(userId))
    if (found) {
      setUser(found)
      localStorage.setItem('userId', found.id)
    }
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <UserContext.Provider value={{ user, users, switchUser, toast, showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-700' : 'bg-brand-green'}`}>
          {toast.msg}
        </div>
      )}
    </UserContext.Provider>
  )
}

export function useUser() { return useContext(UserContext) }
