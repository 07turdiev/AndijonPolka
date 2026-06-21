<template>
  <div class="wrapper pth">
    <div class="applications">
      <div v-if="new_application">
        <el-card class="application-card">
          <template #header>
            <div class="card-header">
              <h3>{{ $t('activeAppl') }}</h3>
            </div>
          </template>
          <div class="empty-state">
            <el-empty :description="$t('noActiveAppl')" />
            <el-button type="primary" size="large" @click="addApp" class="mt-20">
              {{ $t('sendAppl') }}
            </el-button>
          </div>
        </el-card>
      </div>
      
      <div v-else>
        <el-card class="application-card">
          <template #header>
            <div class="card-header">
              <h3>{{ $t('activeAppl') }}</h3>
            </div>
          </template>
          
          <div v-for="(item, idx) in active_applications" :key="idx" class="application-item">
            <el-divider v-if="idx > 0" />
            
            <div class="application-header">
              <h3 class="application-number">
                #{{ item?.application_number }}
              </h3>
              <el-tag 
                :type="getStatusType(item.status)" 
                effect="dark" 
                size="large"
                class="status-tag"
              >
                {{ $t(item.status) }}
              </el-tag>
            </div>
            
            <div class="application-info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('typeAppl') }}</span>
                <span class="info-value">{{ $t(item?.application_type) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('appCreateDate') }}</span>
                <span class="info-value">{{ dateFilter(item?.createdAt) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('fullName') }}</span>
                <span class="info-value">
                  {{ item?.sur_name }} {{ item?.first_name }} {{ item?.middle_name }}
                </span>
              </div>
            </div>
            
            <div class="application-actions">
              <el-button 
                v-if="item.status === 'done'" 
                type="success" 
                @click="viewCertificate(item)"
                size="large"
              >
                {{ $t('viewCertificate') }}
              </el-button>
              
              <el-button 
                v-if="item.status === 'cancelled'" 
                type="primary" 
                @click="addApp"
                size="large"
              >
                {{ $t('sendNewAppl') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-if="completed_applications.length" class="mt-20">
        <el-card class="application-card">
          <template #header>
            <div class="card-header">
              <h3>{{ $t('completedApplications') }}</h3>
            </div>
          </template>
          
          <div v-for="(item, idx) in completed_applications" :key="idx" class="application-item">
            <el-divider v-if="idx > 0" />
            
            <div class="application-header">
              <h3 class="application-number">
                #{{ item?.application_number }}
              </h3>
              <el-tag 
                type="success" 
                effect="dark" 
                size="large"
                class="status-tag"
              >
                {{ $t(item.status) }}
              </el-tag>
            </div>
            
            <div class="application-info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('typeAppl') }}</span>
                <span class="info-value">{{ $t(item?.application_type) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('appCreateDate') }}</span>
                <span class="info-value">{{ dateFilter(item?.createdAt) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('fullName') }}</span>
                <span class="info-value">
                  {{ item?.sur_name }} {{ item?.first_name }} {{ item?.middle_name }}
                </span>
              </div>
            </div>
            
            <div class="application-actions">
              <el-button 
                v-if="item.status === 'done' && item?.certificate_doc?.path" 
                type="success" 
                @click="downloadCertificate(item)"
                size="large"
              >
                {{ $t('downloadCertificate') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
      
      <div v-if="cancelled_applications.length" class="mt-20">
        <el-card class="application-card">
          <template #header>
            <div class="card-header">
              <h3>{{ $t('cancelledApplications') }}</h3>
            </div>
          </template>
          
          <div v-for="(item, idx) in cancelled_applications" :key="idx" class="application-item">
            <el-divider v-if="idx > 0" />
            
            <div class="application-header">
              <h3 class="application-number">
                #{{ item?.application_number }}
              </h3>
              <el-tag 
                type="danger" 
                effect="dark" 
                size="large"
                class="status-tag"
              >
                {{ $t(item.status) }}
              </el-tag>
            </div>
            
            <div class="application-info-grid">
              <div class="info-item">
                <span class="info-label">{{ $t('typeAppl') }}</span>
                <span class="info-value">{{ $t(item?.application_type) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('appCreateDate') }}</span>
                <span class="info-value">{{ dateFilter(item?.createdAt) }}</span>
              </div>
              
              <div class="info-item">
                <span class="info-label">{{ $t('fullName') }}</span>
                <span class="info-value">
                  {{ item?.sur_name }} {{ item?.first_name }} {{ item?.middle_name }}
                </span>
              </div>
            </div>
            
            <div v-if="item.cancel_comment" class="cancel-comment">
              <el-alert
                :title="$t('cancelReason')"
                :description="item.cancel_comment"
                type="error"
                show-icon
                :closable="false"
              />
            </div>

            <div class="application-actions">
              <el-button
                type="primary"
                @click="addApp"
                size="large"
              >
                {{ $t('sendNewAppl') }}
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import Icons from '@/components/icons.vue'

export default {
  data() {
    return {
      applications: null,
      active_applications: [],
      completed_applications: [],
      cancelled_applications: [],
      new_application: true,
    }
  },
  
  components: {
    Icons,
  },
  
  methods: {
    async addApp() {
      if (localStorage.getItem('user_id')) {
        this.$router.push('/' + this.$i18n.locale + '/applications/add')
      } else {
        this.$router.push('/' + this.$i18n.locale + '/applications/add')
        await window.open(
          'https://sso.egov.uz/sso/oauth/Authorization.do?response_type=one_code&client_id=for_testing&redirect_uri=https://study.madaniyhayot.uz/uz/applications&scope=for_testing&state=IDPW',
          '_self'
        )
      }
    },
    
    timeFilter(e) {
      if (!!e) {
        let date = new Date(e)
        let newtime =
          ('0' + date.getHours()).slice(-2) +
          ':' +
          ('0' + date.getMinutes()).slice(-2)
        return newtime
      } else {
        return '-'
      }
    },
    
    dateFilter(e) {
      if (!!e) {
        let date = new Date(e)
        let newdate =
          ('0' + date.getDate()).slice(-2) +
          '.' +
          ('0' + (date.getMonth() + 1)).slice(-2) +
          '.' +
          date.getFullYear()
        return newdate
      } else {
        return '-'
      }
    },
    
    getStatusType(status) {
      const statusMap = {
        'new': 'info',
        'accepted': 'success',
        'done': 'success',
        'cancelled': 'danger'
      }
      return statusMap[status] || 'info'
    },
    
    viewCertificate(item) {
      // Redirect to user profile to view certificate
      this.$router.push('/' + this.$i18n.locale + '/profile/certificates')
    },
    
    downloadCertificate(item) {
      if (item?.certificate_doc?.path) {
        window.open('http://test.gidlar.uz/api/cdn/' + item.certificate_doc.path, '_blank')
      } else {
        this.$message.error(this.$t('certificateNotAvailable'))
      }
    }
  },
  
  async mounted() {
    const user_id = localStorage.getItem('user_id')
    if (user_id) {
      try {
        const response = await this.$axios.get('applications', {
          params: { user_id: user_id }
        })
        
        if (response && response.data) {
          this.applications = response.data.result.applications
          
          if (this.applications && this.applications.length > 0) {
            this.new_application = false
            
            this.applications.forEach(app => {
              if (app.status === 'new' || app.status === 'accepted') {
                this.active_applications.push(app)
              } else if (app.status === 'done') {
                this.completed_applications.push(app)
              } else if (app.status === 'cancelled') {
                this.cancelled_applications.push(app)
              }
            })
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        this.$message.error(this.$t('errorLoadingApplications'))
      }
    } else {
      console.error('user_id is not found in localStorage')
    }
  },
}
</script>

<style scoped>
.application-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.application-item {
  padding: 16px 0;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.application-number {
  font-size: 18px;
  margin: 0;
}

.status-tag {
  font-weight: 500;
}

.application-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-weight: 500;
}

.application-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.mt-20 {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .application-info-grid {
    grid-template-columns: 1fr;
  }
  
  .application-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .status-tag {
    margin-top: 8px;
  }
}
</style>
