<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Andijon Polkasi</h1>
        <p class="login-sub">Admin panel</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="p-field">
          <label for="login">Login</label>
          <InputText id="login" v-model="credentials.login" class="w-full" placeholder="Login" />
        </div>
        <div class="p-field">
          <label for="password">Parol</label>
          <InputText id="password" v-model="credentials.password" type="password" class="w-full" placeholder="Parol" @keyup.enter="handleLogin" />
        </div>
        <Button label="Kirish" type="submit" :loading="loading" class="w-full" />
        <div v-if="error" class="error-message">{{ error }}</div>
      </form>
    </div>
    <Toast />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    const credentials = ref({ login: '', password: '' })
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      if (!credentials.value.login || !credentials.value.password) {
        error.value = 'Login va parolni kiriting'
        return
      }
      loading.value = true
      error.value = ''
      try {
        const success = await store.dispatch('login', credentials.value)
        if (success) {
          router.push('/')
        } else {
          error.value = 'Login yoki parol noto‘g‘ri'
          toast.add({ severity: 'error', summary: 'Xatolik', detail: error.value, life: 3000 })
        }
      } catch (e) {
        error.value = 'Kirishda xatolik'
      } finally {
        loading.value = false
      }
    }

    return { credentials, loading, error, handleLogin }
  }
}
</script>

<style scoped>
.login-container {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%); padding: 2rem;
}
.login-card { width: 100%; max-width: 420px; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
.login-header { padding: 2rem 1rem 1rem; text-align: center; }
.login-title { color: #1e293b; font-size: 1.5rem; font-weight: 700; margin: 0; }
.login-sub { color: #64748b; margin: 4px 0 0; }
.login-form { display: flex; flex-direction: column; padding: 1.5rem; gap: 1rem; }
.p-field { display: flex; flex-direction: column; }
.p-field label { margin-bottom: .5rem; font-weight: 500; color: #475569; }
.w-full { width: 100%; }
.error-message { color: #ef4444; text-align: center; font-size: .875rem; }
</style>
