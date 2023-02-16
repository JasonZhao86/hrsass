import router from "@/router";
import { Message } from "element-ui";
import { getToken } from "@/utils/auth";
import store from "@/store";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const whiteList = ["/login", "/404"];

// 路由的前置守卫
router.beforeEach(async (to, from, next) => {
  // 开启进度条
  NProgress.start();
  const hasToken = getToken();
  if (hasToken) {
    if (to.path === "/login") {
      // 跳到主页，本次路由调转结束，进度条关闭，调转到/主页的新进度条在下次路由守卫时开启。
      next("/");
      NProgress.done();
    } else {
      // next();
      if (store.getters.userId) {
        // 直接放行，继续后面正常的路由调转，本次路由并未结束，所以不能关闭进度条
        next();
      } else {
        try {
          // 往vuex中注入用户信息，await：因为我们想获取完资料后才放行路由
          const { roles } = await store.dispatch("user/getUserInfo");
          const routes = await store.dispatch(
            "permission/filterRoutes",
            roles.menus
          );
          /* 
            routes就是筛选得到的动态路由，将动态路由添加到路由表中，默认的路由表
            只有静态路由没有动态路由，addRoutes必须用next(地址)、不能用next()
          */
          router.addRoutes([
            ...routes,
            { path: "*", redirect: "/404", hidden: true },
          ]); // 添加动态路由到路由表，铺路
          /* 
            添加完动态路由之后，必须跳到对应的地址，相当于多做一次跳转，为什么要多做
            一次跳转？进门了，但是进门之后我要去的地方的路还没有铺好，直接走，掉坑里，
            多做一次跳转，再从门外往里进一次，跳转之前把路铺好，再次进来的时候，路就
            铺好了（因为此时vuex中已经有userId了，不会进入该分支，直接方向）
          */
          next(to.path);
          NProgress.done();
        } catch (err) {
          await store.dispatch("user/logout");
          // 后台获取用户信息失败
          Message.error(err || "获取用户信息失败");
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) > -1) {
      next();
    } else {
      // 跳到登录页
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
  // 手动强制关闭一次  为了解决手动切换地址时，进度条的不关闭的问题
  NProgress.done();
});

// 后置守卫
router.afterEach(() => {
  NProgress.done();
});
