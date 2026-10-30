import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// PrimeVue
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-teal/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Tag from 'primevue/tag'
import Card from 'primevue/card'

const app = createApp(App)
app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(store)
app.use(router)

app.component('Button', Button)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Dialog', Dialog)
app.component('Toast', Toast)
app.component('Dropdown', Dropdown)
app.component('Calendar', Calendar)
app.component('Tag', Tag)
app.component('Card', Card)

app.mount('#app')
