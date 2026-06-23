<template>
  <div class="participants">
    <h1 class="page-title">Ishtirokchilar</h1>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Jami ro‘yxatdan o‘tganlar</div>
        <div class="stat-value">{{ stats.total.toLocaleString('ru-RU') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bugun</div>
        <div class="stat-value">{{ stats.today.toLocaleString('ru-RU') }}</div>
      </div>
      <div class="stat-card goal">
        <div class="stat-label">Maqsad</div>
        <div class="stat-value">20 000</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-field search">
        <label>Qidirish</label>
        <InputText v-model="filters.searchWord" placeholder="F.I.SH., JSHSHIR yoki telefon" @keyup.enter="applyFilters" />
      </div>
      <div class="filter-field">
        <label>Viloyat</label>
        <Dropdown v-model="filters.region_id" :options="regions" optionLabel="name_uz" optionValue="region_id"
          placeholder="Barchasi" showClear filter @change="onRegionChange" />
      </div>
      <div class="filter-field">
        <label>Tuman</label>
        <Dropdown v-model="filters.district_id" :options="districts" optionLabel="name_uz" optionValue="district_id"
          placeholder="Barchasi" showClear filter :disabled="!filters.region_id" />
      </div>
      <div class="filter-field date">
        <label>Sana (dan)</label>
        <Calendar v-model="filters.start_date" dateFormat="dd.mm.yy" placeholder="kk.oo.yy" showIcon />
      </div>
      <div class="filter-field date">
        <label>Sana (gacha)</label>
        <Calendar v-model="filters.end_date" dateFormat="dd.mm.yy" placeholder="kk.oo.yy" showIcon />
      </div>
      <div class="filter-field">
        <label>Yosh</label>
        <Dropdown v-model="agePreset" :options="agePresets" optionLabel="label" optionValue="value"
          placeholder="Barchasi" @change="onAgePresetChange" />
      </div>
      <div class="filter-field age">
        <label>Yosh (dan)</label>
        <InputNumber v-model="filters.min_age" :min="0" :max="120" :useGrouping="false" placeholder="0"
          @input="onAgeManual" @keyup.enter="applyFilters" />
      </div>
      <div class="filter-field age">
        <label>Yosh (gacha)</label>
        <InputNumber v-model="filters.max_age" :min="0" :max="120" :useGrouping="false" placeholder="120"
          @input="onAgeManual" @keyup.enter="applyFilters" />
      </div>
      <div class="filter-actions">
        <Button label="Filtr" icon="pi pi-search" @click="applyFilters" />
        <Button label="Tozalash" icon="pi pi-times" class="p-button-secondary" @click="resetFilters" />
        <Button label="Excel" icon="pi pi-download" class="p-button-success" :loading="exporting" @click="onExport" />
      </div>
    </div>

    <!-- Table -->
    <DataTable :value="rows" :loading="loading" lazy paginator :rows="limit" :totalRecords="totalRecords"
      :first="first" @page="onPage" dataKey="participant_id" stripedRows responsiveLayout="scroll" class="table">
      <Column header="№" :style="{ width: '60px' }">
        <template #body="slot">{{ first + slot.index + 1 }}</template>
      </Column>
      <Column header="Foto" :style="{ width: '70px' }">
        <template #body="slot">
          <img v-if="slot.data.photo" :src="photoUrl(slot.data.photo)" class="thumb" alt="" />
          <div v-else class="thumb empty"><i class="pi pi-user"></i></div>
        </template>
      </Column>
      <Column header="F.I.SH.">
        <template #body="slot">
          {{ [slot.data.last_name, slot.data.first_name, slot.data.middle_name].filter(Boolean).join(' ') }}
        </template>
      </Column>
      <Column field="pinfl" header="JSHSHIR" />
      <Column field="birth_date" header="Tug‘ilgan sana" />
      <Column header="Yosh" :style="{ width: '70px' }">
        <template #body="slot">{{ ageOf(slot.data.birth_date) }}</template>
      </Column>
      <Column header="Jinsi" :style="{ width: '80px' }">
        <template #body="slot">{{ slot.data.gender === 'M' ? 'Erkak' : (slot.data.gender === 'F' ? 'Ayol' : '') }}</template>
      </Column>
      <Column header="Viloyat">
        <template #body="slot">{{ slot.data.region ? slot.data.region.name_uz : '' }}</template>
      </Column>
      <Column header="Tuman">
        <template #body="slot">{{ slot.data.district ? slot.data.district.name_uz : '' }}</template>
      </Column>
      <Column field="phone_number" header="Telefon" />
      <Column header="Vaqt" :style="{ width: '150px' }">
        <template #body="slot">{{ formatDate(slot.data.createdAt) }}</template>
      </Column>
      <Column header="" :style="{ width: '60px' }">
        <template #body="slot">
          <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" @click="confirmDelete(slot.data)" />
        </template>
      </Column>
      <template #empty>
        <div class="empty-state">Ishtirokchilar topilmadi</div>
      </template>
    </DataTable>

    <!-- Delete confirm -->
    <Dialog v-model:visible="deleteDialog" header="O‘chirishni tasdiqlang" :modal="true" :style="{ width: '420px' }">
      <p v-if="toDelete">
        <b>{{ [toDelete.last_name, toDelete.first_name].filter(Boolean).join(' ') }}</b> ni ro‘yxatdan o‘chirasizmi?
      </p>
      <template #footer>
        <Button label="Bekor qilish" class="p-button-text" @click="deleteDialog = false" />
        <Button label="O‘chirish" class="p-button-danger" :loading="deleting" @click="doDelete" />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script>
import { useToast } from 'primevue/usetoast'

export default {
  name: 'Participants',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      rows: [],
      totalRecords: 0,
      loading: false,
      first: 0,
      limit: 20,
      filters: { searchWord: '', region_id: null, district_id: null, start_date: null, end_date: null, min_age: null, max_age: null },
      agePreset: null,
      agePresets: [
        { label: 'Barchasi', value: null },
        { label: '18 yoshgacha', value: 'minor' },
        { label: '18 va undan katta', value: 'adult' },
        { label: 'Maxsus oraliq', value: 'custom' }
      ],
      districts: [],
      exporting: false,
      deleteDialog: false,
      toDelete: null,
      deleting: false
    }
  },
  computed: {
    regions() { return this.$store.state.regions },
    stats() { return this.$store.state.stats }
  },
  methods: {
    photoUrl(p) { return `${this.$store.getters.cdnBase}/${p}` },
    fmtDateParam(d) {
      if (!d) return null
      const dt = (d instanceof Date) ? d : new Date(d)
      if (isNaN(dt)) return null
      const y = dt.getFullYear()
      const m = String(dt.getMonth() + 1).padStart(2, '0')
      const day = String(dt.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    formatDate(s) {
      if (!s) return ''
      const d = new Date(s)
      if (isNaN(d)) return ''
      return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    queryOptions(extra = {}) {
      return {
        searchWord: this.filters.searchWord || undefined,
        region_id: this.filters.region_id || undefined,
        district_id: this.filters.district_id || undefined,
        start_date: this.fmtDateParam(this.filters.start_date) || undefined,
        end_date: this.fmtDateParam(this.filters.end_date) || undefined,
        min_age: (this.filters.min_age !== null && this.filters.min_age !== '') ? this.filters.min_age : undefined,
        max_age: (this.filters.max_age !== null && this.filters.max_age !== '') ? this.filters.max_age : undefined,
        ...extra
      }
    },
    // "YYYY-MM-DD" dan to'liq yosh
    ageOf(s) {
      if (!s) return ''
      const d = new Date(s)
      if (isNaN(d)) return ''
      const now = new Date()
      let a = now.getFullYear() - d.getFullYear()
      const m = now.getMonth() - d.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--
      return a >= 0 ? a : ''
    },
    // Tezkor yosh presetlari -> min/max ni to'ldiradi
    onAgePresetChange() {
      const p = this.agePreset
      if (p === 'minor') { this.filters.min_age = null; this.filters.max_age = 17 }
      else if (p === 'adult') { this.filters.min_age = 18; this.filters.max_age = null }
      else if (p === null) { this.filters.min_age = null; this.filters.max_age = null }
      // 'custom' -> mavjud min/max qoladi
      this.applyFilters()
    },
    // Min/max qo'lda o'zgartirilsa preset "Maxsus"ga o'tadi
    onAgeManual() {
      this.agePreset = 'custom'
    },
    async loadData() {
      this.loading = true
      const res = await this.$store.dispatch('fetchParticipants', this.queryOptions({ offset: this.first, limit: this.limit }))
      this.rows = res.data
      this.totalRecords = res.totalRecords
      this.loading = false
    },
    onPage(e) {
      this.first = e.first
      this.limit = e.rows
      this.loadData()
    },
    applyFilters() {
      this.first = 0
      this.loadData()
      this.$store.dispatch('fetchStats')
    },
    resetFilters() {
      this.filters = { searchWord: '', region_id: null, district_id: null, start_date: null, end_date: null, min_age: null, max_age: null }
      this.agePreset = null
      this.districts = []
      this.first = 0
      this.loadData()
    },
    async onRegionChange() {
      this.filters.district_id = null
      this.districts = []
      if (this.filters.region_id) {
        this.districts = await this.$store.dispatch('fetchDistricts', this.filters.region_id)
      }
    },
    async onExport() {
      this.exporting = true
      const ok = await this.$store.dispatch('exportParticipants', this.queryOptions())
      this.exporting = false
      if (!ok) this.toast.add({ severity: 'error', summary: 'Xatolik', detail: 'Eksport qilinmadi', life: 3000 })
    },
    confirmDelete(row) {
      this.toDelete = row
      this.deleteDialog = true
    },
    async doDelete() {
      if (!this.toDelete) return
      this.deleting = true
      const res = await this.$store.dispatch('deleteParticipant', this.toDelete.participant_id)
      this.deleting = false
      this.deleteDialog = false
      if (res.success) {
        this.toast.add({ severity: 'success', summary: 'O‘chirildi', life: 2000 })
        this.loadData()
        this.$store.dispatch('fetchStats')
      } else {
        this.toast.add({ severity: 'error', summary: 'Xatolik', detail: 'O‘chirilmadi', life: 3000 })
      }
    }
  },
  mounted() {
    this.$store.dispatch('fetchRegions')
    this.$store.dispatch('fetchStats')
    this.loadData()
  }
}
</script>

<style scoped>
.page-title { margin: 0 0 1.25rem; font-size: 1.5rem; color: #1e293b; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
.stat-card { background: #fff; border-radius: 12px; padding: 1.1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.stat-card.goal { background: #1d4ed8; color: #fff; }
.stat-label { font-size: .85rem; color: #64748b; }
.stat-card.goal .stat-label { color: #c7d2fe; }
.stat-value { font-size: 1.8rem; font-weight: 700; margin-top: 4px; }
.filters {
  background: #fff; border-radius: 12px; padding: 16px 18px; margin-bottom: 1.25rem;
  display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .08);
}
.filter-field { display: flex; flex-direction: column; gap: 6px; }
.filter-field label { font-size: 12px; font-weight: 600; color: #64748b; }
.filter-field.search { flex: 1 1 260px; min-width: 220px; }
.filter-field:not(.search):not(.date) { flex: 0 1 190px; min-width: 160px; }
.filter-field.date { flex: 0 1 170px; min-width: 150px; }
.filter-field.age { flex: 0 1 110px; min-width: 90px; }
/* Make all controls fill their field */
.filter-field :deep(.p-inputtext),
.filter-field :deep(.p-dropdown),
.filter-field :deep(.p-inputnumber),
.filter-field :deep(.p-calendar) { width: 100%; }
.filter-actions { display: flex; gap: 8px; align-items: flex-end; margin-left: auto; }
.filter-actions .p-button { white-space: nowrap; }
@media (max-width: 600px) {
  .filter-actions { margin-left: 0; width: 100%; }
  .filter-actions .p-button { flex: 1; }
}
.table { background: #fff; border-radius: 12px; overflow: hidden; }
.thumb { width: 40px; height: 50px; object-fit: cover; border-radius: 4px; }
.thumb.empty { display: flex; align-items: center; justify-content: center; background: #e5e7eb; color: #9ca3af; }
.empty-state { text-align: center; padding: 2rem; color: #94a3b8; }
@media (max-width: 767px) {
  .stats { grid-template-columns: 1fr; }
  .export-btn { margin-left: 0; }
}
</style>
