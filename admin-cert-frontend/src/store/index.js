import { createStore } from 'vuex'
import axios from 'axios'

// Backend base (no trailing slash). In production the admin is served behind
// nginx on the same origin, so the API is reached via a relative path ('' =>
// "/api/admin/...", nginx proxies it). For local dev, .env sets
// VUE_APP_API_URL=http://localhost:5000
const baseUrl = process.env.VUE_APP_API_URL || ''

const setupAxiosInterceptors = (store) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        store.commit('clearToken')
      }
      return Promise.reject(error)
    }
  )
}

const ok = (res) => res && res.data && res.data.success
const result = (res) => (res && res.data && res.data.result) ? res.data.result : {}

const store = createStore({
  state: {
    baseUrl,
    token: localStorage.getItem('adminToken') || '',
    regions: [],
    stats: { total: 0, today: 0 }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    getToken: state => state.token,
    cdnBase: state => `${state.baseUrl}/api/cdn`
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
    setRegions(state, regions) { state.regions = regions },
    setStats(state, stats) { state.stats = stats }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const res = await axios.post(`${baseUrl}/api/admin/login`, credentials)
        if (ok(res)) {
          commit('setToken', result(res).token)
          return true
        }
        return false
      } catch (e) {
        return false
      }
    },

    logout({ commit }) { commit('clearToken') },

    async fetchRegions({ commit }) {
      try {
        const res = await axios.get(`${baseUrl}/api/site/regions`)
        commit('setRegions', result(res).regions || [])
      } catch (e) { /* ignore */ }
    },

    async fetchDistricts(_, regionId) {
      try {
        const res = await axios.get(`${baseUrl}/api/site/districts`, { params: { region_id: regionId } })
        return result(res).districts || []
      } catch (e) { return [] }
    },

    async fetchStats({ commit, getters }) {
      try {
        const res = await axios.get(`${baseUrl}/api/admin/participants/stats`, {
          headers: { Authorization: getters.getToken }
        })
        if (ok(res)) commit('setStats', result(res))
      } catch (e) { /* ignore */ }
    },

    async fetchParticipants({ getters }, options = {}) {
      try {
        const { searchWord, region_id, district_id, start_date, end_date, min_age, max_age, offset = 0, limit = 20 } = options
        const params = { offset, limit }
        if (searchWord) params.searchWord = searchWord
        if (region_id) params.region_id = region_id
        if (district_id) params.district_id = district_id
        if (start_date) params.start_date = start_date
        if (end_date) params.end_date = end_date
        if (min_age !== undefined && min_age !== null && min_age !== '') params.min_age = min_age
        if (max_age !== undefined && max_age !== null && max_age !== '') params.max_age = max_age

        const res = await axios.get(`${baseUrl}/api/admin/participants`, {
          headers: { Authorization: getters.getToken },
          params
        })
        if (ok(res)) {
          return { data: result(res).rows, totalRecords: result(res).count }
        }
        return { data: [], totalRecords: 0 }
      } catch (e) {
        return { data: [], totalRecords: 0 }
      }
    },

    async deleteParticipant({ getters }, id) {
      try {
        const res = await axios.delete(`${baseUrl}/api/admin/participants/${id}`, {
          headers: { Authorization: getters.getToken }
        })
        return { success: ok(res) }
      } catch (e) {
        return { success: false }
      }
    },

    async exportParticipants({ getters }, options = {}) {
      try {
        const params = {}
        if (options.searchWord) params.searchWord = options.searchWord
        if (options.region_id) params.region_id = options.region_id
        if (options.district_id) params.district_id = options.district_id
        if (options.start_date) params.start_date = options.start_date
        if (options.end_date) params.end_date = options.end_date
        if (options.min_age !== undefined && options.min_age !== null && options.min_age !== '') params.min_age = options.min_age
        if (options.max_age !== undefined && options.max_age !== null && options.max_age !== '') params.max_age = options.max_age

        const res = await axios.get(`${baseUrl}/api/admin/participants/export`, {
          headers: { Authorization: getters.getToken },
          params,
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([res.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'ishtirokchilar.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        return true
      } catch (e) {
        return false
      }
    }
  }
})

setupAxiosInterceptors(store)
export default store
