import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import i18n
import { i18n } from './locales'

// PrimeVue imports
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-teal/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// PrimeVue components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Dropdown from 'primevue/dropdown'
import Card from 'primevue/card'
import Badge from 'primevue/badge'
import Avatar from 'primevue/avatar'
import ProgressSpinner from 'primevue/progressspinner'
import Textarea from 'primevue/textarea'

const app = createApp(App)

app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(store)
app.use(router)
app.use(i18n)

// Register components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('Toast', Toast)
app.component('Dropdown', Dropdown)
app.component('Card', Card)
app.component('Badge', Badge)
app.component('Avatar', Avatar)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Textarea', Textarea)

app.mount('#app') 