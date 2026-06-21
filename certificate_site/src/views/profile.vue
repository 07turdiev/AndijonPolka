<template>
    <div class="gids">
        <div class="gids-sg">
            <div class="wrapper">
                <div class="gids-sg-wrapper">
                    <img src="@/assets/images/image6.png" alt="">
                </div>
                <!-- <div class="gids-breadbrumbs">
                    <router-link :to="'/'+this.$i18n.locale+'/guides'">{{$t('listguide')}}</router-link>
                    <span><Icons icon="arrowRight" color="#7B8189" size="sm"/></span>
                    <router-link :to="'/'+this.$i18n.locale+'/guides/single?id='+$route.query.id">{{$store?.user?.first_name}} {{$store?.user?.sur_name}} {{$store?.user?.mid_name}}</router-link>
                </div> -->
                <div class="gids-sg-block">
                    <h3>{{ $store?.user?.first_name }} {{ $store?.user?.sur_name }} {{ $store?.user?.mid_name }}</h3>
                    <div class="gids-sg-uinfos">
                        <div class="gids-sg-upinfos">
                            <!-- Add profile image from first certificate -->
                            <div class="profile-image-container"
                                v-if="$store?.user?.certificates && $store?.user?.certificates.length > 0 && $store?.user?.certificates[0]?.badge_img">
                                <img class="profile-avatar"
                                    :src="'https://study.madaniyhayot.uz/api/cdn/' + $store?.user?.certificates[0]?.badge_img"
                                    alt="Profile Image" />
                            </div>



                            <div class="gids-sg-uinfo">
                                <div class="gids-sg-prinfos">
                                    <div class="gids-sg-prinfo">
                                        <span>{{ $t('firstName') }}:</span>
                                        <p>{{ $store?.user?.first_name }}</p>
                                    </div>
                                    <div class="gids-sg-prinfo">
                                        <span>{{ $t('secondName') }}:</span>
                                        <p>{{ $store?.user?.sur_name }}</p>
                                    </div>
                                    <div v-if="$store?.user?.mid_name" class="gids-sg-prinfo">
                                        <span>{{ $t('middleName') }}:</span>
                                        <p>{{ $store?.user?.mid_name }}</p>
                                    </div>
                                    <div v-if="$store?.user?.birth_date" class="gids-sg-prinfo">
                                        <span>{{ $t('birthDate') }}:</span>
                                        <p>{{ $store?.user?.birth_date }}</p>
                                    </div>
                                    <div v-if="$store?.user?.pin" class="gids-sg-prinfo">
                                        <span>{{ $t('pinfl') }}:</span>
                                        <p>{{ $store?.user?.pin }}</p>
                                    </div>
                                    <div v-if="$store?.user?.pport_num" class="gids-sg-prinfo">
                                        <span>{{ $t('passNum') }}:</span>
                                        <p>{{ $store?.user?.pport_num }}</p>
                                    </div>
                                </div>
                                <!-- QR Code Display -->
                            </div>

                        </div>
                        <div v-if="$store?.qrcode" class="profile-qrcode-container">
                            <img :src="qrcode" alt="QR Code" class="profile-qrcode-image" />
                        </div>
                    </div>
                    <div v-if="$store?.user?.phone_number || $store?.user?.email" class="gids-sg-uinfos ne">
                        <div class="gids-sg-cb">
                            <div v-if="$store?.user?.phone_number" class="gids-sg-ne">
                                <span>{{ $t('phone') }}:</span>
                                <a :href="'tel:' + $store?.user?.phone_number">{{ $store?.user?.phone_number }}</a>
                            </div>
                            <div v-if="$store?.user?.email" class="gids-sg-ne">
                                <span>{{ $t('mail') }}:</span>
                                <a :href="'mailto:' + $store?.user?.email">{{ $store?.user?.email }}</a>
                            </div>
                        </div>
                    </div>

                  <div class="test-results-section">
                        <h3 class="test-results-title">{{ $t('testResults') }}</h3>
                        <el-table v-if="groupedTestResults.length" :data="groupedTestResults" style="width: 100%">
                            <el-table-column prop="topic" :label="$t('topicResult')" />
                            <el-table-column :label="$t('attempts')">
                                <template #default="scope">
                                    {{ getAttemptLabel(scope.row.attemptNumber) }}
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('score')">
                                <template #default="scope">
                                    {{ scope.row.number_of_correct_answers }} / {{ scope.row.number_of_questions }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="createdAt" :label="$t('dateTime')">
                                <template #default="scope">
                                    {{ formatDateTime(scope.row.createdAt) }}
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-empty v-else :description="$t('noTestResult')" />
                    </div>
                    <!-- Certificates Section -->
                    <div v-if="$store?.user?.certificates && $store?.user?.certificates.length > 0">
                        <h3 class="certificates-title">{{ $t('certificates') }}</h3>

                        <el-card v-for="(certificate, index) in $store?.user?.certificates" :key="index"
                            class="certificate-card">
                            <div class="certificate-container">
                                <div class="certificate-header">
                                    <h4 class="certificate-number">
                                        {{ $t('certNumber') }}: {{ certificate.reg_num }}
                                    </h4>
                                    <div class="certificate-header-actions">
                                        <el-button type="primary" class="download-btn"
                                            @click="downloadCertificate(certificate.certificate_id, index)"
                                            :disabled="certificate.status !== 'active'"
                                            :loading="downloadLoading[index]">
                                            {{ $t('download') }}
                                        </el-button>
                                        <el-tag :type="getCertificateStatusType(certificate.status)" effect="dark"
                                            size="large">
                                            {{ $t(certificate.status) }}
                                        </el-tag>
                                    </div>
                                </div>

                                <div class="certificate-content">
                                    <div class="certificate-info">
                                        <div class="certificate-info-item">
                                            <span class="info-label">{{ $t('given_date') }}:</span>
                                            <span class="info-value">{{ formatDate(certificate.given_date) }}</span>
                                        </div>

                                        <div class="certificate-info-item">
                                            <span class="info-label">{{ $t('expireCert') }}:</span>
                                            <span class="info-value">{{ formatDate(certificate.expr_date) }}</span>
                                        </div>

                                        <div class="certificate-info-item">
                                            <span class="info-label">{{ $t('category') }}:</span>
                                            <span class="info-value">{{ certificate.category }}</span>
                                        </div>

                                        <div class="certificate-info-item">
                                            <span class="info-label">{{ $t('organization') }}:</span>
                                            <span class="info-value">{{ certificate.organization['name_' + $i18n.locale]
                                                }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </div>
                    <div v-else class="no-certificates">
                        <el-empty :description="$t('noCertificates')" />
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script>
import Icons from '@/components/icons.vue'
export default {
    data() {
        return {
            guide: null,
            qrcode: null,
            loading: false,
            preloading: false,
            mobile: false,
            downloadLoading: {},
            testResults: [],
            testResultsLoading: false,
            attemptMap: {},
            regions: [
                {
                    id: 1,
                    name: {
                        ru: 'Андижанская область',
                        en: 'Andijan region',
                        uz: 'Andijon viloyati',
                    }
                },
                {
                    id: 2,
                    name: {
                        ru: 'Бухарская область',
                        en: 'Bukhara region',
                        uz: 'Buxoro viloyati',
                    }
                },
                {
                    id: 3,
                    name: {
                        ru: 'Ферганская область',
                        en: 'Ferghana region',
                        uz: 'Farg\'ona viloyati',
                    }
                },
                {
                    id: 4,
                    name: {
                        ru: 'Джизакская область',
                        en: 'Jizzakh region',
                        uz: 'Jizzax viloyati',
                    }
                },
                {
                    id: 5,
                    name: {
                        ru: 'Наманганская область',
                        en: 'Namangan region',
                        uz: 'Namangan viloyati',
                    }
                },
                {
                    id: 6,
                    name: {
                        ru: 'Навоийская область',
                        en: 'Navoi region',
                        uz: 'Navoiy viloyati',
                    }
                },
                {
                    id: 7,
                    name: {
                        ru: 'Кашкадарьинская область',
                        en: 'Kashkadarya region',
                        uz: 'Qashqadaryo viloyati',
                    }
                },
                {
                    id: 8,
                    name: {
                        ru: 'Республика Каракалпакстан',
                        en: 'Republic of Karakalpakstan',
                        uz: 'Qoraqalpog\'iston Respublikasi',
                    }
                },
                {
                    id: 9,
                    name: {
                        ru: 'Самаркандская область',
                        en: 'Samarkand region',
                        uz: 'Samarqand viloyati',
                    }
                },
                {
                    id: 10,
                    name: {
                        ru: 'Сырдарьинская область',
                        en: 'Syrdarya region',
                        uz: 'Sirdaryo viloyati',
                    }
                },
                {
                    id: 11,
                    name: {
                        ru: 'Сурхандарьинская область',
                        en: 'Surkhandarya region',
                        uz: 'Surxondaryo viloyati',
                    }
                },
                {
                    id: 12,
                    name: {
                        ru: 'город Ташкент',
                        en: 'Tashkent city',
                        uz: 'Toshkent shahri',
                    }
                },
                {
                    id: 13,
                    name: {
                        ru: 'Ташкентская область',
                        en: 'Tashkent region',
                        uz: 'Toshkent viloyati',
                    }
                },
                {
                    id: 14,
                    name: {
                        ru: 'Хорезмская область',
                        en: 'Khorezm region',
                        uz: 'Xorazm viloyati',
                    }
                },
                {
                    id: 15,
                    name: {
                        ru: 'Горы Узбекистана',
                        en: 'Mountains of Uzbekistan',
                        uz: 'O\'zbekiston tog\'lari',
                    }
                },
            ],
        }
    },
    components: {
        Icons
    },
    computed: {
        groupedTestResults() {
            // Group by topic, keep only up to 3 attempts per topic, add attemptNumber and topic name
            const grouped = [];
            const topicMap = {};
            for (const row of this.testResults) {
                const topicId = row.test_topic_id;
                if (!topicMap[topicId]) {
                    topicMap[topicId] = [];
                }
                if (topicMap[topicId].length < 3) {
                    topicMap[topicId].push(row);
                }
            }
            // Flatten and add attemptNumber and topic name
            Object.values(topicMap).forEach(attemptsArr => {
                attemptsArr.forEach((row, idx) => {
                    grouped.push({
                        ...row,
                        attemptNumber: idx + 1,
                        topic: row.test_topic?.topic_name || row.test_topic?.name || row.test_topic_id
                    });
                });
            });
            return grouped;
        }
    },
    methods: {
        downloadCertificate(certificateId, index) {
            // Set loading state for this specific certificate
            this.downloadLoading = { ...this.downloadLoading, [index]: true };

            // Use Axios to request the file
            this.$axios({
                url: `/download/${certificateId}`,
                method: 'GET',
                responseType: 'blob', // Important for handling file downloads
            })
                .then(response => {
                    // Create a URL for the blob
                    const blob = new Blob([response.data]);
                    const url = window.URL.createObjectURL(blob);

                    // Create a link and trigger download
                    const link = document.createElement('a');
                    link.href = url;

                    // Get filename from Content-Disposition header if available
                    const contentDisposition = response.headers['content-disposition'];
                    let filename = 'certificate.pdf'; // Default filename

                    if (contentDisposition) {
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(contentDisposition);
                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/['"]/g, '');
                        }
                    }

                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();

                    // Clean up
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error('Download error:', error);
                    this.$message.error(this.$t('downloadError') || 'Failed to download certificate');
                })
                .finally(() => {
                    // Reset loading state
                    this.downloadLoading = { ...this.downloadLoading, [index]: false };
                });
        },
        b64toBlob(qr, sliceSize = 512) {
            const byteCharacters = atob(qr);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays);
            return blob;
        },
        dateFilter(e) {
            if (!!e) {
                let date = new Date(e)
                let newdate = ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear()
                return newdate
            } else {
                return '-'
            }
        },
        formatDate(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU'); // Formats as DD.MM.YYYY
        },
        getCertificateStatusType(status) {
            const statusMap = {
                'active': 'success',
                'expired': 'warning',
                'canceled': 'danger'
            }
            return statusMap[status] || 'info'
        },
        getAttemptLabel(num) {
            if (num === 1) return 'First Attempt';
            if (num === 2) return 'Second Attempt';
            if (num === 3) return 'Third Attempt';
            return `${num}th Attempt`;
        },
        formatDateTime(dateString) {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleString('ru-RU'); // Formats as DD.MM.YYYY, HH:MM:SS
        },
        async fetchTestResults() {
            this.testResultsLoading = true;
            const user_id = localStorage.getItem('user_id');
            if (!user_id) {
                this.testResults = [];
                this.testResultsLoading = false;
                return;
            }
            try {
                const res = await this.$axios.get('/test/results', { params: { user_id } });
                this.testResults = res.data.result || [];
            } catch (e) {
                this.testResults = [];
            }
            this.testResultsLoading = false;
        }
    },
    mounted() {
        this.langs = this.$store.langs
        const blob = this.b64toBlob(this.$store?.qrcode);
        const blobUrl = URL.createObjectURL(blob);
        this.qrcode = blobUrl
        if (window.innerWidth < 834) {
            this.mobile = true
        }
        this.fetchTestResults();
    }
}
</script>

<style scoped>
.certificates-title {
    margin-top: 30px;
    margin-bottom: 20px;
    font-size: 24px;
    color: #303133;
}

.certificate-card {
    margin-bottom: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.certificate-container {
    padding: 4px;
}

.certificate-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
}

.certificate-number {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
}

.certificate-content {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.certificate-image-container {
    flex: 0 0 180px;
}

.gids-avatar {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ebeef5;
}

.certificate-info {
    flex: 1;
    min-width: 300px;
}

.certificate-info-item {
    margin-bottom: 12px;
}

.info-label {
    font-size: 14px;
    color: #909399;
    display: inline-block;
    width: 250px;
}

.info-value {
    font-weight: 500;
    color: #303133;
}

.qrcode-container {
    flex: 0 0 150px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.qrcode-image {
    width: 150px;
    height: 150px;
}

.no-certificates {
    margin-top: 30px;
    text-align: center;
    padding: 40px 0;
}

@media (max-width: 991px) {
    .certificate-content {
        flex-direction: column;
    }

    .certificate-image-container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .qrcode-container {
        width: 100%;
        margin-top: 20px;
    }
}

.profile-image-container {
    margin-right: 20px;
    margin-bottom: 20px;
}

.profile-avatar {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.profile-qrcode-container {
    margin: 0 20px 20px 0;
}

.profile-qrcode-image {
    width: 150px;
    height: 150px;
    border: 1px solid #ebeef5;
}

.gids-sg-upinfos {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .gids-sg-upinfos {
        flex-direction: column;
        align-items: center;
    }

    .profile-image-container,
    .profile-qrcode-container {
        margin-right: 0;
    }
}

.certificate-header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.download-btn {
    display: flex;
    align-items: center;
    gap: 5px;
}

.test-results-section {
    margin-top: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    padding: 32px 24px;
}

.test-results-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 18px;
    color: #0d223a;
}
</style>