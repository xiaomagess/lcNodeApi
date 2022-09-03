'use strict';
const Controller = require('egg').Controller;
const _ = require("lodash");

class marketController extends Controller {
  async list() {
    const { ctx, app} = this;
    let  {address,type,page,sprice} = this.ctx.query;
    let limit = 50;
    page = page>0?page:1;
    let params = {};
    if(address){
      params.seller_address = address.toLowerCase();
    }
    if(type){
      params.type = type.toLowerCase();
    }
    let {count,list} = await this.service.marketService.list(params,page,limit,sprice);
    return  ctx.body = app.getSuccess({count,list,limit,page});
  }



}

module.exports = marketController;
