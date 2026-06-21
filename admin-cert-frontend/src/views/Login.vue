<template>
  <div class="login-container">
    <Card class="login-card">
      <template #header>
        <div class="login-header">
          <!-- <img src="http://study.madaniyhayot.uz/assets/logo-67a6f6ec.png" alt="Logo" class="login-logo" /> -->
          <h1 class="login-title">{{ $t('app_name') }}</h1>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="p-field">
            <label for="email">{{ $t('email') }}</label>
            <div class="w-full">
              <InputText id="email" v-model="credentials.login" class="p-inputtext-lg w-full" :placeholder="$t('email')" />
            </div>
            <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
          </div>
          <div class="p-field">
            <label for="password">{{ $t('password') }}</label>
            <div class="w-full">
              <InputText id="password" v-model="credentials.password" type="password" class="p-inputtext-lg w-full" :placeholder="$t('password')" />
            </div>
            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
          </div>
          <div class="p-field login-button">
            <Button :label="$t('login_button')" type="submit" :loading="loading" class="p-button-lg" />
          </div>
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { inject } from 'vue'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    const i18n = inject('i18n')
    
    const credentials = ref({
      login: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    const errors = ref({
      email: '',
      password: ''
    })
    
    const validateForm = () => {
      errors.value = {
        email: '',
        password: ''
      }
      
      if (!credentials.value.login) {
        errors.value.email = i18n.t('email_required')
      }
      
      if (!credentials.value.password) {
        errors.value.password = i18n.t('password_required')
      }
      
      return !errors.value.email && !errors.value.password
    }
    
    const handleLogin = async () => {
      if (!validateForm()) {
        return
      }
      
      loading.value = true
      error.value = ''
      
      try {
        const success = await store.dispatch('login', credentials.value)
        if (success) {
          router.push('/')
        } else {
          error.value = i18n.t('invalid_credentials')
          toast.add({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('invalid_credentials'),
            life: 3000
          })
        }
      } catch (err) {
        error.value = i18n.t('login_error')
        toast.add({
          severity: 'error',
          summary: i18n.t('error'),
          detail: i18n.t('login_error'),
          life: 3000
        })
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      credentials,
      loading,
      error,
      errors,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.login-logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

.login-title {
  color: #334155;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.p-field {
  margin-bottom: 1.5rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
}

:deep(.p-inputtext) {
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border-radius: 6px;
}

.login-button {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

:deep(.p-button-lg) {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  width: 100%;
}

.error-message {
  color: #ef4444;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.w-full {
  width: 100%;
}
</style> 