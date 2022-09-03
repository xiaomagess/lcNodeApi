const Service = require('egg').Service
const _ = require('lodash')

class NftImageService extends Service {
  get nft_all_db() {
    return this.app.model.Mongo.NftAll;
  }
  get nft_prd_db() {
    return this.app.model.Mongo.NftPrd;
  }
  get nft_db() {
    return this.app.model.Mongo.Nft;
  }

  async workNft(_type){
    let {_id,type,name,url} = await this.getNftAllInfo(_type);
    await this.upNftAllInfo(_id);
    await this.addNftPrdData(type,name,url);
  }

  async saveData(type,name,url){
    let network = this.ctx.network;
    await this.nft_all_db.updateOne({
      type,
      name,
      network
    }, {
      $set: {
        type,
        name,
        url,
        network
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  async getNftAllInfo(type){
    let network = this.ctx.network;
    let rel =  await this.nft_all_db.findOne({
      type,
      isUsed:false,
      network
    }).lean();
    return rel;
  }

  async upNftAllInfo(id){
    let rel =  await this.nft_all_db.updateOne({
      _id:id,
    },{
      $set: {
        isUsed:true
      }
    });
    return rel;
  }

  async addNftPrdData(type,name,url){
    let network = this.ctx.network;
    await this.nft_prd_db.updateOne({
      type,
      name,
      network
    }, {
      $set: {
        type,
        name,
        url,
        network
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }





}
module.exports = NftImageService;
