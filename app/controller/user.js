'use strict';
const Controller = require('egg').Controller;
const _ = require('lodash');

class userController extends Controller {

  //获取用户余额
  async getUserAmount() {
    const { ctx, app } = this;
    let address = _.get(this.ctx.params, 'address');
    let userInfo = await this.service.userService.getUserInfo(address);
    return ctx.body = app.getSuccess(userInfo);
  }

  //获取用户余额日志
  async getUserAmountLog() {
    const { ctx, app } = this;
    let address = _.get(this.ctx.params, 'address');
    let userLog = await this.service.userService.getUserLog(address);
    return ctx.body = app.getSuccess(userLog);
  }

  //用户提现
  async userWithdraw() {
    const { ctx, app } = this;
    let address = _.get(this.ctx.query, 'address','');
    let amount = _.get(this.ctx.query, 'amount',0);
    let msg = _.get(this.ctx.query, 'msg','');
    let receipte = _.get(this.ctx.query, 'receipte','');
    amount = parseInt(amount);
    let isDelFlag = false;
    try{
      let checkSign = this.service.toolService.checkUserSignature(address,msg,receipte);
      if(!checkSign){
        this.ctx.sinfo('签名验证失败',address);
        return ctx.body = app.error('签名验证失败');
      }
      let lock = await this.service.redisService.setRedisWithdrawLock(address);
      if(!lock){
        this.ctx.sinfo('正在操作提现',address);
        return ctx.body = app.error('正在提现');
      }
      isDelFlag = true;
      let userInfo = await this.service.userService.getUserInfo(address);
      let nowAmount = _.get(userInfo,'amount',0);
      nowAmount = parseInt(nowAmount);
      if(amount && nowAmount && amount<=nowAmount){
        userInfo = await this.service.userService.upUserInfo(address,amount,2);
        let withDrawSignatrue = await  this.service.userService.addWithdrawSignatrue(address,amount);
        return ctx.body = app.getSuccess({userInfo,withDrawSignatrue});
      }else{
        return ctx.body = app.error('不合法的提现');
      }
    }catch (e) {
      console.log(e)
      return ctx.body = app.error(e);
    }finally {
      if(isDelFlag){
        this.service.redisService.delRedisWithdrawLock(address);
      }
    }
  }

  //获取用户提现签名列表
  async getUserWithDrawList(){
    const { ctx, app } = this;
    let address = _.get(this.ctx.params, 'address','');
    let withDrawList = await this.service.userService.getWithdrawSignatrue(address);
    return ctx.body = app.getSuccess(withDrawList);
  }

  /**
   * 获取用户装备列表
   * @returns {Promise<*|{msg, code, data}>}
   */
  async getUserEquipmentList(){
    let address = _.get(this.ctx.params, 'address');
    let equipment = await  this.service.equipmentService.getUserEquipmentAll(address);
    return this.ctx.body = this.app.getSuccess(equipment);
  }

  /**
   * 获取用户装备列表
   * @returns {Promise<*|{msg, code, data}>}
   */
  async addUserEquipmentList(){
    let address = _.get(this.ctx.params, 'address');
    let equipment = await  this.service.equipmentService.addUserEquipment(address);
    return this.ctx.body = this.app.getSuccess(equipment);
  }

}

module.exports = userController;
