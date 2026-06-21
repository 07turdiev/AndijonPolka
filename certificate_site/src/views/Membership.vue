<script>
import { ElMessage } from 'element-plus'

const ANDIJON_REGION_ID = 17

// Birth-certificate (Guvohnoma, documentTypeId 2) document series — chosen from a list
const BIRTH_CERT_SERIES = [
  'I-AN', 'I-BH', 'I-FR', 'I-GZ', 'I-HR', 'I-NA', 'I-NV', 'I-QD', 'I-QQ', 'I-SM', 'I-SR', 'I-SU', 'I-TN', 'I-TV',
  'II-AN', 'II-BH', 'II-EP', 'II-FR', 'II-GZ', 'II-HR', 'II-KS', 'II-NA', 'II-NV', 'II-QD', 'II-QQ', 'II-SM', 'II-SR', 'II-SU', 'II-TN', 'II-TS', 'II-TV',
  'III-AN', 'III-BH', 'III-FR', 'III-GZ', 'III-HR', 'III-KK', 'III-NA', 'III-NV', 'III-QD', 'III-QQ', 'III-SM', 'III-SR', 'III-SU', 'III-TN', 'III-TV',
  'T', 'TA'
]

export default {
  name: 'Membership',
  data() {
    return {
      documentTypeId: 7,
      pinfl: '',
      series: '',
      number: '',
      birth_date: '',
      dateDisplay: '',
      person: null,
      isMinor: false,
      alreadyRegistered: false,
      regions: [],
      districts: [],
      region_id: ANDIJON_REGION_ID,
      district_id: null,
      phone_number: '',
      phoneDisplay: '',
      prevPhone: { text: '', digits: 0 },
      searching: false,
      submitting: false,
      done: false,
      doneName: ''
    }
  },
  computed: {
    docTypes() {
      return [
        { label: this.$t('m_docPinfl'), value: 7 },
        { label: this.$t('m_docIdCard'), value: 6 },
        { label: this.$t('m_docBirthCert'), value: 2 },
        { label: this.$t('m_docPassport'), value: 3 }
      ]
    },
    isPinfl() { return this.documentTypeId === 7 },
    isBirthCert() { return this.documentTypeId === 2 },
    birthCertSeries() { return BIRTH_CERT_SERIES },
    photoSrc() {
      if (!this.person || !this.person.photo) return ''
      return 'data:image/jpeg;base64,' + this.person.photo
    },
    fullName() {
      if (!this.person) return ''
      return [this.person.last_name, this.person.first_name, this.person.middle_name]
        .filter(Boolean).join(' ')
    },
    genderLabel() {
      if (!this.person) return ''
      return this.person.gender === 'M' ? this.$t('m_male') : (this.person.gender === 'F' ? this.$t('m_female') : '')
    }
  },
  methods: {
    onDocTypeChange() {
      this.pinfl = ''
      this.series = ''
      this.number = ''
      this.person = null
      this.alreadyRegistered = false
    },
    onPinflInput(v) {
      this.pinfl = (v || '').replace(/\D/g, '').slice(0, 14)
    },
    onSeriesInput(v) {
      this.series = (v || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
    },
    onNumberInput(v) {
      this.number = (v || '').replace(/\D/g, '').slice(0, 9)
    },
    // Birth date typing -> auto-insert dots (DD.MM.YYYY)
    onDateInput(v) {
      const d = (v || '').replace(/\D/g, '').slice(0, 8)
      let out = d
      if (d.length >= 5) out = d.slice(0, 2) + '.' + d.slice(2, 4) + '.' + d.slice(4)
      else if (d.length >= 3) out = d.slice(0, 2) + '.' + d.slice(2)
      this.dateDisplay = out
      this.birth_date = d.length === 8 ? `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}` : ''
    },
    // Calendar icon -> open the (visually hidden) date picker panel
    openCalendar() {
      const p = this.$refs.dateRef
      if (p && p.focus) p.focus()
    },
    // Calendar selection -> fill the masked input
    onPickerChange(val) {
      if (!val) return
      const [y, m, d] = val.split('-')
      this.dateDisplay = `${d}.${m}.${y}`
      this.birth_date = val
    },
    validDate() {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(this.birth_date)) return false
      const [y, m, dd] = this.birth_date.split('-').map(Number)
      if (m < 1 || m > 12 || dd < 1 || dd > 31) return false
      const year = new Date().getFullYear()
      return y >= 1900 && y <= year
    },
    // Phone: +998 (XX) XXX-XX-XX, with correct backspace through separators
    onPhoneInput(v) {
      let digits = (v || '').replace(/\D/g, '')
      if (digits.startsWith('998')) digits = digits.slice(3)
      digits = digits.slice(0, 9)
      if (this.prevPhone.text && (v || '').length < this.prevPhone.text.length && digits.length === this.prevPhone.digits) {
        digits = digits.slice(0, -1)
      }
      let out = ''
      if (digits.length > 0) {
        out = '+998 (' + digits.slice(0, 2)
        if (digits.length >= 2) out += ')'
        if (digits.length > 2) out += ' ' + digits.slice(2, 5)
        if (digits.length >= 5) out += '-' + digits.slice(5, 7)
        if (digits.length >= 7) out += '-' + digits.slice(7, 9)
      }
      this.phoneDisplay = out
      this.phone_number = digits.length ? '+998' + digits : ''
      this.prevPhone = { text: out, digits: digits.length }
    },
    async loadRegions() {
      try {
        const res = await this.$axios.get('/regions')
        this.regions = (res && res.data && res.data.result && res.data.result.regions) || []
      } catch (e) { /* ignore */ }
    },
    async loadDistricts(regionId) {
      this.districts = []
      if (!regionId) return
      try {
        const res = await this.$axios.get('/districts', { params: { region_id: regionId } })
        this.districts = (res && res.data && res.data.result && res.data.result.districts) || []
      } catch (e) { /* ignore */ }
    },
    onRegionChange() {
      this.district_id = null
      this.loadDistricts(this.region_id)
    },
    identityPayload() {
      const p = { documentTypeId: this.documentTypeId, birth_date: this.birth_date }
      if (this.isPinfl) p.pinfl = this.pinfl
      else { p.seria = this.series; p.number = this.number }
      return p
    },
    validate() {
      if (!this.validDate()) { ElMessage.warning(this.$t('m_warnDate')); return false }
      if (this.isPinfl) {
        if (!/^\d{14}$/.test(this.pinfl)) { ElMessage.warning(this.$t('m_warnPinfl')); return false }
      } else {
        if (!this.series || !this.number) { ElMessage.warning(this.$t('m_warnDoc')); return false }
      }
      return true
    },
    async onSearch() {
      if (!this.validate()) return
      this.searching = true
      this.alreadyRegistered = false
      try {
        const res = await this.$axios.post('/search', this.identityPayload())
        const r = res && res.data && res.data.result
        if (res && res.data && res.data.success && r && r.person) {
          this.person = r.person
          this.isMinor = r.is_minor
          this.alreadyRegistered = !!r.already_registered
          if (this.alreadyRegistered) ElMessage.warning(this.$t('m_already'))
        } else {
          ElMessage.error((res && res.data && res.data.error) || this.$t('m_notFound'))
        }
      } catch (err) {
        const msg = err && err.response && err.response.data && err.response.data.error
        ElMessage.error(msg || this.$t('m_notFoundCheck'))
      } finally {
        this.searching = false
      }
    },
    async onSave() {
      if (!this.person) { ElMessage.warning(this.$t('m_searchFirst')); return }
      if (this.alreadyRegistered) { ElMessage.warning(this.$t('m_already')); return }
      this.submitting = true
      try {
        const payload = {
          ...this.identityPayload(),
          phone_number: this.phone_number || null,
          region_id: this.region_id || null,
          district_id: this.district_id || null
        }
        const res = await this.$axios.post('/register', payload)
        if (res && res.data && res.data.success) {
          this.doneName = (res.data.result && res.data.result.full_name) || this.fullName
          this.done = true
        } else {
          ElMessage.error((res && res.data && res.data.error) || this.$t('m_regErr'))
        }
      } catch (err) {
        const status = err && err.response && err.response.status
        const msg = err && err.response && err.response.data && err.response.data.error
        if (status === 409) {
          this.alreadyRegistered = true
          ElMessage.warning(msg || this.$t('m_already'))
        } else {
          ElMessage.error(msg || this.$t('m_regErr'))
        }
      } finally {
        this.submitting = false
      }
    },
    resetAll() {
      this.documentTypeId = 7
      this.pinfl = ''
      this.series = ''
      this.number = ''
      this.birth_date = ''
      this.dateDisplay = ''
      this.person = null
      this.isMinor = false
      this.alreadyRegistered = false
      this.region_id = ANDIJON_REGION_ID
      this.district_id = null
      this.phone_number = ''
      this.phoneDisplay = ''
      this.prevPhone = { text: '', digits: 0 }
      this.done = false
      this.doneName = ''
      this.loadDistricts(ANDIJON_REGION_ID)
    }
  },
  mounted() {
    this.loadRegions()
    this.loadDistricts(ANDIJON_REGION_ID)
  }
}
</script>

