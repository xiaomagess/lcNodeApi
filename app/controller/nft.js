'use strict';
const Controller = require('egg').Controller;
const _ = require('lodash');
const moment = require('moment');
class nftController extends Controller {
  /**
   * 获取tokenId的信息
   * @returns time
   */
  async nftInfo() {
    const { ctx, app } = this;
    let tokenId = _.get(this.ctx.params, 'id');
    let tokenInfo = await this.service.nftService.getNftInfo(tokenId);
    let metaData = {
        url:tokenInfo.url,
        metadata:{
          tokenId:tokenInfo.tokenId,
          level:tokenInfo.level,
          enable:tokenInfo.enable,
          endLifeCycle:tokenInfo.endLifeCycle,
          startMiningTime:tokenInfo.startMiningTime,
          endMiningTime:tokenInfo.endMiningTime,
        }
    };
    return ctx.body = metaData;
  }

  /**
   * 获取多个tokenId的信息
   * @returns {Promise<*|{msg, code, data}>}
   */
  async nftList(){
    const { ctx, app } = this;
    let ids = _.get(this.ctx.queries, 'ids');
    if(!_.isArray(ids)){
      ids = [ids];
    }
    const tokenList = await this.service.nftService.nftInfoMore(ids);
    return ctx.body = app.getSuccess(tokenList);
  }

  /**
   * 启用nft挖矿
   * @returns {Promise<*|{msg, code, data}>}
   */
  async nftEnable() {
    const { ctx, app } = this;
    let {tokenId,address} = ctx.request.query;
    let nftInfo = await this.service.nftService.getNftInfo(tokenId);
    if (_.isEmpty(nftInfo)) {
      this.ctx.sinfo('tokenId 无效');
      return ctx.body = app.error('tokenId 无效');
    }
    if (nftInfo.enable) {
      this.ctx.sinfo('已经启用nft');
      return ctx.body = app.error('已经启用nft');
    }

    let userTokenList = await this.service.contractService.getUserFlowerNft(address);
    if(_.indexOf(userTokenList,tokenId) == -1){
      this.ctx.sinfo('无效的tokenId');
      return ctx.body = app.error('无效的tokenId');
    }

    let type = _.get(nftInfo, 'type');
    let nftConfig = await this.service.nftService.getNftConfig(type);
    let lifeCycle = _.get(nftConfig,'lifeCycle',0);
    let intervalTime = _.get(nftConfig,'intervalTime',0);

    let startMiningTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let endMiningTime = moment(startMiningTime).add(parseInt(intervalTime), 'hour').format('YYYY-MM-DD HH:mm:ss');
    let endLifeCycle  = moment().add(parseInt(lifeCycle), 'day').format('YYYY-MM-DD HH:mm:ss');
    this.ctx.sinfo({enable:true,startMiningTime,endMiningTime,endLifeCycle});
    let relInfo =  await this.service.nftService.updateNft(tokenId,{enable:true,startMiningTime,endMiningTime,endLifeCycle});
    return ctx.body = app.getSuccess(relInfo);
  }

  /**
   * 领取挖矿
   * @returns {Promise<*|{msg, code, data}>}
   */
  async dig(){
    const { ctx, app } = this;
    let {tokenId,address} = ctx.request.query;
    let nftInfo = await this.service.nftService.getNftInfo(tokenId);
    if (_.isEmpty(nftInfo)) {
      this.ctx.sinfo('无效的tokenId');
      return ctx.body = app.error('tokenId 无效');
    }
    if (!nftInfo.enable) {
      this.ctx.sinfo('未启用nft');
      return ctx.body = app.error('未启用nft');
    }

    let userTokenList = await this.service.contractService.getUserFlowerNft(address);
    if(_.indexOf(userTokenList,tokenId) == -1){
      this.ctx.sinfo('无效的tokenId');
      return ctx.body = app.error('无效的tokenId');
    }
    let isDelFlag = false;
    try{
      let lock = await this.service.redisService.setRedisDigLock(address);
      if(!lock){
        this.ctx.sinfo('正在操作挖矿',address);
        return ctx.body = app.error('正在操作挖矿');
      }
      isDelFlag = true;

      let endLifeCycle = _.get(nftInfo,'endLifeCycle',0);
      endLifeCycle = moment(endLifeCycle).format('YYYY-MM-DD HH:mm:ss');
      let nowTime = moment().format('YYYY-MM-DD HH:mm:ss');
      let isExpired = moment(endLifeCycle).isBefore(nowTime);
      if(isExpired){
        this.ctx.sinfo('nft已失效 时间为:'+endLifeCycle);
        return ctx.body = app.error('nft已失效 时间为:'+endLifeCycle);
      }

      let endMiningTime = _.get(nftInfo,'endMiningTime',0);
      endMiningTime = moment(endMiningTime).format('YYYY-MM-DD HH:mm:ss');
      this.ctx.sinfo('endMiningTime',endMiningTime);
      let isRecive = moment(endMiningTime).isBefore(nowTime);
      if(!isRecive){
        this.ctx.sinfo('未到领取时间,下一次领取为:'+endMiningTime);
        return ctx.body = app.error('未到领取时间,下一次领取为:'+endMiningTime);
      }

      let type = _.get(nftInfo, 'type');
      let nftConfig = await this.service.nftService.getNftConfig(type);
      let intervalTime = _.get(nftConfig,'intervalTime',0);
      //更新用户代币数量
      let userInfo = await this.service.userService.userChange(nftInfo,nftConfig,address);
      //更新用户下一次dig
      let nextEndMiningTime = moment(nowTime).add(parseInt(intervalTime), 'hour').format('YYYY-MM-DD HH:mm:ss');
      let relInfo =  await this.service.nftService.updateNft(tokenId,{startMiningTime:nowTime,endMiningTime:nextEndMiningTime});

      //装备掉落
      let luckyFactor = _.get(nftConfig,'luckyFactor',0);
      let equipment = await  this.service.equipmentService.equipmentFall(address,luckyFactor);

      return ctx.body = app.getSuccess({userInfo,equipment,nftInfo:relInfo});
    }catch (e) {
      return ctx.body = app.error('error');
    }finally {
      if(isDelFlag) {
        this.service.redisService.delRedisDigLock(address);
      }
    }


  }

}

module.exports = nftController;
