import './assets/media.css'
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './plugins/i18n'
import router from './router'
import { createPinia } from 'pinia'
import axios from "@/plugins/axios";
// import VueMask from "v-mask"
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// Element Plus locales (for the date-picker calendar: month/weekday names, buttons)
import elRu from 'element-plus/es/locale/lang/ru'
import elEn from 'element-plus/es/locale/lang/en'
import elUz from 'element-plus/es/locale/lang/uz-uz'
import { useStore } from '@/stores/store';

// Pick the Element Plus locale from the URL language (same logic as i18n)
const urlLang = window.location.pathname.replace(/^\/([^/]+).*/i, '$1')
const lang = (urlLang && urlLang.trim().length && urlLang !== '/') ? urlLang : 'uz'
const elLocale = lang === 'ru' ? elRu : (lang === 'en' ? elEn : elUz)

const app = createApp(App)
// app.use(VueMask)
app.use(router)
app.use(createPinia());
const piniaStore = useStore();
const store = {...piniaStore}
app.config.globalProperties.$axios = axios;
app.config.globalProperties.$store = store;
app.use(i18n)
app.use(ElementPlus, { locale: elLocale });
app.mount('#app')
