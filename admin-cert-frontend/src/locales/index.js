import uz from './uz'

const messages = {
  uz
}

export const defaultLocale = 'uz'

export const i18n = {
  locale: defaultLocale,
  messages,
  t(key) {
    return this.messages[this.locale][key] || key
  },
  install(app) {
    app.config.globalProperties.$t = (key) => this.t(key)
    app.provide('i18n', this)
  }
} 