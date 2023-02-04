import { getToken, setToken, removeToken } from "@/utils/auth";
import { login } from "@/api/user";

const state = {
  token: getToken(),
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
        resolve();
      });
    });
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
