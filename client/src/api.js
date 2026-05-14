import axios from 'axios'

const raw = import.meta.env.VITE_API_URL
const baseURL = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''

const api = axios.create({ baseURL })

export default api
