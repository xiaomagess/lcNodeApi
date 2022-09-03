const Service = require('egg').Service
const _ = require('lodash')


class ContractService extends Service {

  get Connect() {
    return this.app.model.Mongo.Connect
  }

  async addConnect(name,address,rpc){
    let network = this.ctx.network;
    await this.Connect.updateOne({
      name
    },{
      $set:{
        name,
        address,
        rpc,
        network
      }
    },{
      upsert: true,
      setDefaultsOnInsert: true
    });
  }

  //获取白名单签名是否被使用
  async getSignatureUsed(signature){
    const AirdropBox = await this.service.toolService.getTypedContract('AirdropBox');
    let isUsed = await AirdropBox.methods.signatureUsed(signature).call();
    return  isUsed;
  }

  //获取装备签名是否被使用
  async getEquipmentSignatureUsed(signature){
    const FlowerNft = await this.service.toolService.getTypedContract('FlowerNft');
    let isUsed = await FlowerNft.methods.signatureUsed(signature).call();
    return  isUsed;
  }

  //获取提现签名是否被使用
  async getWithDrawSignatureUsed(signature){
    const SunToken = await this.service.toolService.getTypedContract('SunToken');
    let isUsed = await SunToken.methods.signatureUsed(signature).call();
    return  isUsed;
  }

  //获取用户的nft tokenId
  async getUserFlowerNft(address){
    const FlowerNft = await this.service.toolService.getTypedContract('FlowerNft');
    let userNftArr = await FlowerNft.methods.tokensOfOwner(address).call();
    return  userNftArr;
  }


}
module.exports = ContractService;
