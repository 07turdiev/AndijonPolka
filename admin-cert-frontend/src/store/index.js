import { createStore } from 'vuex'
import axios from 'axios'

// Create axios instance with interceptors
const setupAxiosInterceptors = (store) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      // Check for unauthorized errors (401, 403)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Unauthorized request detected, logging out...')
        store.commit('clearToken')
      }
      return Promise.reject(error)
    }
  )
}

const store = createStore({
  state: {
    // baseUrl: 'http://localhost:5000', // Point to the local mock server
    baseUrl: 'https://study.madaniyhayot.uz', // Backend API base URL
    token: localStorage.getItem('adminToken') || '',
    user: null,
    certifiedUsers: [],
    applications: [],
    applicationStats: {
      total: 0,
      new: 0,
      finished: 0,
      accepted: 0,
      cancelled: 0,
      count: 0 // Total count for pagination
    },
    regions: [],
    quarters: []
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getToken: state => state.token,
    getApplicationStats: state => state.applicationStats
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem('adminToken', token)
    },
    clearToken(state) {
      state.token = ''
      localStorage.removeItem('adminToken')
    },
    setCertifiedUsers(state, users) {
      state.certifiedUsers = users
    },
    setApplications(state, applications) {
      state.applications = applications
    },
    setApplicationStats(state, stats) {
      state.applicationStats = {
        ...state.applicationStats,
        ...stats
      }
    },
    setRegions(state, regions) {
      state.regions = regions
    },
    setQuarters(state, quarters) {
      state.quarters = quarters
    }
  },
  actions: {
    // Login action
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${this.state.baseUrl}/api/admin/login`, credentials)
        console.log('Login response:', response.data)
        if (response.data.success) {
          console.log('Token received:', response.data.result.token)
          commit('setToken', response.data.result.token)
          console.log('Token stored in localStorage:', localStorage.getItem('adminToken'))
          return true
        }
        return false
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },
    
    // Delete user by id (admin)
    async deleteUserById({ getters }, userId) {
      try {
        const response = await axios.delete(
          `${this.state.baseUrl}/api/admin/users/${userId}`,
          {
            headers: {
              Authorization: getters.getToken
            },
            withCredentials: true
          }
        )
        return { success: response && response.status === 200 }
      } catch (error) {
        const status = error && error.response ? error.response.status : undefined
        if (status === 404) {
          return { success: false, notFound: true, status }
        }
        return {
          success: false,
          status,
          message: (error && error.response && (error.response.data && error.response.data.error ? error.response.data.error : error.response.data)) || (error && error.message) || 'Unknown error'
        }
      }
    },
    
    // Logout action
    logout({ commit }) {
      commit('clearToken')
    },
    
    // Fetch certified users
    async fetchCertifiedUsers({ commit, getters }, options = {}) {
      try {
        const { searchWord, region_id, organization_id, start_date, end_date, quarter_id, year, offset = 0, limit = 10 } = options

        // Build query params
        const params = {}
        if (searchWord) params.searchWord = searchWord
        if (region_id) params.region_id = region_id
        if (organization_id) params.organization_id = organization_id
        if (year) params.year = year

        // Format dates as dd.MM.yyyy if Date objects provided
        const formatDDMMYYYY = (d) => {
          const dateObj = typeof d === 'string' ? new Date(d) : d
          if (!(dateObj instanceof Date) || isNaN(dateObj)) return null
          const dd = String(dateObj.getDate()).padStart(2, '0')
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0')
          const yyyy = String(dateObj.getFullYear())
          return `${dd}.${mm}.${yyyy}`
        }
        if (start_date) params.start_date = typeof start_date === 'string' ? start_date : formatDDMMYYYY(start_date)
        if (end_date) params.end_date = typeof end_date === 'string' ? end_date : formatDDMMYYYY(end_date)
        if (quarter_id) params.quarter_id = quarter_id

        // Add pagination params
        params.offset = offset
        params.limit = limit

        console.log('Fetching certified users with params:', params)
        
        const response = await axios.get(`${this.state.baseUrl}/api/admin/guides`, {
          headers: { Authorization: getters.getToken },
          params
        })

        console.log('Certified users API response:', response.data)

        const resData = response && response.data ? response.data : null
        if (resData && (resData.success || resData.status === 'ok')) {
          const result = resData.result || resData.data || {}
          const users = result.users || result.rows || result.guides || []
          const count = result.count || result.total || (Array.isArray(users) ? users.length : 0)

          commit('setCertifiedUsers', users)
          return { data: users, totalRecords: count }
        }
        return { data: [], totalRecords: 0 }
      } catch (error) {
        console.error('Error fetching certified users:', error)
        return { data: [], totalRecords: 0 }
      }
    },
    
    // Fetch regions
    async fetchRegions({ commit, getters }) {
      try {
        const response = await axios.get(`${this.state.baseUrl}/api/site/regions`, {
          headers: {
            Authorization: getters.getToken
          }
        })
        if (response && response.data && response.data.result) {
          commit('setRegions', response.data.result)
        } else if (response && response.data) {
          commit('setRegions', response.data)
        }
      } catch (error) {
        console.error('Error fetching regions:', error)
      }
    },
    
    // Fetch applications with filters
    async fetchApplications({ commit, getters }, options = {}) {
      try {
        const { searchWord, status, region_id, year, offset = 0, limit = 10 } = options

        // Build query params
        const params = { token: getters.getToken }
        if (searchWord) params.searchWord = searchWord
        if (status) params.status = status
        if (region_id) params.region_id = region_id
        if (year) params.year = year

        // Add pagination params
        params.offset = offset
        params.limit = limit
        
        const response = await axios.get(`${this.state.baseUrl}/api/admin/applications`, { params })
        
        if (response && response.data && response.data.success) {
          commit('setApplications', response.data.result.rows)
          commit('setApplicationStats', {
            total: response.data.result.totalNumberApplications,
            new: response.data.result.newApplications,
            finished: response.data.result.finishedApplications,
            accepted: response.data.result.acceptedApplications,
            cancelled: response.data.result.cancelledApplications,
            count: response.data.result.count // Total count for pagination
          })
        }
        
        return response && response.data && response.data.result ? {
          data: response.data.result.rows,
          totalRecords: response.data.result.count
        } : { data: [], totalRecords: 0 }
      } catch (error) {
        console.error('Error fetching applications:', error)
        return { data: [], totalRecords: 0 }
      }
    },
    
    // Change application status
    async changeApplicationStatus({ dispatch, getters }, { applicationId, status, cancel_comment }) {
      try {
        const body = { status }
        if (cancel_comment) body.cancel_comment = cancel_comment
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/applications/${applicationId}`,
          body,
          { params: { token: getters.getToken } }
        )
        if (response.data.success) {
          // Refresh the applications list
          dispatch('fetchApplications')
          return true
        }
        return false
      } catch (error) {
        console.error('Error changing application status:', error)
        return false
      }
    },
    
    // Create certificate
    async createCertificate({ dispatch, getters }, { applicationId, quarterId = null }) {
      try {
        const requestData = { status: 'done' }
        if (quarterId) {
          requestData.quarter_id = quarterId
        }
        
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/applications/certificate/${applicationId}`,
          requestData,
          { params: { token: getters.getToken } }
        )
        if (response.data.success) {
          // Refresh the applications list
          dispatch('fetchApplications')
          return response.data.result
        }
        return null
      } catch (error) {
        console.error('Error creating certificate:', error)
        return null
      }
    },
    
    // Download certificate
    async downloadCertificate({ getters }, { certificateId, firstName, lastName }) {
      try {
        // Get certificate ID from object if passed as single object
        const id = certificateId && certificateId.certificate_id ? certificateId.certificate_id : certificateId;
        
        // Set responseType to blob to handle file download
        const response = await axios.get(
          `${this.state.baseUrl}/api/site/download/${id}`,
          {
            responseType: 'blob',
            headers: {
              Authorization: getters.getToken
            }
          }
        )
        
        // Create a URL for the blob
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = url
        
        // Use first name and last name if provided
        let filename = 'certificate.pdf'
        
        if (firstName && lastName) {
          filename = `${firstName} ${lastName}.pdf`
        } else {
          // Try to get filename from content-disposition header as fallback
          const contentDisposition = response.headers['content-disposition']
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/)
            if (filenameMatch && filenameMatch.length === 2) {
              filename = filenameMatch[1]
            }
          }
        }
        
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        
        return true
      } catch (error) {
        console.error('Error downloading certificate:', error)
        return false
      }
    },
    
    // Fetch organizations with filters
    async fetchOrganizations({ getters }, options = {}) {
      try {
        const { searchWord, region_id, offset = 0, limit = 10 } = options
        
        // Build query params
        const params = { token: getters.getToken }
        if (searchWord) params.searchWord = searchWord
        if (region_id) params.region_id = region_id
        
        // Add pagination params
        params.offset = offset
        params.limit = limit
        
        const response = await axios.get(`${this.state.baseUrl}/api/admin/organizations`, { 
          params,
          headers: {
            Authorization: getters.getToken
          }
        })
        
        if (response && response.data && response.data.success) {
          // Return the organizations data and total count
          return {
            data: response.data.result.organizations || [],
            totalRecords: response.data.result.count || 0
          }
        }
        
        return { data: [], totalRecords: 0 }
      } catch (error) {
        console.error('Error fetching organizations:', error)
        return { data: [], totalRecords: 0 }
      }
    },
    
    // Add new organization
    async addOrganization({ getters }, organizationData) {
      try {
        const response = await axios.post(
          `${this.state.baseUrl}/api/admin/organizations/add`,
          organizationData,
          {
            headers: {
              Authorization: getters.getToken
            }
          }
        )
        
        if (response && response.data && response.data.success) {
          return {
            success: true,
            data: response.data.result
          }
        }
        
        return {
          success: false,
          error: response.data.error || 'Unknown error'
        }
      } catch (error) {
        console.error('Error adding organization:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    
    // Edit organization
    async editOrganization({ getters }, { id, organizationData }) {
      try {
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/organizations/edit/${id}`,
          organizationData,
          {
            headers: {
              Authorization: getters.getToken
            }
          }
        )
        
        if (response && response.data && response.data.success) {
          return {
            success: true,
            data: response.data.result
          }
        }
        
        return {
          success: false,
          error: response.data.error || 'Unknown error'
        }
      } catch (error) {
        console.error('Error editing organization:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    
    // Delete organization
    async deleteOrganization({ getters }, id) {
      try {
        const response = await axios.delete(
          `${this.state.baseUrl}/api/admin/organizations/${id}`,
          {
            headers: {
              Authorization: getters.getToken
            }
          }
        )
        
        if (response && response.data) {
          return {
            success: response.data.success
          }
        }
        
        return {
          success: false
        }
      } catch (error) {
        console.error('Error deleting organization:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    // --- TEST TOPICS ---
    async fetchTestTopics({ getters }) {
      try {
        const response = await axios.get(`${this.state.baseUrl}/api/admin/test/topics`, {
          headers: { Authorization: getters.getToken }
        })
        return response.data.result || []
      } catch (error) {
        console.error('Error fetching test topics:', error)
        return []
      }
    },
    async addTestTopic({ getters }, topicData) {
      try {
        const response = await axios.post(
          `${this.state.baseUrl}/api/admin/test/topics/create`,
          topicData,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error adding test topic:', error)
        return null
      }
    },
    async editTestTopic({ getters }, { id, topicData }) {
      try {
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/test/topics/edit/${id}`,
          topicData,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error editing test topic:', error)
        return null
      }
    },
    async deleteTestTopic({ getters }, id) {
      try {
        const response = await axios.delete(
          `${this.state.baseUrl}/api/admin/test/topics/delete/${id}`,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error deleting test topic:', error)
        return null
      }
    },
    // --- TEST QUESTIONS ---
    async fetchTestQuestions({ getters }) {
      try {
        const response = await axios.get(`${this.state.baseUrl}/api/admin/test/questions`, {
          headers: { Authorization: getters.getToken }
        })
        return response.data.result || []
      } catch (error) {
        console.error('Error fetching test questions:', error)
        return []
      }
    },
    async addTestQuestion({ getters }, questionData) {
      try {
        const response = await axios.post(
          `${this.state.baseUrl}/api/admin/test/questions/create`,
          questionData,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error adding test question:', error)
        return null
      }
    },
    async editTestQuestion({ getters }, { id, questionData }) {
      try {
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/test/questions/edit/${id}`,
          questionData,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error editing test question:', error)
        return null
      }
    },
    async deleteTestQuestion({ getters }, id) {
      try {
        const response = await axios.delete(
          `${this.state.baseUrl}/api/admin/test/questions/delete/${id}`,
          { headers: { Authorization: getters.getToken } }
        )
        return response.data
      } catch (error) {
        console.error('Error deleting test question:', error)
        return null
      }
    },
    async fetchTestQuestionsByTopic({ getters }, topicId) {
      try {
        const response = await axios.get(`${this.state.baseUrl}/api/admin/test/questions/${topicId}`, {
          headers: { Authorization: getters.getToken }
        })
        return response.data.result || []
      } catch (error) {
        console.error('Error fetching test questions by topic:', error)
        return []
      }
    },
    async adminApiRequest({ getters }, { url, params }) {
      try {
        const response = await axios.get(`${this.state.baseUrl}${url}`, { params, headers: { Authorization: getters.getToken } })
        return response.data
      } catch (error) {
        console.error('Error fetching test questions by topic:', error)
        return {result:null}
      }
    },
    
    // --- QUARTERS ---
    async fetchQuarters({ commit, getters }, options = {}) {
      try {
        const { offset = 0, limit = 10 } = options
        
        console.log('Fetching quarters from:', `${this.state.baseUrl}/api/admin/quarters`)
        console.log('Token:', getters.getToken)
        console.log('Token length:', getters.getToken ? getters.getToken.length : 0)
        
        const response = await axios.get(`${this.state.baseUrl}/api/admin/quarters`, {
          headers: { 
            'Authorization': getters.getToken,
            'Content-Type': 'application/json'
          },
          params: { offset, limit }
        })
        
        console.log('Quarters API response:', response.data)
        
        if (response && response.data && response.data.success) {
          commit('setQuarters', response.data.data || [])
          return {
            data: response.data.data || [],
            totalRecords: response.data.data ? response.data.data.length : 0
          }
        }
        
        return { data: [], totalRecords: 0 }
      } catch (error) {
        console.error('Error fetching quarters:', error)
        return { data: [], totalRecords: 0 }
      }
    },
    
    async addQuarter({ getters }, quarterData) {
      try {
        const response = await axios.post(
          `${this.state.baseUrl}/api/admin/quarters/create`,
          quarterData,
          { headers: { 
            'Authorization': getters.getToken,
            'Content-Type': 'application/json'
          } }
        )
        
        if (response && response.data && response.data.success) {
          return {
            success: true,
            data: response.data.data
          }
        }
        
        return {
          success: false,
          error: response.data.error || 'Unknown error'
        }
      } catch (error) {
        console.error('Error adding quarter:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    
    async editQuarter({ getters }, { id, quarterData }) {
      try {
        const response = await axios.put(
          `${this.state.baseUrl}/api/admin/quarters/edit/${id}`,
          quarterData,
          { headers: { 
            'Authorization': getters.getToken,
            'Content-Type': 'application/json'
          } }
        )
        
        if (response && response.data && response.data.success) {
          return {
            success: true,
            data: response.data.data
          }
        }
        
        return {
          success: false,
          error: response.data.error || 'Unknown error'
        }
      } catch (error) {
        console.error('Error editing quarter:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    
    async deleteQuarter({ getters }, id) {
      try {
        const response = await axios.delete(
          `${this.state.baseUrl}/api/admin/quarters/${id}`,
          { headers: { 
            'Authorization': getters.getToken,
            'Content-Type': 'application/json'
          } }
        )
        
        if (response && response.data) {
          return {
            success: response.data.success
          }
        }
        
        return {
          success: false
        }
      } catch (error) {
        console.error('Error deleting quarter:', error)
        return {
          success: false,
          error: (error.response && error.response.data && error.response.data.error) || error.message || 'Unknown error'
        }
      }
    },
    
    async fetchActiveQuarters({ getters }) {
      try {
        const response = await axios.get(`${this.state.baseUrl}/api/admin/quarters/active`, {
          headers: { 
            'Authorization': getters.getToken,
            'Content-Type': 'application/json'
          }
        })
        
        if (response && response.data && response.data.success) {
          return response.data.data || []
        }
        
        return []
      } catch (error) {
        console.error('Error fetching active quarters:', error)
        return []
      }
    }
  }
})

// Setup axios interceptors with access to the store
setupAxiosInterceptors(store)

export default store 
