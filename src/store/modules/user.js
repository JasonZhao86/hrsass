import { getToken, setToken, removeToken, setTimeStamp } from "@/utils/auth";
import { login, getUserInfo, getUserDetailById } from "@/api/user";

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
  // }
  login(context, data) {
    return new Promise((resolve) => {
      login(data).then((res) => {
        context.commit("setToken", res);
        setTimeStamp();
        resolve();
      });
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
    context.commit("removeToken");
    context.commit("reomveUserInfo");
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
