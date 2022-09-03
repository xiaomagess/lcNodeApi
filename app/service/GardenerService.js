const Service = require('egg').Service
class GardenerService extends Service {
  get GardenerUser_db() {
    return this.app.model.Mongo.GardenerUser;
  }
  //获取gardener用户信息
  async getGardenerUser(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let user =  await this.GardenerUser_db.find({
      address,
      network
    }).lean();
    return user;
  }
}
module.exports = GardenerService;
