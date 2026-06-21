<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  data() {
    return {
      step: 'search', // 'search' | 'confirm' | 'done'
      form: {
        pinfl: '',
        birth_date: ''
      },
      person: null,
      isMinor: false,
      regions: [],
      districts: [],
      region_id: null,
      district_id: null,
      phone_number: '',
      searching: false,
      submitting: false,
      count: null,
      doneName: ''
    }
  },
  computed: {
    photoSrc() {
      if (!this.person || !this.person.photo) return ''
      return 'data:image/jpeg;base64,' + this.person.photo
    },
    fullName() {
      if (!this.person) return ''
      return [this.person.last_name, this.person.first_name, this.person.middle_name]
        .filter(Boolean).join(' ')
    }
  },
  methods: {
    onPinflInput(v) {
      this.form.pinfl = (v || '').replace(/\D/g, '').slice(0, 14)
    },
    async loadCount() {
      try {
        const res = await this.$axios.get('/count')
        this.count = res?.data?.result?.count ?? null
      } catch (e) { /* ignore */ }
    },
    async loadRegions() {
      try {
        const res = await this.$axios.get('/regions')
        this.regions = res?.data?.result?.regions || []
      } catch (e) { /* ignore */ }
    },
    async onRegionChange() {
      this.district_id = null
      this.districts = []
      if (!this.region_id) return
      try {
        const res = await this.$axios.get('/districts', { params: { region_id: this.region_id } })
        this.districts = res?.data?.result?.districts || []
      } catch (e) { /* ignore */ }
    },
    validateSearch() {
      if (!/^\d{14}$/.test(this.form.pinfl)) {
        ElMessage.warning('JSHSHIR 14 ta raqamdan iborat bo‘lishi kerak')
        return false
      }
      if (!this.form.birth_date) {
        ElMessage.warning('Tug‘ilgan sanani tanlang')
        return false
      }
      return true
    },
    async onSearch() {
      if (!this.validateSearch()) return
      this.searching = true
      try {
        const res = await this.$axios.post('/search', { ...this.form })
        const r = res?.data?.result
        if (res?.data?.success && r?.person) {
          if (r.already_registered) {
            ElMessage.success('Siz allaqachon ro‘yxatdan o‘tgansiz')
          }
          this.person = r.person
          this.isMinor = r.is_minor
          this.step = 'confirm'
        } else {
          ElMessage.error(res?.data?.error || 'Ma‘lumot topilmadi')
        }
      } catch (err) {
        ElMessage.error(err?.response?.data?.error || 'Ma‘lumot topilmadi. Ma‘lumotlarni tekshiring')
      } finally {
        this.searching = false
      }
    },
    backToSearch() {
      this.step = 'search'
      this.person = null
    },
    async onRegister() {
      this.submitting = true
      try {
        const payload = {
          pinfl: this.form.pinfl,
          birth_date: this.form.birth_date,
          phone_number: this.phone_number || null,
          region_id: this.region_id || null,
          district_id: this.district_id || null
        }
        const res = await this.$axios.post('/register', payload)
        if (res?.data?.success) {
          this.doneName = res?.data?.result?.full_name || this.fullName
          this.step = 'done'
          this.loadCount()
        } else {
          ElMessage.error(res?.data?.error || 'Ro‘yxatdan o‘tishda xatolik')
        }
      } catch (err) {
        const status = err?.response?.status
        const msg = err?.response?.data?.error
        if (status === 409) {
          this.doneName = this.fullName
          this.step = 'done'
          ElMessage.success(msg || 'Siz allaqachon ro‘yxatdan o‘tgansiz')
        } else {
          ElMessage.error(msg || 'Ro‘yxatdan o‘tishda xatolik')
        }
      } finally {
        this.submitting = false
      }
    },
    registerAnother() {
      this.form = { pinfl: '', birth_date: '' }
      this.person = null
      this.region_id = null
      this.district_id = null
      this.districts = []
      this.phone_number = ''
      this.doneName = ''
      this.step = 'search'
    }
  },
  mounted() {
    this.loadCount()
    this.loadRegions()
  }
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <div class="hero-inner">
        <h1>Andijon Polkasi</h1>
        <p class="subtitle">Ginnes rekordi — ishtirokchilarni ro‘yxatga olish</p>
        <div v-if="count !== null" class="counter">
          Ro‘yxatdan o‘tganlar: <b>{{ count.toLocaleString('ru-RU') }}</b>
        </div>
      </div>
    </header>

    <main class="container">
      <!-- STEP 1: SEARCH -->
      <div v-if="step === 'search'" class="card">
        <h2>Ma‘lumotlaringizni kiriting</h2>
        <p class="hint">JSHSHIR (14 raqam) va tug‘ilgan sanangizni kiriting. 18 yoshgacha
          bo‘lganlar ham JSHSHIR orqali ro‘yxatdan o‘tadi.</p>

        <label class="field-label">JSHSHIR (PINFL)</label>
        <el-input
          :model-value="form.pinfl"
          @update:model-value="onPinflInput"
          placeholder="14 ta raqam"
          size="large"
          maxlength="14"
          @keyup.enter="onSearch"
        />

        <label class="field-label">Tug‘ilgan sana</label>
        <el-date-picker
          v-model="form.birth_date"
          type="date"
          placeholder="Sanani tanlang"
          format="DD.MM.YYYY"
          value-format="YYYY-MM-DD"
          size="large"
          style="width: 100%"
          :disabled-date="(d) => d > new Date()"
        />

        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="searching"
          @click="onSearch"
        >Qidirish</el-button>
      </div>

      <!-- STEP 2: CONFIRM -->
      <div v-else-if="step === 'confirm'" class="card">
        <h2>Ma‘lumotlaringizni tasdiqlang</h2>

        <div class="person">
          <div class="photo">
            <img v-if="photoSrc" :src="photoSrc" alt="photo" />
            <div v-else class="no-photo">Foto yo‘q</div>
          </div>
          <div class="person-info">
            <div class="name">{{ fullName }}</div>
            <div class="row"><span>JSHSHIR:</span> {{ person.pinfl }}</div>
            <div class="row"><span>Tug‘ilgan sana:</span> {{ person.birth_date }}</div>
            <div class="row" v-if="person.gender"><span>Jinsi:</span> {{ person.gender === 'M' ? 'Erkak' : 'Ayol' }}</div>
            <div class="row" v-if="person.document"><span>Hujjat:</span> {{ person.document }}</div>
            <el-tag v-if="isMinor" type="warning" size="small" style="margin-top:6px">18 yoshgacha</el-tag>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label class="field-label">Viloyat</label>
            <el-select v-model="region_id" placeholder="Tanlang" size="large" style="width:100%" clearable filterable @change="onRegionChange">
              <el-option v-for="r in regions" :key="r.region_id" :label="r.name_uz" :value="r.region_id" />
            </el-select>
          </div>
          <div>
            <label class="field-label">Tuman</label>
            <el-select v-model="district_id" placeholder="Tanlang" size="large" style="width:100%" clearable filterable :disabled="!region_id">
              <el-option v-for="d in districts" :key="d.district_id" :label="d.name_uz" :value="d.district_id" />
            </el-select>
          </div>
        </div>

        <label class="field-label">Telefon raqami (ixtiyoriy)</label>
        <el-input v-model="phone_number" placeholder="+998 __ ___ __ __" size="large" />

        <div class="actions">
          <el-button size="large" @click="backToSearch">Orqaga</el-button>
          <el-button type="primary" size="large" :loading="submitting" @click="onRegister">Ro‘yxatdan o‘tish</el-button>
        </div>
      </div>

      <!-- STEP 3: DONE -->
      <div v-else class="card done">
        <div class="check">✓</div>
        <h2>Tabriklaymiz!</h2>
        <p class="done-name">{{ doneName }}</p>
        <p>Siz Andijon Polkasi ishtirokchilari ro‘yxatiga muvaffaqiyatli qo‘shildingiz.</p>
        <el-button type="primary" size="large" @click="registerAnother">Yana birovni ro‘yxatdan o‘tkazish</el-button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.hero {
  background: linear-gradient(135deg, var(--brand-dark), var(--brand));
  color: #fff;
  padding: 36px 16px 28px;
  text-align: center;
}
.hero h1 { margin: 0; font-size: 30px; letter-spacing: .5px; }
.subtitle { margin: 8px 0 0; opacity: .9; }
.counter {
  display: inline-block;
  margin-top: 16px;
  background: rgba(255,255,255,.15);
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 15px;
}
.counter b { font-size: 18px; }
.container { max-width: 560px; margin: -18px auto 40px; padding: 0 16px; }
.card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(30, 58, 138, .12);
}
.card h2 { margin: 0 0 6px; font-size: 20px; }
.hint { color: #6b7280; font-size: 14px; margin: 0 0 18px; }
.field-label { display: block; margin: 16px 0 6px; font-weight: 600; font-size: 14px; }
.submit-btn { width: 100%; margin-top: 22px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.actions { display: flex; gap: 12px; margin-top: 24px; }
.actions .el-button { flex: 1; }

.person { display: flex; gap: 16px; align-items: center; background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 8px; }
.photo { width: 96px; height: 120px; border-radius: 8px; overflow: hidden; background: #e5e7eb; flex-shrink: 0; }
.photo img { width: 100%; height: 100%; object-fit: cover; }
.no-photo { display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 12px; }
.person-info .name { font-weight: 700; font-size: 17px; margin-bottom: 6px; }
.person-info .row { font-size: 14px; color: #374151; margin: 2px 0; }
.person-info .row span { color: #9ca3af; }

.done { text-align: center; }
.done .check {
  width: 64px; height: 64px; border-radius: 50%; margin: 4px auto 12px;
  background: #16a34a; color: #fff; font-size: 36px; line-height: 64px;
}
.done-name { font-weight: 700; font-size: 18px; margin: 4px 0 8px; }
.done .el-button { margin-top: 16px; }

@media (max-width: 480px) {
  .grid-2 { grid-template-columns: 1fr; }
  .hero h1 { font-size: 24px; }
}
</style>
