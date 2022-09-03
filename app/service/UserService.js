const Service = require('egg').Service
const _ = require('lodash')
const moment = require("moment")
class UserService extends Service {
  get UserInfo_db() {
    return this.app.model.Mongo.UserInfo;
  }

  get UserLog_db() {
    return this.app.model.Mongo.UserLog;
  }

  get WithdrawSignatrue_db() {
    return this.app.model.Mongo.WithdrawSignatrue;
  }


  async userChange(nftInfo,nftConfig,address){
    let intervalTime =  _.get(nftConfig,'intervalTime',0);
    let level = _.get(nftInfo,'level');
    let baseProp = parseInt(level)%10/100 + 0.9;
    let baseProduction = _.get(nftConfig,'baseProduction');
    baseProduction = parseInt(baseProduction * baseProp);
    //一次领取的数量
    let oneReciveProduction = parseInt(baseProduction / 24 * parseInt(intervalTime));
    this.ctx.sinfo("一次性领取",oneReciveProduction,{baseProduction,level,intervalTime});
    return  this.upUserInfo(address,oneReciveProduction);
  }


  //获取用户信息
  async getUserInfo(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let userInfo =  await this.UserInfo_db.findOne({
      address,
      network
    }).select("address amount").lean();
    return userInfo;
  }


  //修改用户信息
  async upUserInfo(address,val,type=1){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let userInfo = await this.getUserInfo(address);
    let beforeAmount = _.get(userInfo,'amount',0);
    let afterAmount = parseInt(beforeAmount) + parseInt(val);
    let newUserInfo =  await this.UserInfo_db.findOneAndUpdate({
      address,network
    }, {
      $set: {
        amount:afterAmount,
        network
      }
    }, {
      new:true,
      upsert: true,
      setDefaultsOnInsert: true
    });
    await this.addUserLog(address,val,beforeAmount,afterAmount,type);
    return newUserInfo;
  }


  async addUserLog(address,val,beforeAmount,afterAmount,type=1){
    let network = this.ctx.network;
    await this.UserLog_db.create({
      address,
      change:val,
      before:beforeAmount,
      after:afterAmount,
      type,
      network
    });
  }

  //获取用户信息
  async getUserLog(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let userLogList =  await this.UserLog_db.find({
      address,
      network
    }).lean();
    for(let key in userLogList){
      userLogList[key].createTime = moment(userLogList[key].createTime).format('YYYY-MM-DD HH:mm:ss');
      userLogList[key].updateTime = moment(userLogList[key].updateTime).format('YYYY-MM-DD HH:mm:ss');
    }
    return userLogList;
  }

  //增加用户的提现签名
  async addWithdrawSignatrue(address,amount){
    address = address.toLowerCase();
    let {key,signature} = await this.service.toolService.getWithDrawKeySignature(address,amount);
    let network = this.ctx.network;
    await this.WithdrawSignatrue_db.create({
      address,
      signature,
      key,
      amount,
      network
    });
    return this.getWithdrawSignatrueOne(address,key);
  }

  //更新用户提现状态
  async updateWithdrawSignatrue(key){
    await this.WithdrawSignatrue_db.updateOne({
      key
    },{
      $set: {
        isUsed:true
      }
    });
  }


  //获取用户提现签名数据
  async getWithdrawSignatrueOne(address,key){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let withDrowInfo =  await this.WithdrawSignatrue_db.findOne({
      address,
      key,
      network
    }).lean();
    return withDrowInfo;
  }

  //获取用户信息
  async getWithdrawSignatrue(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let withDrowInfoList =  await this.WithdrawSignatrue_db.find({
      address,
      network
    }).lean();

    return withDrowInfoList;
  }
}
module.exports = UserService;
