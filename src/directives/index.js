export const imagerror = {
  // 指令对象会在当前的dom元素插入到节点之后执行
  inserted(dom, options) {
    dom.src = dom.src || options.value;
    /* 
       dom：表示当前指令作用的dom对象
       options：是指令中的变量的解释，其中有一个属性叫做value
       当图片有地址但地址没有加载成功的时候会报错，触发img标签的一个onerror事件
    */
    dom.onerror = function () {
      // 当图片出现异常的时候会将指令配置的默认图片设置为该img的内容，dom可以注册error事件
      dom.src = options.value;
    };
  },

  componentUpdated(dom, options) {
    dom.src = dom.src || options.value;
  },
};
