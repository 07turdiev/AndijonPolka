<template>
  <div class="wrapper pth">
    <div class="applications">
      <div class="new-apl">
        <h3>{{ $t('appl') }}</h3>
      </div>
    </div>

    <form class="form" @submit.prevent="send">
      <div class="new-apl-g3">
        <div class="new-apl-select">
          <label class="form__label" for="pin">{{ $t('PIN') }}</label>
          <el-input size="large" class="form__el-input" type="text" v-model="user.pin" id="pin" disabled required />
        </div>
        <div class="new-apl-select">
          <label class="form__label" for="first_name">{{ $t('firstName') }}</label>
          <el-input size="large" class="form__el-input" type="text" v-model="user.first_name" id="first_name" disabled required />
        </div>
        <div class="new-apl-select">
          <label class="form__label" for="sur_name">{{ $t('surname') }}</label>
          <el-input size="large" class="form__el-input" type="text" v-model="user.sur_name" id="sur_name" disabled required />
        </div>
      </div>
      <div class="new-apl-g3">
        <div class="new-apl-select">
          <label class="form__label" for="mid_name">{{ $t('middleName') }}</label>
          <el-input size="large" class="form__el-input" disabled type="text" v-model="user.mid_name" id="mid_name" required />
        </div>

        <div class="new-apl-select">
          <label class="form__label" for="birth_date">{{ $t('birthDate') }}</label>
          <div class="form__el-input">
            <el-date-picker
              v-model="user.birth_date"
              type="date"
              class="form__el-input"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              :placeholder="$t('selectDate')"
              size="large"
              disabled
            />
            
          </div>
        </div>

        <div class="new-apl-select">
          <label class="form__label" for="tin">{{ $t('TIN') }}</label>
          <el-input size="large" class="form__el-input" type="text" v-model="user.tin" id="tin" disabled :placeholder="$t('enterTIN')" required />
        </div>
      </div>

      <div class="new-apl-g3">
        <div class="new-apl-select">
          <label class="form__label" for="pport_num">{{ $t('passportNumber') }}</label>
          <el-input size="large" class="form__el-input" type="text" v-model="user.pport_num" id="pport_num" disabled required />
        </div>

        <div class="new-apl-select">
          <label for="region_id">{{ $t('region') }}</label>
          <el-select size="large" v-model="user.region_id" class="form__el-input" :placeholder="$t('selectRegion')" @change="getOrganization">
            <el-option v-for="item in regions" :key="item.region_id" :label="item['name_' + $i18n.locale]" :value="item.region_id" />
          </el-select>
        </div>
        
        <div class="new-apl-select">
          <label for="organization_id">{{ $t('organization') }}</label>
          <el-select size="large" v-model="applications.organization_id" class="form__el-input" :placeholder="$t('selectOrganization')" @change="updateTinFromOrganization">
            <el-option v-for="item in organizations" :key="item.organization_id" :label="item['name_' + $i18n.locale]" :value="item.organization_id" />
          </el-select>
        </div>
      </div>

      <div class="new-apl-g3">
        <div class="new-apl-select">
          <label class="form__label" for="phone_number">{{ $t('phoneNumber') }}</label>
          <el-input 
            class="form__el-input" 
            type="tel" 
            v-model="user.phone_number" 
            id="phone_number" 
            placeholder="+998 XX XXX-XX-XX" 
            @input="formatPhoneNumber" 
            required 
            size="large"
          />
          <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
        </div>

        <div class="new-apl-select">
          <label class="form__label" for="year_select">Yil</label>
          <div class="form__el-input">
            <el-select
              id="year_select"
              v-model="selectedYear"
              class="form__el-input"
              placeholder="Yilni tanlang"
              size="large"
              :loading="quartersLoading"
              :disabled="quartersLoading"
              @change="onYearChange"
            >
              <el-option
                v-for="item in availableYears"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div v-if="attemptedSubmit && !selectedYear" class="error-message">Yil tanlash majburiy</div>
        </div>

        <div class="new-apl-select">
          <label class="form__label" for="quarter_id">Chorak</label>
          <div class="form__el-input">
            <el-select
              id="quarter_id"
              v-model="selectedQuarterId"
              class="form__el-input"
              placeholder="Chorakni tanlang"
              size="large"
              :loading="quartersLoading"
              :disabled="quartersLoading || !selectedYear"
              filterable
              clearable
              @change="onQuarterChange"
            >
              <el-option
                v-for="q in filteredQuarters"
                :key="q.quarter_id"
                :label="quarterOptionLabel(q)"
                :value="q.quarter_id"
              />
            </el-select>
          </div>
          <div v-if="quartersLoading" class="helper-text">Yuklanmoqda...</div>
          <div v-if="quartersError" class="error-message" role="alert">
            Choraklar roʻyxatini yuklashda xatolik.
            <el-button type="text" @click="fetchQuarters">Qayta urinish</el-button>
          </div>
          <div v-if="!quartersLoading && !quartersError && quarters.length === 0" class="helper-text">
            Hozircha faol chorak yoʻq.
          </div>
          <div v-if="selectedYear && filteredQuarters.length === 0 && !quartersLoading" class="helper-text">
            Bu yil uchun faol chorak yoʻq.
          </div>
          <div v-if="attemptedSubmit && !selectedQuarterId" class="error-message">Chorak tanlash majburiy</div>
          <!-- Test tekshiruvi: tanlangan chorak uchun -->
          <div v-if="quarterTestLoading" class="helper-text">Test holati tekshirilmoqda...</div>
          <div v-else-if="selectedQuarterId && quarterTestChecked && quarterNoTestExists" class="test-quarter-warning">
            <span>Bu chorak uchun hali test mavjud emas.</span>
          </div>
          <div v-else-if="selectedQuarterId && quarterTestChecked && !quarterTestPassed" class="test-quarter-warning">
            <span>Tanlangan chorak uchun testni bajarishingiz kerak!</span>
            <router-link :to="'/' + $i18n.locale + '/tests'" class="go-test-link">
              Testga o'tish
            </router-link>
          </div>
          <div v-else-if="selectedQuarterId && quarterTestChecked && quarterTestPassed" class="test-quarter-success">
            Test topshirilgan
          </div>
        </div>

        <div class="new-apl-select">
          <label class="form__label" for="image">{{ $t('badgeImage') }}</label>
          <el-upload
            class="image-uploader"
            action="#"
            :http-request="handleImageUpload"
            :show-file-list="true"
            :limit="1"
            :before-upload="beforeImageUpload"
            accept="image/jpeg,image/png,image/jpg"
            size="large"
          >
            <el-button size="large" type="primary">{{ $t('selectImage') }}</el-button>
            <template #tip>
              <div class="helper-text">{{ $t('imageRequirements') }}</div>
            </template>
          </el-upload>
          <div v-if="imageError" class="error-message">{{ imageError }}</div>
        </div>
      </div>

      <div class="new-apl-block">
        <button type="submit" class="blue-filled-btn" :disabled="!isFormValid">
          {{ $t('sendAppl') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import Icons from '@/components/icons.vue'

export default {
  components: {
    Icons,
  },

  data() {
    return {
      quarterTestPassed: false,
      quarterTestChecked: false,
      quarterTestLoading: false,
      quarterNoTestExists: false,
      user: {
        tin: this.user_id,
        phone_number: '',
        region_id: '',
        gender: '',
        birth_date: null,
        pin: '',
        first_name: '',
        sur_name: '',
        mid_name: '',
        pport_num: '',
        address: '',
      },
      genders: [
        { label: this.$t('male'), value: 'M' },
        { label: this.$t('female'), value: 'F' },
      ],
      applications: {
        application_type: 'certificate',
        organization_id: '',
        image: null,
      },
      regions: [],
      organizations: [],
      phoneError: '',
      imageError: '',
      // Quarters state
      quarters: [],
      selectedYear: null,
      selectedQuarterId: '',
      quartersLoading: false,
      quartersError: '',
      quartersDisabled: false,
      attemptedSubmit: false,
    }
  },

  computed: {
    availableYears() {
      const years = [...new Set(
        this.quarters
          .map(q => q.date ? new Date(q.date).getFullYear() : null)
          .filter(y => y !== null)
      )].sort((a, b) => b - a)
      return years.map(y => ({ label: String(y), value: y }))
    },

    filteredQuarters() {
      if (!this.selectedYear) return []
      return this.quarters.filter(q => q.date && new Date(q.date).getFullYear() === this.selectedYear)
    },

    isFormValid() {
      return (
        this.user.region_id &&
        this.applications.organization_id &&
        this.user.birth_date &&
        this.user.tin &&
        this.user.phone_number &&
        !this.phoneError &&
        this.applications.image &&
        !!this.selectedYear &&
        !!this.selectedQuarterId &&
        this.quarterTestPassed
      )
    }
  },

  methods: {
    getOrganization() {
      if (!this.user.region_id) return
      this.applications.organization_id = ''
      this.$axios.get(`organizations?region=${this.user.region_id}`)
        .then((res) => {
          this.organizations = res.data.result
        })
        .catch((err) => {
          this.$message.error(err.response?.data?.message || this.$t('errorLoadingOrganizations'))
        })
    },
    
    updateTinFromOrganization() {
      if (!this.applications.organization_id) return
      
      const selectedOrganization = this.organizations.find(org => org.organization_id === this.applications.organization_id)
      if (selectedOrganization && selectedOrganization.inn) {
        this.user.tin = selectedOrganization.inn
      }
    },
    
    formatPhoneNumber() {
      // Remove non-digit characters
      let digits = this.user.phone_number.replace(/\D/g, '')
      
      // Check if starts with '998'
      if (!digits.startsWith('998')) {
        if (!digits.startsWith('8')) {
          digits = '998' + digits
        } else {
          digits = '99' + digits
        }
      }
      
      // Format as: +998 XX XXX-XX-XX
      if (digits.length > 0) {
        let formatted = '+'
        
        if (digits.length > 3) {
          formatted += digits.substring(0, 3) + ' '
        } else {
          formatted += digits
        }
        
        if (digits.length > 5) {
          formatted += digits.substring(3, 5) + ' '
        } else if (digits.length > 3) {
          formatted += digits.substring(3)
        }
        
        if (digits.length > 8) {
          formatted += digits.substring(5, 8) + '-'
        } else if (digits.length > 5) {
          formatted += digits.substring(5)
        }
        
        if (digits.length > 10) {
          formatted += digits.substring(8, 10) + '-'
        } else if (digits.length > 8) {
          formatted += digits.substring(8)
        }
        
        if (digits.length > 10) {
          formatted += digits.substring(10, 12)
        }
        
        this.user.phone_number = formatted
      }
      
      // Validate Uzbekistan phone number
      const phoneRegex = /^\+998 \d{2} \d{3}-\d{2}-\d{2}$/
      if (this.user.phone_number && !phoneRegex.test(this.user.phone_number)) {
        this.phoneError = this.$t('invalidPhoneFormat')
      } else {
        this.phoneError = ''
      }
    },
    
    setFile(e, key) {
      if (!e.target.files || !e.target.files[0]) return
      
      const file = e.target.files[0]
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (file.size > maxSize) {
        this.$message.error(this.$t('fileSizeError'))
        return
      }
      
      this.applications[key] = file
    },
    
    handleImageUpload(options) {
      const file = options.file
      this.applications.image = file
    },

    beforeImageUpload(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        this.imageError = this.$t('fileTypeError') || 'Only JPG, JPEG and PNG images are allowed!'
        return false
      }
      
      if (!isLt5M) {
        this.imageError = this.$t('fileSizeError') || 'Image size cannot exceed 5MB!'
        return false
      }
      
      this.imageError = ''
      return true
    },

    formatBirthDate(pin) {
      if (!pin || typeof pin !== 'string' || pin.length < 6) return null;
      
      let firstDigit = pin[0];
      let yearPrefix = (firstDigit === '5' || firstDigit === '6') ? '20' : (firstDigit === '3' || firstDigit === '4') ? '19' : null;
      if (!yearPrefix) return null;
      
      let year = yearPrefix + pin.slice(5, 7);
      let month = pin.slice(3, 5);
      let day = pin.slice(1, 3);
      
      return `${year}-${month}-${day}`;
    },

    // Quarter helpers
    formatDateDDMMYYYY(isoString) {
      if (!isoString) return ''
      const d = new Date(isoString)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}.${mm}.${yyyy}`
    },

    quarterOptionLabel(q) {
      return `${q.name} — ${this.formatDateDDMMYYYY(q.date)}`
    },

    onYearChange() {
      this.selectedQuarterId = ''
      this.quarterTestPassed = false
      this.quarterTestChecked = false
      this.quarterNoTestExists = false
    },

    async fetchQuarters() {
      this.quartersLoading = true
      this.quartersError = ''
      try {
        const res = await this.$axios.get('quarters')
        this.quarters = (res.data && res.data.data) ? res.data.data : []
        this.quartersDisabled = this.quarters.length === 0
        // Oxirgi (eng katta) yilni default tanlash
        if (this.quarters.length > 0) {
          const years = this.quarters
            .map(q => q.date ? new Date(q.date).getFullYear() : null)
            .filter(y => y !== null)
          if (years.length > 0) {
            this.selectedYear = Math.max(...years)
          }
        }
      } catch (err) {
        this.quartersError = err?.response?.data?.message || 'Xatolik'
      } finally {
        this.quartersLoading = false
      }
    },
    
    async onQuarterChange() {
      this.quarterTestPassed = false
      this.quarterTestChecked = false
      this.quarterNoTestExists = false
      if (this.selectedQuarterId) {
        await this.checkQuarterTest()
      }
    },

    async checkQuarterTest() {
      this.quarterTestLoading = true
      this.quarterTestChecked = false
      try {
        const user_id = localStorage.getItem('user_id')
        if (!user_id) {
          this.quarterTestPassed = false
          return
        }
        const res = await this.$axios.get('test/check-quarter', {
          params: { user_id, quarter_id: this.selectedQuarterId }
        })
        const data = res.data?.result || {}
        this.quarterTestPassed = data.hasPassed || false
        this.quarterNoTestExists = data.noTestExists || false
      } catch (err) {
        this.quarterTestPassed = false
      } finally {
        this.quarterTestLoading = false
        this.quarterTestChecked = true
      }
    },

    send() {
      // Validate form before sending
      this.attemptedSubmit = true
      if (!this.isFormValid) {
        this.$message.error(this.$t('formValidationError'))
        return
      }
      
      const userId = localStorage.getItem('user_id') || '1'
      
      const formData = new FormData()
      // User data
      formData.append('pin', this.user.pin)
      formData.append('first_name', this.user.first_name)
      formData.append('sur_name', this.user.sur_name)
      formData.append('middle_name', this.user.mid_name)
      formData.append('pport_num', this.user.pport_num)
      formData.append('phone_number', this.user.phone_number)
      formData.append('birth_date', this.user.birth_date)
      formData.append('address', this.user.address)
      formData.append('tin', this.user.tin)
      
      // Application data
      formData.append('application_type', this.applications.application_type)
      formData.append('organization', this.applications.organization_id)
      formData.append('user_id', userId)
      formData.append('image', this.applications.image)
      formData.append('quarter_id', this.selectedQuarterId)

      this.$axios.post('applications/create', formData)
        .then((res) => {
          if (res) {
            this.$message.success(this.$t('succAppl'))
            this.$router.push('/' + this.$i18n.locale + '/applications')
          }
        })
        .catch((err) => {
          const errorMessage = err.response?.data?.message || this.$t('applicationSubmitError')
          this.$message.error(errorMessage)
        })
    },
  },
  
  async mounted() {
    try {
      const res = await this.$axios.get('regions')
      this.regions = res.data?.result || []
    } catch (err) {
      this.$message.error(err.response?.data?.message || this.$t('errorLoadingRegions'))
    }

    if (localStorage.getItem('user_id') && this.$store?.user) {
      this.user = { ...this.$store.user }
      this.user.birth_date = this.formatBirthDate(this.user.pin)
    }

    // Fetch quarters once on mount
    this.fetchQuarters()
  },
}
</script>

<style scoped>
.form__el-input {
  width: 100%;
  box-sizing: border-box;
}

.error-message {
  color: #ff4d4d;
  font-size: 12px;
  margin-top: 4px;
}

.helper-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.blue-filled-btn {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.blue-filled-btn:hover {
  background-color: #1565c0;
}

.blue-filled-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.new-apl-g3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.new-apl-block {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.test-quarter-warning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 6px;
  font-size: 13px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.go-test-link {
  color: #1976d2;
  font-weight: 600;
  text-decoration: underline;
}

.test-quarter-success {
  background: #d4edda;
  border: 1px solid #28a745;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 6px;
  font-size: 13px;
  color: #155724;
}

@media (max-width: 768px) {
  .new-apl-g3 {
    grid-template-columns: 1fr;
  }
}
</style>
