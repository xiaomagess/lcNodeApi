const Service = require('egg').Service
const _ = require('lodash')
class AidropService extends Service {
  get userWhitelist_db() {
    return this.app.model.Mongo.UserWhitelist;
  }

  async addUserWhite(address){
    let {key,signature} = await this.service.toolService.getKeySignature(address);
    let network = this.ctx.network;
    address = address.toLowerCase();
    await this.userWhitelist_db.updateOne({
      address,
      network
    }, {
      $set: {
        address,
        signature,
        key,
        isUsed:false,
        network
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  async getUserWhite(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let userWhite = await this.userWhitelist_db.findOne({
      address,
      network
    }).select("-_id").lean();
    return userWhite;
  }

  //用户领取盲盒后更新
  async updateUserWhite(address,tokenId){
    let network = this.ctx.network;
    address = address.toLowerCase();
    await this.userWhitelist_db.updateOne({
      address,
      network
    }, {
      $set: {
        isUsed: true,
        tokenId
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

}
module.exports = AidropService;
