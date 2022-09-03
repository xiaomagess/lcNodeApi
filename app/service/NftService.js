const Service = require('egg').Service
const _ = require('lodash')
const moment = require('moment');
class NftService extends Service {

  get Nft_db() {
    return this.app.model.Mongo.Nft;
  }

  get Nft_prd_db() {
    return this.app.model.Mongo.NftPrd;
  }


  get NftConfig_db() {
    return this.app.model.Mongo.NftConfig;
  }

  //监听到开盲盒后 生成个nft
  async workNftPrdToNft(address,tokenId){
    let nftInfo = await this.getNftData(tokenId);
    if(!_.isEmpty(nftInfo)){
      this.ctx.linfo("workNftPrdToNft:",tokenId,"已存在");
      return;
    }
    //从预选的nft中随机选取一个
    let {_id,type,name,url} = await this.getNftPrdInfo();
    //修改成已经选取状态
    await this.upNftPrdInfo(_id);
    //等级
    let proportionBetween = { 'uncommon':[1,9], 'rare':[10,19], 'epic':[20,29], 'legendary':[30,39], };
    let levelStart = proportionBetween[type][0];
    let levelEnd = proportionBetween[type][1];
    let level = _.random(levelStart,levelEnd);
    await this.addNftData(type,name,url,level,tokenId);
  }

  //监听到领取装备后 生成个nft
  async workReciveMint(address,tokenId,key){
    let nftInfo = await this.getNftData(tokenId);
    if(!_.isEmpty(nftInfo)){
      this.ctx.linfo("workNftPrdToNft:",tokenId,"已存在");
      return;
    }
    //从预选的nft中随机选取一个
    let {_id,type,name,url} = await this.getNftPrdInfo();
    //修改成已经选取状态
    await this.upNftPrdInfo(_id);
    //等级
    let proportionBetween = { 'uncommon':[1,9], 'rare':[10,19], 'epic':[20,29], 'legendary':[30,39], };
    let levelStart = proportionBetween[type][0];
    let levelEnd = proportionBetween[type][1];
    let level = _.random(levelStart,levelEnd);
    await this.addNftData(type,name,url,level,tokenId);
    await this.service.equipmentService.updateUserEquipment(tokenId,key);
  }

  //监听繁殖后 生成个nft
  async workBreed(address, tokenfId, tokenmId,tokenId){
    let nftInfo = await this.getNftData(tokenId);
    if(!_.isEmpty(nftInfo)){
      this.ctx.linfo("workNftPrdToNft:",tokenId,"已存在");
      return;
    }
    //从预选的nft中随机选取一个
    let {_id,type,name,url} = await this.getNftPrdInfo();
    //修改成已经选取状态
    await this.upNftPrdInfo(_id);
    //等级
    let proportionBetween = { 'uncommon':[1,9], 'rare':[10,19], 'epic':[20,29], 'legendary':[30,39], };
    let levelStart = proportionBetween[type][0];
    let levelEnd = proportionBetween[type][1];
    let level = _.random(levelStart,levelEnd);
    await this.addNftData(type,name,url,level,tokenId);
  }



  async getNftPrdInfo(){
    let network = this.ctx.network;
    let rel =  await this.Nft_prd_db.findOne({
      isUsed:false,
      network
    }).lean();
    return rel
  }

  async upNftPrdInfo(id){
    let rel =  await this.Nft_prd_db.updateOne({
      _id:id,
    },{
      $set: {
        isUsed:true
      }
    });
    return rel;
  }

  //查看是否已经open有nft了
  async getNftData(tokenId){
    let network = this.ctx.network;
    return  this.Nft_db.findOne({tokenId,network}).lean();
  }

  async addNftData(type,name,url,level,tokenId){
    let network = this.ctx.network;
    await this.Nft_db.updateOne({
      type,
      name,
      tokenId,
      network
    }, {
      $set: {
        type,
        name,
        url,
        level,
        tokenId,
        network
      }
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }


  //添加nft配置
  async addNftConfig(data){
    let network = this.ctx.network;
    data['network'] = network;
    await this.NftConfig_db.updateOne({
      type:data.type,
      network
    }, {
      $set: data
    }, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  //获取nft配置
  async getNftConfig(type){
    let network = this.ctx.network;
    let nftConfig =  await this.NftConfig_db.findOne({
      type,network
    }).lean();
    return nftConfig;
  }

  //获取nft配置
  async getNftInfo(tokenId){
    let network = this.ctx.network;
    let nftInfo =  await this.Nft_db.findOne({
      tokenId,network
    }).lean();
    return this.formatInfoData(nftInfo);
  }

  async nftInfoMore(tokenIds){
    let network = this.ctx.network;
    let nftRel =  await this.Nft_db.find({
      tokenId:{
        $in:tokenIds,
      },
      network
    }).lean();

    for(let key in nftRel){
      let type = _.get(nftRel[key],'type');
      nftRel[key] = this.formatInfoData(nftRel[key]);
      let nftConfig = await this.service.nftService.getNftConfig(type);
      let lifeCycle = _.get(nftConfig,'lifeCycle',0);
      nftRel[key].lifeCycle = lifeCycle;
    }
    return nftRel;
  }


  //获取nft配置
  async updateNft(tokenId,data){
    let network = this.ctx.network;
    data['network'] = network;
    await this.Nft_db.update({
      tokenId,network
    }, {
      $set: data
    });
    return this.getNftInfo(tokenId);
  }

  formatInfoData(info){
    let enable = _.get(info,'enable',false);
    if(enable){
      info.endLifeCycle = moment(info.endLifeCycle).format('YYYY-MM-DD HH:mm:ss');
      info.startMiningTime = moment(info.startMiningTime).format('YYYY-MM-DD HH:mm:ss');
      info.endMiningTime = moment(info.endMiningTime).format('YYYY-MM-DD HH:mm:ss');
    }
    return info;
  }


}
module.exports = NftService;
