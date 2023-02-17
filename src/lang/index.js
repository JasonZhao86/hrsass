// 多语言实例化文件
import Vue from "vue";
import VueI18n from "vue-i18n";
import Cookie from "js-cookie";
// 引入饿了么的英文包
import elementEN from "element-ui/lib/locale/lang/en";
// 引入饿了么的中文包
import elementZH from "element-ui/lib/locale/lang/zh-CN";
// 引入饿了么的日文包
import elementJA from "element-ui/lib/locale/lang/ja";
import customZH from "./zh";
import customEN from "./en";

// 全局注册国际化包
Vue.use(VueI18n);

export default new VueI18n({
  // locale决定当前的多语言类型，切换多语言时只需要设置该属性即可
  locale: Cookie.get("language") || "zh", // 从cookie中获取语言类型 获取不到就是中文
  messages: {
    en: {
      // 将饿了么的英文语言包引入
      ...elementEN,
      ...customEN,
    },
    zh: {
      // 将饿了么的中文语言包引入
      ...elementZH,
      ...customZH,
    },
    ja: {
      ...elementJA,
    },
  },
});
