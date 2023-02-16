import Vue from "vue";
import Router from "vue-router";
import Layout from "@/layout";

import approvalsRouter from "./modules/approvals";
import departmentsRouter from "./modules/departments";
import employeesRouter from "./modules/employees";
import permissionRouter from "./modules/permission";
import attendancesRouter from "./modules/attendances";
import salarysRouter from "./modules/salarys";
import settingRouter from "./modules/setting";
import socialRouter from "./modules/social";

Vue.use(Router);

// 静态路由，没有权限控制的页面，任何人都可以访问
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "Dashboard", icon: "dashboard" },
      },
    ],
  },

  {
    path: "/import",
    component: Layout,
    // 隐藏在左侧菜单中
    hidden: true,
    children: [
      {
        // 二级路由path什么都不写表示为二级的默认路由
        path: "",
        component: () => import("@/views/import"),
      },
    ],
  },

  // 404 page must be placed at the end !!!
  // { path: "*", redirect: "/404", hidden: true },
];

export const asyncRoutes = [
  approvalsRouter,
  departmentsRouter,
  employeesRouter,
  permissionRouter,
  attendancesRouter,
  salarysRouter,
  settingRouter,
  socialRouter,
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }), // 管理滚动行为，如果出现滚动切换就让页面回到顶部
    // routes: constantRoutes,
    routes: [...constantRoutes],
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
