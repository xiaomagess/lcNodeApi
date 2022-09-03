const Service = require('egg').Service
const _ = require("lodash");
class PastEventLogService extends Service {
  get PastEventLog_db() {
    return this.app.model.Mongo.PastEventLog;
  }

  //记录扫描历史日志的当前块
  async doPastEvnetLog(result){
    let network = this.ctx.network;
    let address = result.address;
    address = address.toLowerCase();
    await this.PastEventLog_db.updateOne({
      address,
      network
    },{
      $set:result
    },{
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  //查询历史日志
  async getPastEvnetLog(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let data = await this.PastEventLog_db.findOne({
      address,
      network
    }).lean();
    return _.get(data,'toBlock',0);
  }

}
module.exports = PastEventLogService;
