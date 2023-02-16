import Vue from "vue";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/en"; // lang i18n

import "@/styles/index.scss"; // global css

import App from "./App";
import store from "./store";
import router from "./router";

import "@/icons"; // icon
import "@/permission"; // permission control

import * as directives from "@/directives";

import Component from "@/components";
import * as filters from "@/filters";
import CheckPermission from "@/mixin/checkPermission";

import Print from "vue-print-nb";

// 全局注册自定义的工具组件
Vue.use(Component);

Vue.use(Print);

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// 遍历所有的导出的指令对象，完成自定义指令的全局注册
Object.keys(directives).forEach((key) => {
  Vue.directive(key, directives[key]);
});

// 注册全局的过滤器
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

// 全局混入检查对象，所有组件都会拥有了权限检查的方法
Vue.mixin(CheckPermission);

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
