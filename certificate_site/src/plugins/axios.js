import axios from 'axios'

// In production the site is served behind nginx on the same origin, so the API
// is reached via the relative path "/api/site" (nginx proxies it to the backend).
// For local dev, .env.development sets VITE_API_URL=http://localhost:5000/api/site
const baseURL = import.meta.env.VITE_API_URL || '/api/site'

const axiosInstance = axios.create({
  baseURL,
  timeout: 60000
})

axiosInstance.interceptors.response.use(
  function (response) {
    return response || {}
  },
  function (error) {
    return Promise.reject(error)
  }
)

export default axiosInstance
