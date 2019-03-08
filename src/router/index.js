import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import App from '../App'
const home = r => require.ensure([], () => r(require('../page/home/home')), 'home');
const city = r => require.ensure([], () => r(require('../page/city/city')), 'city');
const login = r => require.ensure([], () => r(require('../page/login/login')), 'login');
const forget = r => require.ensure([], () => r(require('../page/forget/forget')), 'forget');
const msite = r=>require.ensure([],()=>r(require('../page/msite/msite')),'msite');



Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: App,
      children: [{
        path: '',
        redirect: '/home',
      }, {
        path: '/home',
        component: home
      }, {
        path: '/city/:cityId',
        component: city
      }, {
        path: '/login',
        component: login
      }, {
        path: '/forget',
        component: forget
      }, {
        path: '/msite',
        component: msite,
        meta: {keepAlive: true}
      }]
    }
  ],
  mode: 'hash',
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    else {
      if (from.meta.keepAlive) {
        from.meta.savedPosition = document.body.scrollTop;
      }
      return { x: 0, y: to.meta.savedPosition || 0 };
    }
  }
})
