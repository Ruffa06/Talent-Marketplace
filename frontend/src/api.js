import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''
const api = axios.create({ baseURL: `${BASE}/api` })

api.interceptors.request.use(config => {
  const userId = localStorage.getItem('userId')
  if (userId) config.headers['X-User-Id'] = userId
  return config
})

export default api
