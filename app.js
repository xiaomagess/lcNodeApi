//app.js

/**
 * Application 是全局应用对象，在一个应用中，只会实例化一个，在它上面可以挂载一些全局方法和对象
 *
 * app 对象指的是 Koa 的全局应用对象，全局只有一个，在应用启动时被创建。
 *
 * 在 app.js 中 app 对象会作为第一个参数注入到入口函数中
 *
 * 框架提供了统一的入口文件（app.js）进行启动过程自定义，这个文件返回一个 Boot 类，我们可以通过定义 Boot 类中的生命周期方法来执行启动应用过程中的初始化工作
 *
 */

module.exports = app => {
    
  //自定义内容
  // app.beforeStart(async() => {
  //   //应用会等待这个函数执行完成才启动
  //   console.log("app beforeStart");
  // });
  //
  // app.ready(async() => {
  //   console.log("==app ready==");
  // });
  //
  // app.beforeClose(async() => {
  //   console.log("==app beforeClose==");
  // });
  // //该事件一个 worker 进程只会触发一次,在http服务完成启动后，会将http server 通过这个事件暴露给开发者
  // app.once('server', server => {
  //   //websocket
  // });
  // //运行时有任何的异常被onerror插件捕获后，都会触发error事件，将错误对象和关联上下文(如果有)暴露给开发者，可以进行自定义的日志记录上报等处理
  // app.on('error', (err, ctx) => {
  //   //report error
  // });
  // //应用收到请求和响应请求时，分别触发request和response事件，并将当前请求上下文暴露出来，开发者可以监听这两个事件进行日志记录
  // app.on('request', ctx => {
  //   //log receive request
  //   console.log("request");
  // });
  // app.on('response', ctx => {
  //   console.log("response",ctx.body);
  //   //ctx.starttime is set by frameword
  //   //log total cost
  // })
}
