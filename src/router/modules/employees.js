import Layout from "@/layout";

export default {
  path: "/employees",
  name: "employees",
  // 每个子模块都是一级路由layout组件中router-view里面的二级路由（子组件）
  component: Layout,
  children: [
    {
      // 二级路由的path什么都不写时，表示该路由为当前二级路由的默认路由
      path: "",
      // 动态导入
      component: () => import("@/views/employees"),
      /* 
      路由元信息其实就是存储数据的对象，我们可以在这里放置一些信息。
      meta的属性可以随意定义，但是title属性是固定的，因为框架的左侧导航
      会读取我们的路由里的meta里面的title作为显示菜单名称
    */
      meta: {
        title: "员工管理",
        icon: "people",
      },
    },
    {
      // query动态路由传参
      path: "detail/:id",
      component: () => import("@/views/employees/detail"),
      // 不在左侧菜单显示
      hidden: true,
      meta: {
        // 标记当前路由规则的中文名称，后续在做左侧菜单时使用
        title: "员工详情",
      },
    },
    {
      path: "print/:id",
      // 按需加载
      component: () => import("@/views/employees/print"),
      hidden: true,
      meta: {
        // 标记当前路由规则的中文名称 后续在做左侧菜单时 使用
        title: "打印",
        icon: "people",
      },
    },
  ],
};
