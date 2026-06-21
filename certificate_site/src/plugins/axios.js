import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/site'

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
