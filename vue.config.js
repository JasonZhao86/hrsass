"use strict";
const path = require("path");
const defaultSettings = require("./src/settings.js");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = defaultSettings.title || "vue Admin Template"; // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528; // dev port

let externals = {};
let cdn = { css: [], js: [] };
// 通过环境变量来区分是否使用cdn
const isProd = process.env.NODE_ENV === "production"; // 判断是否是生产环境

if (isProd) {
  /* 
    key：是要排除的包名（package.json中的包名）
    value：被引入CDN文件中包的全局变量名
    externals首先webpack会排除掉定义的包名，空出来的位置会用变量来替换，否则排除
    后项目无法运行了，包的全局变量名在对应CDN文件中有对应的全局变量名，不能乱写
  */
  externals = {
    vue: "Vue",
    "element-ui": "ELEMENT",
    xlsx: "XLSX",
  };
  cdn = {
    css: [
      // element-ui css
      "https://unpkg.com/element-ui/lib/theme-chalk/index.css", // 样式表
    ],
    js: [
      // vue must at first!
      "https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js", // vuejs
      // element-ui js
      "https://unpkg.com/element-ui/lib/index.js", // elementUI
      "https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/jszip.min.js",
      "https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js",
    ],
  };
}

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: process.env.NODE_ENV === "development",
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    // before: require('./mock/mock-server.js')
    // 代理配置
    proxy: {
      // 这里的api表示如果我们的请求地址有/api的时候，就出触发代理机制
      // localhost:8888/api/abc  => 代理给另一个服务器
      // 本地的前端  =》 本地的后端  =》 代理我们向另一个服务器发请求 （行得通）
      // 本地的前端  =》 另外一个服务器发请求 （跨域 行不通）
      "/api": {
        target: "http://ihrm-java.itheima.net", // 我们要代理的地址
        changeOrigin: true, // 是否跨域 需要设置此值为true 才可以让本地服务代理我们发出请求
        // 路径重写
        // pathRewrite: {
        //   // 重新路由  localhost:8888/api/login  => www.baidu.com/api/login
        //   "^/api": "", // 假设我们想把 localhost:8888/api/login 变成www.baidu.com/login 就需要这么做
        // },
      },
    },
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
    externals: externals,
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin("preload").tap(() => [
      {
        rel: "preload",
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: "initial",
      },
    ]);

    // 这行代码会在执行打包时执行，将cdn变量注入到html模板中
    config.plugin("html").tap((args) => {
      // args 是注入html模板的一个变量，后面的cdn就是定义的变量
      args[0].cdn = cdn;
      // 需要返回这个参数
      return args;
    });
    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete("prefetch");

    // set svg-sprite-loader
    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    config.when(process.env.NODE_ENV !== "development", (config) => {
      config
        .plugin("ScriptExtHtmlWebpackPlugin")
        .after("html")
        .use("script-ext-html-webpack-plugin", [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/,
          },
        ])
        .end();
      config.optimization.splitChunks({
        chunks: "all",
        cacheGroups: {
          libs: {
            name: "chunk-libs",
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: "initial", // only package third parties that are initially dependent
          },
          elementUI: {
            name: "chunk-elementUI", // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // in order to adapt to cnpm
          },
          commons: {
            name: "chunk-commons",
            test: resolve("src/components"), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      });
      // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
      config.optimization.runtimeChunk("single");
    });
  },
};
