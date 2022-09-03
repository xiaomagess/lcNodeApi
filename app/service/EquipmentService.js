const Service = require('egg').Service
const _ = require('lodash')
const moment = require("moment")
class EquipmentService extends Service {
  get EquipmentSignatrue_db() {
    return this.app.model.Mongo.EquipmentSignatrue;
  }

  async addUserEquipment(address){
    address = address.toLowerCase();
    let {key,signature} = await this.service.toolService.getKeySignature(address);
    let network = this.ctx.network;
    await this.EquipmentSignatrue_db.create({
      address,
      signature,
      key,
      network
    });
    return this.getUserEquipment(key);
  }

  //监听到领取装备后 修改状态
  async updateUserEquipment(tokenId,key){
    await this.EquipmentSignatrue_db.updateOne({
      key
    }, {
      $set: {
        isUsed:true,
        tokenId
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  //获取装备配置
  async getUserEquipment(key){
    let EquipmentInfo =  await this.EquipmentSignatrue_db.findOne({
      key
    }).lean();
    return EquipmentInfo;
  }

  //获取装备配置
  async getUserEquipmentAll(address){
    let network = this.ctx.network;
    address = address.toLowerCase();
    let EquipmentList =  await this.EquipmentSignatrue_db.find({
      address,
      network
    }).lean();
    for(let key in EquipmentList){
      EquipmentList[key].createTime = moment(EquipmentList[key].createTime).format('YYYY-MM-DD HH:mm:ss');
      EquipmentList[key].updateTime = moment(EquipmentList[key].updateTime).format('YYYY-MM-DD HH:mm:ss');
    }
    return EquipmentList;
  }


  async equipmentFall(address,luckyFactor){
    let propArr = [];
    let gardenerInfo = await this.service.gardenerService.getGardenerUser(address);
    let point = _.get(gardenerInfo,'point',0);
    let totalLuckyFactor = parseFloat(luckyFactor) + parseFloat(point);
    totalLuckyFactor = totalLuckyFactor > 0.5 ? 0.5 :totalLuckyFactor;
    this.ctx.sinfo('equipmentFall',address,{totalLuckyFactor,point,luckyFactor});
    for(let i=1;i<=100;i++){
      if(i<=(parseFloat(totalLuckyFactor)*100)){
        propArr.push(2);
      }else{
        propArr.push(1);
      }
    }
    propArr = _.shuffle(propArr);
    propArr = _.shuffle(propArr);
    let grab = _.sample(propArr);
    if(grab == 2){//掉落装备
      this.ctx.sinfo(address,'掉落装备:',grab);
      return await this.addUserEquipment(address);
    }
    return {};
  }



}
module.exports = EquipmentService;
