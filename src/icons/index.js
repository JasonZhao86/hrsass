import Vue from "vue";
import SvgIcon from "@/components/SvgIcon"; // svg component

// register globally
Vue.component("svg-icon", SvgIcon);

// require.context的使用功能：https://blog.csdn.net/qq_44708990/article/details/119522921
const req = require.context("./svg", false, /\.svg$/);
const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
requireAll(req);
