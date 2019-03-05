import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import App from '../App'
const home = r => require.ensure([], () => r(require('../page/home/home')), 'home');
const city = r => require.ensure([], () => r(require('../page/city/city')), 'city');
const login = r => require.ensure([], () => r(require('../page/login/login')), 'login');
const forget = r => require.ensure([], () => r(require('../page/forget/forget')), 'forget');



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
      }]
    }
  ]
})
