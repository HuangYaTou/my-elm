import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import App from '../App'
const home = r => require.ensure([], () => r(require('../page/home/home')), 'home');

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
      }]
    }
  ]
})
