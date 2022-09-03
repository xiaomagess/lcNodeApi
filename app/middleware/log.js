/**
 * 打印入口文件的请求参数
 * @returns {Function}
 */
module.exports = () => {
  return async(ctx, next) => {
    const {app,request} = ctx;
    let query = request.query;
    let body = request.body;
    let q_chainId = app._.get(query,'chainId','');
    let p_chainId = app._.get(body,'chainId','');
    let chainId = q_chainId?q_chainId:p_chainId;
    chainId = parseInt(chainId);
    chainId = 97;
    if(chainId == 1){
      ctx.chain = 'eth';
      ctx.network = "MAINNET";
    }else if(chainId == 4){
      ctx.chain = 'eth';
      ctx.network = "RINKEBY";
    }else if(chainId == 56){
      ctx.chain = 'bsc';
      ctx.network = "BSCMAINNET";
    }else if(chainId == 97){
      ctx.chain = 'bsc';
      ctx.network = "BSCTESTNET";
    }else if(chainId == 32659){
      ctx.chain = 'fsn';
      ctx.network = "FSNMAINNET";
    }
    let url = request.url;
    if(url == '/'){
      await next();
    }else{
      let params = app._.isEmpty(query)?body:query;
      ctx.logger.info(ctx.chain,'请求参数',params);
      await next();
    }
  }
};
