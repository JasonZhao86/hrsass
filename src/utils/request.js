import axios from "axios";
import router from "@/router";
import store from "@/store";
import { Message } from "element-ui";
import { getTimeStamp } from "@/utils/auth";

// 定义超时时间
const TimeOut = 3600;

function IsCheckTimeOut() {
  let currentTime = Date.now();
  let timestamp = getTimeStamp() || 0;
  return (currentTime - timestamp) / 1000 > TimeOut;
}

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000,
});

service.interceptors.request.use(
  (config) => {
    // 在这个位置注入token
    if (store.getters.token) {
      if (IsCheckTimeOut()) {
        store.dispatch("user/logout");
        router.push("/login");
        return Promise.reject(new Error("token超时了"));
      }
      config.headers["Authorization"] = `Bearer ${store.getters.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  // 后端正常2xx的响应，会进入到该分支。
  (response) => {
    const { success, data, message } = response.data;
    if (success) {
      return data;
    } else {
      Message.error(message);
      return Promise.reject(new Error(message));
    }
  },
  // 只要是非200的响应都会进入到error分支
  (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.code === 10002
    ) {
      store.dispatch("user/logout");
      router.push("/login");
      Message.error("token过期，请重新登录");
    } else {
      Message.error(error.message || error);
    }
    return Promise.reject(error);
  }
);

export default service;
