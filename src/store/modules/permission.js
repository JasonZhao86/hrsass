// 静态路由
import { constantRoutes, asyncRoutes } from "@/router";

const state = {
  // 所有人默认拥有静态路由
  routes: constantRoutes,
};

const mutations = {
  // newRoutes可以认为是用户登录通过权限所得到的动态路由的部分
  setRoute(state, newRoutes) {
    /* 
      这种写法不对，不是语法不对，是业务不对，有一种情况：张三登录获取了动态路由，
      追加到路由上，李四登录直接继承了张三的4个动态路由
    */
    // state.routes = [...state.routes, ...newRoutes]
    state.routes = [...constantRoutes, ...newRoutes];
  },
};

const actions = {
  // 筛选权限路由，第二个参数menus为当前用户的所拥有的菜单权限：["settings","permissions"]
  filterRoutes(context, menus) {
    const routes = [];
    // 筛选出动态路由中和menus中能够对上的路由，该部分路由为用户有权限访问的动态路由
    menus.forEach((key) => {
      // key就是标识，item为路由对象
      routes.push(...asyncRoutes.filter((item) => item.name === key));
    });
    // 得到的routes是所有模块中满足权限要求的路由数组，即当前用户所拥有的动态路由权限
    context.commit("setRoute", routes);
    // 这里为什么还要return，state数据是用来显示左侧菜单用的，return是给路由addRoutes用的
    return routes;
  },
};

const getters = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
