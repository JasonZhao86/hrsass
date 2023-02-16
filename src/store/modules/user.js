import { getToken, setToken, removeToken, setTimeStamp } from "@/utils/auth";
import { login, getUserInfo, getUserDetailById } from "@/api/user";
import { resetRouter } from "@/router";

const state = {
  token: getToken(),
  // 我们会在根getters中引用userinfo.name，如果设置为null，则会引起异常和报错
  userInfo: {},
};

const mutations = {
  setToken(state, token) {
    state.token = token;
    setToken(token);
  },
  removeToken(state) {
    state.token = null;
    removeToken();
  },
  setUserInfo(state, userInfo) {
    // 用浅拷贝的方式去赋值对象，因为这样数据更新之后才会触发组件的更新
    state.userInfo = { ...userInfo };
  },
  reomveUserInfo(state) {
    state.userInfo = {};
  },
};

const actions = {
  // async login(context, data) {
  //   const res = await login(data);
  //   context.commit("setToken", res);
  // },
  // async/await不用返回new Promise，因为async函数本身就是Promise，promise的值是函数的返回的值
  login(context, data) {
    return new Promise((resolve, reject) => {
      login(data).then(
        (res) => {
          context.commit("setToken", res); // 提交mutations设置token
          setTimeStamp();
          resolve(); // 表示执行成功了
        },
        (err) => {
          reject(err);
        }
      );
    });
  },

  // 获取用户资料
  async getUserInfo(context) {
    // 用户的基本资料
    const res = await getUserInfo();
    // 用户的头像
    const result = await getUserDetailById(res.userId);
    const baseResult = { ...res, ...result };
    context.commit("setUserInfo", baseResult);
    return baseResult;
  },

  logout(context) {
    // 删除token
    context.commit("removeToken");
    // 删除用户资料
    context.commit("reomveUserInfo");
    // 重置路由，设置权限模块下路由为初始状态
    resetRouter();
    /*
      Vuex子模块怎么调用子模块的action？都没加锁（required=true）的情况下，可以随意调用，
      因为不加命名空间的情况下，所有的mutations和action都是挂在全局上的，可以直接调用，但
      是加了命名空间的子模块怎么调用另一个加了命名空间子模块的mutations？加了命名空间的context
      指向的不是全局的context，第三个参数：{ root: true }，表示context指向的是全局的context，
      可直接调用其他子模块的mutations或者action
    */
    context.commit("permission/setRoute", [], { root: true });
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
