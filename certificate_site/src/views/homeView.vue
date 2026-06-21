<template>
  <div class="home-wrap">
    <div class="hero">
      <div class="hero-text">
        <h1>Andijon Polkasi</h1>
        <p class="lead">{{ $t('h_lead') }}</p>
        <div class="blocks">
          <div class="block">
            <p class="b-title">{{ $t('h_q1Title') }}</p>
            <span>{{ $t('h_q1Text') }}</span>
          </div>
          <div class="block">
            <p class="b-title">{{ $t('h_q2Title') }}</p>
            <span>{{ $t('h_q2Text') }}</span>
          </div>
        </div>
        <button class="join" @click="$router.push('/' + this.$i18n.locale + '/azo-bolish')">
          {{ $t('join') }}
        </button>
      </div>

      <div class="counter-card">
        <img src="@/assets/images/research2.jpg" alt="" />
        <div class="counter-body">
          <span>{{ $t('h_counter') }}</span>
          <p class="num">{{ num }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { inter: null, num: '0' }
  },
  methods: {
    animateCount(target) {
      let n = 0
      const step = Math.max(1, Math.ceil(target / 110))
      this.inter = setInterval(() => {
        n = n + step
        if (n >= target) { n = target; clearInterval(this.inter) }
        this.num = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      }, 20)
    }
  },
  async mounted() {
    try {
      const res = await this.$axios.get('/count')
      const total = (res && res.data && res.data.result && res.data.result.count) || 0
      this.animateCount(total)
    } catch (e) {
      this.num = '0'
    }
  },
  beforeUnmount() {
    if (this.inter) clearInterval(this.inter)
  }
}
</script>

<style scoped>
/* Match the site's main width (same as footer/.wrapper) on desktop, full-width on phones */
.home-wrap { width: 1420px; max-width: 100%; margin: 0 auto; padding: 40px 0 60px; box-sizing: border-box; }
@media (max-width: 1439px) and (min-width: 1200px) { .home-wrap { width: 1180px; } }
@media (max-width: 1199px) and (min-width: 834px) { .home-wrap { width: 754px; } }
@media (max-width: 833px) { .home-wrap { width: 100%; padding-left: 16px; padding-right: 16px; } }
.hero { display: flex; gap: 32px; align-items: stretch; }
.hero-text { flex: 1; min-width: 0; }
.hero-text h1 { font-size: 34px; margin: 0 0 12px; color: #1e293b; }
.lead { font-size: 17px; color: #475569; margin: 0 0 24px; line-height: 1.5; }
.blocks { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
.block { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 4px 16px rgba(30, 58, 138, .06); }
.b-title { font-weight: 700; color: #1e293b; margin: 0 0 8px; }
.block span { color: #64748b; font-size: 14px; line-height: 1.5; }
.join {
  background: #1d4ed8; color: #fff; border: 0; border-radius: 10px;
  padding: 14px 36px; font-size: 16px; font-weight: 600; cursor: pointer;
  transition: background .2s;
}
.join:hover { background: #1e3a8a; }

.counter-card {
  flex: 0 0 320px; background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 30px rgba(30, 58, 138, .10); display: flex; flex-direction: column;
}
.counter-card img { width: 100%; height: 200px; object-fit: cover; }
.counter-body { padding: 22px; text-align: center; }
.counter-body span { color: #64748b; font-size: 14px; }
.counter-body .num { font-size: 40px; font-weight: 800; color: #1d4ed8; margin: 8px 0 0; }

@media (max-width: 860px) {
  .hero { flex-direction: column; }
  .counter-card { flex: 1 1 auto; }
}
@media (max-width: 560px) {
  .home-wrap { padding: 24px 16px 48px; }
  .hero-text h1 { font-size: 27px; }
  .lead { font-size: 15px; }
  .blocks { grid-template-columns: 1fr; }
  .join { width: 100%; }
  .counter-card img { height: 160px; }
  .counter-body .num { font-size: 34px; }
}
</style>