<template>
  <div class="m-wrap">
    <!-- DONE -->
    <div v-if="done" class="done-card">
      <div class="check">✓</div>
      <h2>{{ $t('m_doneTitle') }}</h2>
      <p class="done-name">{{ doneName }}</p>
      <p>{{ $t('m_doneText') }}</p>
      <el-button type="primary" size="large" @click="resetAll">{{ $t('m_again') }}</el-button>
    </div>

    <!-- FORM -->
    <div v-else class="m-page">
      <div class="m-head">
        <h1>{{ $t('m_title') }}</h1>
        <p class="crumb">{{ $t('m_crumb') }}</p>
      </div>

      <!-- Search panel -->
      <div class="panel">
        <div class="search-row">
          <div class="f f-type">
            <label>{{ $t('m_docType') }} <span>*</span></label>
            <el-select v-model="documentTypeId" size="large" style="width:100%" @change="onDocTypeChange">
              <el-option v-for="t in docTypes" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </div>

          <div v-if="isPinfl" class="f">
            <label>{{ $t('m_pinfl') }} <span>*</span></label>
            <el-input :model-value="pinfl" @update:model-value="onPinflInput"
              :placeholder="$t('m_pinflPh')" size="large" maxlength="14" inputmode="numeric" @keyup.enter="onSearch" />
          </div>
          <template v-else>
            <div class="f f-sm">
              <label>{{ $t('m_series') }} <span>*</span></label>
              <el-select v-if="isBirthCert" v-model="series" filterable
                :placeholder="$t('m_select')" size="large" style="width:100%">
                <el-option v-for="s in birthCertSeries" :key="s" :label="s" :value="s" />
              </el-select>
              <el-input v-else :model-value="series" @update:model-value="onSeriesInput"
                placeholder="AB" size="large" maxlength="3" @keyup.enter="onSearch" />
            </div>
            <div class="f">
              <label>{{ $t('m_number') }} <span>*</span></label>
              <el-input :model-value="number" @update:model-value="onNumberInput"
                placeholder="1234567" size="large" inputmode="numeric" @keyup.enter="onSearch" />
            </div>
          </template>

          <div class="f">
            <label>{{ $t('m_birthDate') }} <span>*</span></label>
            <div class="date-wrap">
              <el-input :model-value="dateDisplay" @update:model-value="onDateInput"
                :placeholder="$t('m_birthPh')" size="large" maxlength="10" inputmode="numeric" @keyup.enter="onSearch">
                <template #suffix>
                  <span class="cal-btn" @click.stop="openCalendar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </span>
                </template>
              </el-input>
              <el-date-picker ref="dateRef" v-model="birth_date" type="date" value-format="YYYY-MM-DD"
                :disabled-date="(d) => d > new Date()" class="date-hidden" @change="onPickerChange" />
            </div>
          </div>

          <div class="f f-btn">
            <el-button type="primary" size="large" :loading="searching" @click="onSearch">{{ $t('m_search') }}</el-button>
          </div>
        </div>
      </div>

      <!-- Result panel (after search finds a person) -->
      <div v-if="person" class="panel result-panel">
        <el-alert v-if="alreadyRegistered" type="warning" :closable="false" show-icon
          :title="$t('m_already')" style="margin-bottom: 16px" />

        <div class="result">
          <div class="result-fields">
            <div class="grid">
              <div class="ro"><label>{{ $t('m_lastName') }}</label><div class="val">{{ person.last_name }}</div></div>
              <div class="ro"><label>{{ $t('m_firstName') }}</label><div class="val">{{ person.first_name }}</div></div>
              <div class="ro"><label>{{ $t('m_middleName') }}</label><div class="val">{{ person.middle_name }}</div></div>
              <div class="ro"><label>{{ $t('m_birthDate') }}</label><div class="val">{{ person.birth_date }}</div></div>
              <div class="ro"><label>{{ $t('m_gender') }}</label><div class="val">{{ genderLabel }}</div></div>
              <div class="ro"><label>{{ $t('m_nationality') }}</label><div class="val">{{ person.nationality }}</div></div>
              <div class="ro"><label>{{ $t('m_citizenship') }}</label><div class="val">{{ person.citizenship }}</div></div>
              <div class="ro"><label>{{ $t('m_pinfl') }}</label><div class="val">{{ person.pinfl }}</div></div>
              <div class="ro">
                <label>{{ $t('m_document') }}</label>
                <div class="val">{{ person.document }} <el-tag v-if="isMinor" type="warning" size="small">{{ $t('m_minor') }}</el-tag></div>
              </div>
            </div>

            <div class="divider"></div>

            <div class="grid">
              <div class="ro">
                <label>{{ $t('m_region') }}</label>
                <el-select v-model="region_id" :placeholder="$t('m_select')" size="large" style="width:100%" filterable @change="onRegionChange">
                  <el-option v-for="r in regions" :key="r.region_id" :label="r.name_uz" :value="r.region_id" />
                </el-select>
              </div>
              <div class="ro">
                <label>{{ $t('m_district') }}</label>
                <el-select v-model="district_id" :placeholder="$t('m_select')" size="large" style="width:100%" clearable filterable :disabled="!region_id">
                  <el-option v-for="d in districts" :key="d.district_id" :label="d.name_uz" :value="d.district_id" />
                </el-select>
              </div>
              <div class="ro">
                <label>{{ $t('m_phone') }}</label>
                <el-input :model-value="phoneDisplay" @update:model-value="onPhoneInput"
                  placeholder="+998 (__) ___-__-__" size="large" inputmode="numeric" />
              </div>
            </div>
          </div>

          <div class="result-photo">
            <img v-if="photoSrc" :src="photoSrc" alt="photo" />
            <div v-else class="no-photo">Foto</div>
          </div>
        </div>

        <!-- Save (only visible once a person is found) -->
        <div class="save-row">
          <el-button type="success" size="large" :loading="submitting" :disabled="alreadyRegistered" @click="onSave">
            {{ $t('m_save') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Match the site's main width (same as footer/.wrapper) on desktop,
   but stay full-width on phones instead of the global .wrapper 340px cap */
.m-wrap { width: 1420px; max-width: 100%; margin: 0 auto; box-sizing: border-box; }
@media (max-width: 1439px) and (min-width: 1200px) { .m-wrap { width: 1180px; } }
@media (max-width: 1199px) and (min-width: 834px) { .m-wrap { width: 754px; } }
@media (max-width: 833px) { .m-wrap { width: 100%; padding: 0 16px; } }
.m-page { padding: 28px 0 60px; }
.m-head { margin-bottom: 20px; }
.m-head h1 { margin: 0; font-size: 24px; color: #1e293b; }
.crumb { margin: 4px 0 0; color: #94a3b8; font-size: 14px; }

.panel { background: #fff; border-radius: 14px; padding: 22px; box-shadow: 0 4px 18px rgba(30, 58, 138, .07); margin-bottom: 18px; }

.search-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
.f { display: flex; flex-direction: column; flex: 1 1 200px; min-width: 160px; }
.f-type { flex: 1 1 240px; }
.f-sm { flex: 0 1 150px; min-width: 130px; }
.f-btn { flex: 0 0 auto; }
.f-btn .el-button { height: 40px; }
.f label, .ro label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.f label span, .ro label span { color: #ef4444; }

/* Birth date: masked typing input + calendar icon. The picker is collapsed to
   1px (invisible) so it is NOT a second field; the icon opens its popup. */
.date-wrap { position: relative; }
.date-wrap .date-hidden {
  position: absolute; right: 0; bottom: 0;
  width: 1px; height: 1px; opacity: 0; overflow: hidden; pointer-events: none;
}
.cal-btn { display: inline-flex; align-items: center; color: #64748b; cursor: pointer; }
.cal-btn:hover { color: #1d4ed8; }

.result { display: flex; gap: 24px; align-items: flex-start; }
.result-fields { flex: 1; min-width: 0; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px 18px; }
.ro { display: flex; flex-direction: column; }
.val {
  min-height: 40px; display: flex; align-items: center; gap: 8px;
  background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 8px 12px; color: #334155; font-size: 14px; font-weight: 500;
}
.divider { height: 1px; background: #eef2f7; margin: 20px 0; }

.result-photo { flex: 0 0 170px; }
.result-photo img { width: 170px; height: 210px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0; }
.no-photo { width: 170px; height: 210px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 10px; color: #94a3b8; font-size: 13px; }

.save-row { display: flex; justify-content: flex-end; margin-top: 22px; padding-top: 18px; border-top: 1px solid #eef2f7; }
.save-row .el-button { min-width: 200px; }

.done-card { max-width: 520px; margin: 60px auto; background: #fff; border-radius: 16px; padding: 36px; text-align: center; box-shadow: 0 10px 30px rgba(30, 58, 138, .12); }
.done-card .check { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 14px; background: #16a34a; color: #fff; font-size: 36px; line-height: 64px; }
.done-card h2 { margin: 0 0 6px; color: #1e293b; }
.done-name { font-weight: 700; font-size: 18px; margin: 4px 0 8px; }
.done-card .el-button { margin-top: 16px; }

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .m-page { padding: 16px 0 48px; }
  .m-head h1 { font-size: 21px; }
  .panel { padding: 16px; }
  .search-row { gap: 12px; }
  .f, .f-type, .f-sm { flex: 1 1 100%; min-width: 0; }
  .f-btn { flex: 1 1 100%; }
  .f-btn .el-button { width: 100%; }
  .result { flex-direction: column-reverse; align-items: center; gap: 16px; }
  .result-fields { width: 100%; }
  .grid { grid-template-columns: 1fr; }
  .result-photo { flex: 0 0 auto; }
  .save-row { justify-content: stretch; }
  .save-row .el-button { width: 100%; }
}
</style>
