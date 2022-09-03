const Service = require('egg').Service
const _ = require("lodash");
class WatchService extends Service {

  get WatchLog_db() {
    return this.app.model.Mongo.WatchLog;
  }

  /**
   * 除去市场的其他监听
   * @param result
   * @returns {Promise<void>}
   */
  async watchNftCoin(result){
    let eventName = _.get(result, 'event');
    if(!eventName){
      this.ctx.linfo(eventName,'日志事件无event name-异常');
      return;
    }
    let isLogExit = await this.selLog(result);
    if(!_.isEmpty(isLogExit)){
      this.ctx.linfo(eventName,'日志已监听到-存在');
      return;
    }
    if (eventName == 'ClaimAirdrop') {
      await this.watchClaimAirdrop(result);
    }else if(eventName == 'OpenBox'){
      await this.watchOpenBox(result);
    }else if(eventName == 'ReceiveMint'){
      await this.watchReciveMint(result);
    }else if(eventName == 'Breed'){
      await this.watchBreed(result);
    }else if(eventName == 'ReceiveToken'){
      await this.watchReceiveToken(result);
    }
  }

  //用户领取盲盒后更新
  async watchClaimAirdrop(result){
    this.addWatchLog(result);
    let eventData = result.returnValues;
    let { from, tokenId } = eventData;
    await this.service.aidropService.updateUserWhite(from,tokenId);
  }

  //监听到开盲盒后 生成个nft
  async watchOpenBox(result){
    this.addWatchLog(result);
    let eventData = result.returnValues;
    let { from, tokenId } = eventData;
    await this.service.nftService.workNftPrdToNft(from, tokenId);
  }

  //监听到领取装备后 生成个nft
  async watchReciveMint(result){
    this.addWatchLog(result);
    let eventData = result.returnValues;
    let { from, tokenId, key } = eventData;
    await this.service.nftService.workReciveMint(from, tokenId, key);
  }

  //监听到领取装备后 生成个nft
  async watchBreed(result){
    this.addWatchLog(result);
    let eventData = result.returnValues;
    let { from, tokenfId, tokenmId,tokenId} = eventData;
    await this.service.nftService.workBreed(from, tokenfId, tokenmId,tokenId);
  }

  //监听用户领取阳光币
  async watchReceiveToken(result){
    this.addWatchLog(result);
    let eventData = result.returnValues;
    let { from, key, amount} = eventData;
    await this.service.userService.updateWithdrawSignatrue(key);
  }

  //监听市场
  async watchMarket(result){
    let eventName = _.get(result, 'event');
    let eventData = result.returnValues;
    this.ctx.linfo("work:",eventName);
    let isLogExit = await this.selLog(result);
    if(!_.isEmpty(isLogExit)){
      this.ctx.linfo(eventName,'日志已监听到-存在');
      return;
    }
    if (eventName == 'Sale') {
      this.addWatchLog(result);
      let { seller, tokenId, price } = eventData;
      await this.service.marketService.workNftSale(seller, tokenId, price);
    } else if (eventName == 'Cancel') {
      let { seller, tokenId } = eventData;
      let saleInfo = await this.service.marketService.saleInfo(seller,tokenId);
      if(_.isEmpty(saleInfo)){
        this.ctx.linfo(eventName,'没有查询到sale信息');
        return;
      }
      this.addWatchLog(result);
      await this.service.marketService.workNftCancel(seller, tokenId);
    } else if (eventName == 'Buy') {
      let { buyer, seller, tokenId } = eventData;
      let saleInfo = await this.service.marketService.saleInfo(seller,tokenId);
      if(_.isEmpty(saleInfo)){
        this.ctx.linfo(eventName,'没有查询到sale信息');
        return;
      }
      this.addWatchLog(result);
      await this.service.marketService.workNftBuy(buyer, seller, tokenId);
    }
  }


  //添加监听hash日志
  async addWatchLog(result){
    let network = this.ctx.network;
    let {address,transactionHash,signature,event}  = result;
    this.ctx.linfo('addWatchLog:',event, address,transactionHash);
    this.WatchLog_db.create({
      address,
      event,
      transactionHash,
      signature,
      network
    });
  }

  //查询日志
  async selLog(result){
    let network = this.ctx.network;
    let {address,transactionHash,signature}  = result;
    address = address.toLowerCase();
    transactionHash = transactionHash.toLowerCase();
    signature = signature.toLowerCase();
    let info =  await this.WatchLog_db.findOne({
      address,
      transactionHash,
      signature,
      network
    }).lean();
    return info;
  }

}
module.exports = WatchService;
