## 一、路由模式

&emsp;&emsp;在SPA单页应用中，有两种路由模式：

* hash模式：`#`后面是路由路径，特点是**前端访问**，`#`后面的变化不会经过服务器

* history模式：正常的`/`访问模式，特点是**后端访问**，**任意地址的变化都会访问服务器**

&emsp;&emsp;开发到现在，我们一直都在用hash模式，打包我们尝试用history模式。改成history模式非常简单，只需要将路由的mode类型改成history即可，`src/router/index.js`

```js
const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }), // 管理滚动行为 如果出现滚动 切换就让 让页面回到顶部
  routes: [...constantRoutes] // 改成只有静态路由
})
```

&emsp;&emsp;假设我们的地址是这样的`www.xxxx.com/hr/a`、`www.xxxx.com/hr/b`。我们会发现，其实域名是`www.xxxx.com`，hr是特定的前缀地址，此时我们可以配置一个`base`属性，配置为hr，`src/router/index.js`

```js
const createRouter = () => new Router({
  mode: 'history', // require service support
  base: '/hr/', // 配置项目的基础地址
  scrollBehavior: () => ({ y: 0 }), // 管理滚动行为 如果出现滚动 切换就让 让页面回到顶部
  routes: [...constantRoutes] // 改成只有静态路由
})
```

&emsp;&emsp;此时，我们会发现地址已经变成我们想要的样子了

