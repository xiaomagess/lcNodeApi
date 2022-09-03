const Service = require('egg').Service
const _ = require('lodash')
const moment = require('moment');
const BigNumber = require('bignumber.js');
class MarketService extends Service {
  get Market_db() {
    return this.app.model.Mongo.Market;
  }

  /**
   * 查询市场列表
   * @param params
   * @returns {Promise<{count: *, list: *}>}
   */
  async list(params,page,limit,sprice) {
    params.status = 0;
    params.network = this.ctx.network;
    let sort = {};
    if(sprice){
      sort = {price:sprice};
    }else{
      sort = {createTime:-1};
    }
    let count = await this.Market_db.count(params);
    let list  = await this.Market_db.find(params).skip((page - 1) * limit).limit(limit).sort(sort).lean();
    for(let key in list){
      list[key].price = new BigNumber(list[key].price).dividedBy(10**18).toNumber();
      list[key].createTime = moment(list[key].createTime).format('YYYY-MM-DD HH:mm:ss');
      list[key].updateTime = moment(list[key].updateTime).format('YYYY-MM-DD HH:mm:ss');
    }
    return {
      count,list
    };
  }


  //监听出售nft后 生成订单
  async workNftSale(seller, tokenId, price){
    seller = seller.toLowerCase();
    let network = this.ctx.network;
    let nftInfo = await this.service.nftService.getNftInfo(tokenId);
    let nftType = _.get(nftInfo,'type','');
    await this.Market_db.create({
      seller_address:seller,
      tokenId,
      price,
      type:nftType,
      network
    });
  }


  //监听取消出售nft后 取消订单
  async workNftCancel(seller, tokenId){
    seller = seller.toLowerCase();
    let network = this.ctx.network;
    await this.Market_db.updateOne({
      seller_address:seller,
      tokenId,
      status:0,
      network
    }, {
      $set: {
        status:2
      }
    });
  }

  //监听购买nft后 更买数据
  async workNftBuy(buyer, seller, tokenId){
    buyer = buyer.toLowerCase();
    seller = seller.toLowerCase();
    let network = this.ctx.network;
    await this.Market_db.updateOne({
      seller_address:seller,
      tokenId,
      status:0,
      network
    }, {
      $set: {
        buyer_address:buyer,
        status:1
      }
    });
  }

  //查询市场信息
  async saleInfo(seller,tokenId){
    let network = this.ctx.network;
    seller = seller.toLowerCase();
    let info = await this.Market_db.findOne({
      seller_address:seller,
      tokenId,
      status:0,
      network
    }).lean();
    return info;
  }


}
module.exports = MarketService;
