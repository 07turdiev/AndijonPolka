<template>
    <footer>
        <div class="wrapper">
            <div class="footer">
                <div class="footer-blocks">
                <div class="footer-block flogo">
                                  <img src="@/assets/logo_2.svg" alt="" class="logo-img" />

                        <p>{{$t('moct')}}</p>
                </div>
                <div class="footer-block-ct">
                    <div class="footer-block">
                            <h3>{{$t('contact')}}:</h3>
                            <div class="footer-links">
                                <a href="mailto:info@madaniyhayot.uz" class="footer-link">
                                    <span><Icons icon="mail" color="#7B8189" size="middle"/></span>
                                    <p>info@madaniyhayot.uz</p>
                                </a>
                                <a href="tel:+998 95 835 55 05" class="footer-link">
                                    <span><Icons icon="phone" color="#7B8189" size="middle"/></span>
                                    <p>+998 95 835 55 05</p>
                                </a>
                                <div class="footer-link">
                                    <span><Icons icon="location" color="#7B8189" size="middle"/></span>
                                    <p>{{$t('location')}}</p>
                                </div>
                            </div>
                    </div>
                    <div class="footer-block">
                            <h3>{{$t('usefulLink')}}</h3>
                            <div class="footer-links">
                                <a href="https://gov.uz/oz/madaniyat" class="footer-link" target="_blank">
                                    <span><Icons icon="arrRight" color="#7B8189" size="middle"/></span>
                                    <p>gov.uz/oz/madaniyat</p>
                                </a>
                                <a href="https://madaniyat.uz" class="footer-link" target="_blank">
                                    <span><Icons icon="arrRight" color="#7B8189" size="middle"/>
                                    </span>
                                    <p>madaniyat.uz</p>
                                </a>
                                <a href="https://id.egov.uz" class="footer-link" target="_blank">
                                    <span><Icons icon="arrRight" color="#7B8189" size="middle"/></span>
                                    <p>id.egov.uz</p>
                                </a>
                            </div>
                    </div>
                </div>
                </div>
                <div class="hr"></div>
                <div class="footer-cf">
                    <p>study.madaniyhayot.uz <span>&copy;</span> 2024</p>
                    <p>{{$t('copy')}}</p>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
import Icons from '@/components/icons.vue'
export default {
  components: {
    Icons
  },

}
</script>

<style>
.logo-img {
  width: 150px ;
  height: auto !important;
}
</style>