![image-20230217143839544](http://jason-pics.oss-cn-hangzhou.aliyuncs.com/img/image-20230217143839544.png)

<br />

<br />

## 二、性能分析和CDN的应用

### 1、性能分析

&emsp;&emsp;我们集成了功能，写了很多组件，最终都会打包成一堆文件，那么真实运行的性能如何呢？我们可以使用`vue-cli`本身提供的性能分析工具，对我们开发的所有功能进行打包分析。它的应用非常简单，会以生产环境的模式打包编译：

```bash
$ npm run preview -- --report
```

&emsp;&emsp;打包分析会使用生产环境的环境变量配置文件：`.env.production`，届时所有访问后端接口都将以`/prod-api`开头：

```js
# just a flag
ENV = 'production'

# base api
VUE_APP_BASE_API = '/prod-api'
```

&emsp;&emsp;这个命令会从我们的入口`src/main.js`进行依赖分析，分析出最大的包，方便我们进行观察和优化，执行完这个命令，我们会看到如下的页面：

![image-20230217143810105](http://jason-pics.oss-cn-hangzhou.aliyuncs.com/img/image-20230217143810105.png)

&emsp;&emsp;如图所以，方块越大，说明该文件占用的体积越大，文件越大，对于网络带宽和访问速度的要求就越高，这也就是我们优化的方向。像这种情况，我们怎么优化一下呢？

<br />

### 2、webpack打包排除

&emsp;&emsp;CDN是一个比较好的方式，我们不必把这些大的文件和那些小的文件打包到一起，像这种`xlsx`、`element`这种功能性很全的插件，我们可以放到CDN服务器上，一来减轻整体包的大小，二来CDN的加速服务可以加快我们对于插件的访问速度。

&emsp;&emsp;`vue.config.js`，在配置文件的根域下添加`externals`让`webpack`不打包`xlsx`和`element-ui`：

```js
const port = process.env.port || process.env.npm_config_port || 9528; 

/* 
  key：是要排除的包名（package.json中的包名）
  value：被引入CDN文件中包的全局变量名
  externals首先webpack会排除掉定义的包名，空出来的位置会用变量来替换，否则排除
  后项目无法运行了，包的全局变量名在对应CDN文件中有对应的全局变量名，不能乱写
*/
const externals = {
  vue: "Vue",
  "element-ui": "ELEMENT",
  xlsx: "XLSX",
};

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
```

&emsp;&emsp;包的全局变量名在对应CDN文件中有对应的全局变量名，不能乱写，比如`element-ui`在CDN中全局变量名如下：

![image-20230217160723043](http://jason-pics.oss-cn-hangzhou.aliyuncs.com/img/image-20230217160723043.png)

&emsp;&emsp;再次运行，我们会发现包的大小已经大幅减小：

```bash
$ npm run preview -- --report
```

<br />

### 3、CDN文件配置

&emsp;&emsp;`vue.config.js`，没有被打包的几个模块怎么处理，项目已无法运行了。采用CDN的方式，在页面模板中预先引入：

```js
const externals = {
  vue: "Vue",
  "element-ui": "ELEMENT",
  xlsx: "XLSX",
};

const cdn = {
  css: [
    // element-ui css
    'https://unpkg.com/element-ui/lib/theme-chalk/index.css' // 样式表
  ],
  js: [
    // vue must at first!
    'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js', // vuejs
    // element-ui js
    'https://unpkg.com/element-ui/lib/index.js', // elementUI
      'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js'
  ]
}
```

&emsp;&emsp;但是请注意，这时的配置实际上是对开发环境和生产环境都生效的，在开发环境时，没有必要使用CDN，此时我们可以使用环境变量来进行区分，`vue.config.js`

```js
let externals = {}
let cdn = { css: [], js: [] }
// 通过环境变量来区分是否使用cdn
const isProd = process.env.NODE_ENV === 'production' // 判断是否是生产环境

if (isProd) {
  /* 
    key：是要排除的包名（package.json中的包名）
    value：被引入CDN文件中包的全局变量名
    externals首先webpack会排除掉定义的包名，空出来的位置会用变量来替换，否则排除
    后项目无法运行了，包的全局变量名在对应CDN文件中有对应的全局变量名，不能乱写
  */
  externals = {
    'vue': 'Vue',
    'element-ui': 'ELEMENT',
    'xlsx': 'XLSX
  }
  cdn = {
    css: [
      'https://unpkg.com/element-ui/lib/theme-chalk/index.css' // 提前引入elementUI样式
    ], // 放置css文件目录
    js: [
      'https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js', // vuejs
      'https://unpkg.com/element-ui/lib/index.js', // element
      'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js', // xlsx 相关
      'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/jszip.min.js' // xlsx 相关
    ] // 放置js文件目录
  }
}
```

<br />

### 4、CDN文件注入到html模板

&emsp;&emsp;通过`html-webpack-plugin`插件（`vue-element-template`脚手架自带）将CDN文件注入到`public/index.html`，`vue.config.js`

```js
// 这行代码会在执行打包时执行，将cdn变量注入到html模板中
config.plugin("html").tap((args) => {
  // args 是注入html模板的一个变量，后面的cdn就是定义的变量
  args[0].cdn = cdn;
  // 需要返回这个参数
  return args;
});

// when there are many pages, it will cause too many meaningless requests
config.plugins.delete("prefetch");
```

&emsp;&emsp;定义模板，将前面配置的`CDN Config`依次注入 css 和 js，`public/index.html`

```html
<head>
  <!-- 引入样式 -->
  <% for(var css of htmlWebpackPlugin.options.cdn.css) { %>
    <link rel="stylesheet" href="<%=css%>">
  <% } %>
</head>

<body>
   ....
  <!-- 引入JS -->
  <% for(var js of htmlWebpackPlugin.options.cdn.js) { %>
    <script src="<%=js%>"></script>
  <% } %>
</body>
```

&emsp;&emsp;最后进行生产环境的打包编译，打包后的所有静态文件将在`dist`目录中：

```bash
$ npm run build:prod
```

&emsp;&emsp;`dist/index.html`，查看打包后的首页，可以清楚的看到cdn地址被填入进去了：

```js
<link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css" />
        
<script src="https://cdn.jsdelivr.net/npm/vue@2.7.14/dist/vue.js"></script>
<script src="https://unpkg.com/element-ui/lib/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/jszip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js"></script>
```

<br />

<br />

## 三、在nodejs环境中应用并代理跨域

&emsp;&emsp;将打包好的代码打包上线，并在nodejs中代理跨域。

### 1、使用koa框架部署项目

&emsp;&emsp;到现在为止，我们已经完成了一个前端工程师的开发流程，按照常规的做法，此时，运维会将我们的代码部署到阿里云的nginx服务上。对于我们而言，我们可以将其部署到本机的`nodejs`环境中。

```bash 
$ mkdir hrServer/public -pv && cd hrServer

# 初始化npm
$ npm init -y

# 安装服务端框架koa(也可以采用express或者egg)
$ npm i koa koa-static
```

&emsp;&emsp;拷贝上小节打包的`dist`目录下的所有文件（不包含`dist`目录）拷贝到`hrServer/public`下，在根目录下创建`app.js`，代码如下：

```js
const Koa  = require('koa')
const serve = require('koa-static');

const app = new Koa();

//将public下的代码静态化
app.use(serve(__dirname + "/public"));
app.listen(3333, () => {
     console.log('项目启动成功：http://127.0.0.1:3000')
})
```

&emsp;&emsp;访问，http://localhost:3333，可以看到登录页。但是，此时存在两个问题：

* 页面404：刷新页面时发现页面变成了404
* 接口404：点击登录时提示`/prod-api`接口404

<br />

### 2、解决history页面访问问题

&emsp;&emsp;当我们刷新页面时发现404，这是因为我们采用了`history`的模式，地址的变化会引起服务器的刷新，我们只需要在`app.js`对所有的地址进行一下处理即可，安装 koa中间件：

```bash 
# 专门处理history模式的中间件
$ npm i koa2-connect-history-api-fallback
```

&emsp;&emsp;注册中间件`koa2-connect-history-api-fallback`

```js
const Koa  = require('koa')
const serve = require('koa-static');
const  { historyApiFallback } = require('koa2-connect-history-api-fallback');
const path = require('path')
const app = new Koa();

// 除接口之外所有的请求都发送给了index.html
app.use(historyApiFallback({
    // 白名单
     whiteList: ['/prod-api']
 }));

// 将public下的代码静态化
app.use(serve(__dirname + "/public"));

app.listen(3333, () => {
     console.log('项目启动成功：http://127.0.0.1:3000')
})
```

<br />

### 3、解决生产环境跨域问题

&emsp;&emsp;当点击登录时，发现接口404。前面我们讲过，`vue-cli`的代理只存在于开发期，当我们上线到node环境或者nginx环境时，需要我们再次在环境中代理。

&emsp;&emsp;在nodejs中代理，安装跨域代理中间件

```bash
$ npm i koa2-proxy-middleware
```

&emsp;&emsp;配置跨越代理

```js
const proxy = require('koa2-proxy-middleware')

app.use(proxy({
  targets: {
    // (.*) means anything
    '/prod-api/(.*)': {
        // 后端服务器地址
        target: 'http://ihrm-java.itheima.net/api',
        changeOrigin: true,
        pathRewrite: { 	
            '/prod-api': ""
        }
    }
  }
}))
```

&emsp;&emsp;这里之所以用了`pathRewrite`，是因为生产环境的请求基础地址是 `/prod-api`，需要将该地址去掉。此时，我们的项目就可以跨域访问了！

&emsp;&emsp;到现在为止，我们在十几天的时间里，完成了一个较为复杂的中台项目的解剖和开发，任何一个复杂的项目都是各种各样的功能通过合理的设计和布局组装而成的，所以未来我们每个同学要掌握的能力就是不论项目的难度和复杂度，都要学会技术的解耦和设计，这样我们的开发能力就会变得越来越强。



