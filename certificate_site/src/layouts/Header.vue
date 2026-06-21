<template>
  <header>
    <div class="wrapper" :class="'page_' + $route.name">
      <div class="header-block">
        <div @click="$router.push('/' + this.$i18n.locale)" class="logo">
          <img src="@/assets/logo_2.svg" alt="" class="logo-img" />
        </div>

        <div class="header-act">
          <router-link
            :to="'/' + this.$i18n.locale + '/azo-bolish'"
            class="join-btn"
          >{{ $t('join') }}</router-link>

          <div
            @mouseenter="changeLang"
            @mouseleave="changeLang"
            class="header-langs"
          >
            <Icons :icon="activeLang.val" size="custom" width="24" height="16" />
            <p>{{ activeLang.name }}</p>
            <div v-if="open" class="langs-block">
              <div class="langs-item" v-for="(el, index) in langs" :key="index">
                <span class="tick"
                  ><Icons
                    v-show="el.val == activeLang.val"
                    icon="tick"
                    size="custom"
                    width="20"
                    height="20" /></span
                ><span
                  @click="switchLang(el)"
                  :class="{ active: el.val == activeLang.val }"
                  ><Icons
                    :icon="el.val"
                    size="custom"
                    width="24"
                    height="16"
                  />{{ el.name }}</span
                >
              </div>
            </div>
          </div>
          <button class="nav_btn" @click="openMenu">
            <Icons icon="burgerMenu" size="custom" width="20" height="20" />
          </button>
          <div class="header-so" @click="spAb = !spAb">
            <Icons icon="eye" color="#7B8189" size="middle" />
          </div>
        </div>
      </div>
      <div
        class="header-elem-mobile"
        :class="{ menu_mobile: menu, closed: close }"
      >
        <div class="nav_block">
          <div class="nav_menu">
            <h5>{{ $t('menu') }}</h5>
            <Icons
              @click=";(menu = false), (close = true)"
              icon="searchClose"
              color="#7B8189"
              size="middle"
            />
          </div>
          <div class="nav-items">
            <h6>{{ $t('lang') }}</h6>
            <div class="nav-item">
              <div
                :class="{ active: el.val == activeLang.val }"
                class="nav-lang"
                v-for="(el, index) in langs"
                :key="index"
                @click="switchLang(el)"
              >
                <Icons :icon="el.val" size="custom" width="24" height="16" />{{
                  el.name
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <specialAbility
        @changeColorScheme="onChangeColorScheme"
        @changeFontSize="onChangeFontSize"
        @closeMe="spAb = false"
        v-if="spAb" />
    </div>
  </header>
</template>
<script>
import Icons from '@/components/icons.vue'
import specialAbility from '@/components/specialAbility.vue'
export default {
  data() {
    return {
      menu: false,
      spAb: false,
      open: false,
      close: true,
      colorScheme: 'default',
      fontSize: 'default',
      activeLang: { name: "O'z", val: 'uz' },
      langs: [
        { name: "O'z", val: 'uz' },
        { name: 'Ру', val: 'ru' },
        { name: 'En', val: 'en' },
      ],
    }
  },
  components: {
    Icons,
    specialAbility,
  },
  methods: {
    switchLang(el) {
      this.activeLang = el
      this.$i18n.locale = el.val
      let newRoute = window.location.pathname.split('/')
      newRoute[1] = el.val
      this.$router
        .push(newRoute.join('/') + window.location.search)
        .then(() => {
          this.$router.go()
        })
    },
    changeLang() {
      this.open = !this.open
    },
    openMenu() {
      this.close = false
      this.menu = !this.menu
    },
    // --- Accessibility (Maxsus imkoniyatlar) ---
    applyAccessibility() {
      document.getElementsByTagName('html')[0].className =
        this.colorScheme + ' ' + this.fontSize
    },
    onChangeColorScheme(type) {
      this.colorScheme = type
      this.applyAccessibility()
    },
    onChangeFontSize(type) {
      this.fontSize = type
      this.applyAccessibility()
    },
  },
  mounted() {
    this.langs.forEach((el) => {
      el.val == this.$i18n.locale ? (this.activeLang = el) : ''
    })
    // Restore saved accessibility settings
    if (window.sessionStorage.colorScheme) this.colorScheme = window.sessionStorage.colorScheme
    if (window.sessionStorage.fontSize) this.fontSize = window.sessionStorage.fontSize
    this.applyAccessibility()
  },
}
</script>

<style>
.logo-img {
  width: 150px;
  height: auto;
}
.join-btn {
  display: inline-flex;
  align-items: center;
  background: #1d4ed8;
  color: #fff !important;
  text-decoration: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  transition: background .2s;
}
.join-btn:hover {
  background: #1e3a8a;
}
@media (max-width: 600px) {
  .logo-img { width: 110px; }
  .header-act { gap: 14px !important; }
  .join-btn { padding: 8px 14px; font-size: 14px; }
}
</style>
