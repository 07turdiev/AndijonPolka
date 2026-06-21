import axios from 'axios'

// Configure via .env (VITE_API_URL), fall back to local backend
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/site'

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000
})

export default axiosInstance
