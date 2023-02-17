<template>
  <div>
    <svg-icon
      icon-class="fullscreen"
      style="color: #fff; width: 20px; height: 20px"
      @click="changeScreen"
    />
  </div>
</template>

<script>
import ScreenFull from "screenfull";

export default {
  methods: {
    changeScreen() {
      if (!ScreenFull.isEnabled) {
        // 此时全屏不可用
        this.$message.warning("此时全屏组件不可用");
        return;
      }
      // 原生js调用
      // document.documentElement.requestFullscreen()
      // 如果可用 就可以全屏
      ScreenFull.toggle();
    },
  },
};
</script>

<style></style>
