'use strict';
const Controller = require('egg').Controller;
const _ = require("lodash");

class aidropController extends Controller {

  async getUserWhite() {
    const { ctx, app} = this;
    let  address = _.get(this.ctx.params,'address');
    address = address.toLowerCase();
    let userWhiteInfo = await this.service.aidropService.getUserWhite(address);
    return  ctx.body = app.getSuccess(userWhiteInfo);
  }


  async addWhitelist() {
     const { ctx, app} = this;
     let  address = _.get(this.ctx.params,'address');
     address = address.toLowerCase();
     await this.service.aidropService.addUserWhite(address);
     let userWhiteInfo = await this.service.aidropService.getUserWhite(address);
     return  ctx.body = app.getSuccess(userWhiteInfo);
  }



}

module.exports = aidropController;
