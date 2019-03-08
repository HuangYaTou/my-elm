import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store/'
import FaskClick from 'fastclick'
import './config/rem'
import './style/swiper.min.css'

Vue.config.productionTip = false
if ('addEventListener' in document) {
  document.addEventListener('DOMContentLoaded', function () {
    FaskClick.attach(document.body);
  }, false);
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
