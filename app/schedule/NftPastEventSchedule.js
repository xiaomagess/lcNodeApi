const Subscription = require('egg').Subscription;
const Web3 = require('web3');
const _ = require("lodash");
const ABI = require('../constants/ABI');

class NftPastEventSchedule extends Subscription {
  static get schedule() {
    return {
      cron: '0 */10 * * * *',
      type: 'worker',
      disable:false,
      immediate: true,
    }
  }

  init() {
    this.ctx.chain = 'bsc';
    this.ctx.network = 'BSCTESTNET';
  }

  getRpc() {
    let config = this.app.config[this.ctx.chain];
    let network = config.network.toLowerCase();
    return config[network].http;
  }


  async subscribe() {
    this.init();
    this.airdropBoxPastEvent();
    this.boxPastEvent();
    this.flowerNftPastEvent();
    this.sunTokenPastEvent();
  }


  async airdropBoxPastEvent(){
    this.ctx.linfo("airdropBoxPastEvent-start");
    let AirdropBoxAddress = await this.service.toolService.getContractByName('AirdropBox');
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let latestBlock = await web3.eth.getBlockNumber();
    let startBlock = await this.service.pastEventLogService.getPastEvnetLog(AirdropBoxAddress);
    await  this.doPastEventLog(startBlock,latestBlock,AirdropBoxAddress,'AirdropBox');
    this.ctx.linfo("airdropBoxPastEvent-end",latestBlock);
  }

  async boxPastEvent(){
    this.ctx.linfo("boxPastEvent-start");
    let BoxAddress = await this.service.toolService.getContractByName('Box');
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let latestBlock = await web3.eth.getBlockNumber();
    let startBlock = await this.service.pastEventLogService.getPastEvnetLog(BoxAddress);
    await  this.doPastEventLog(startBlock,latestBlock,BoxAddress,'Box');
    this.ctx.linfo("boxPastEvent-end",latestBlock);
  }

  async flowerNftPastEvent(){
    this.ctx.linfo("flowerNftPastEvent-start");
    let FlowerNftAddress = await this.service.toolService.getContractByName('FlowerNft');
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let latestBlock = await web3.eth.getBlockNumber();
    let startBlock = await this.service.pastEventLogService.getPastEvnetLog(FlowerNftAddress);
    await  this.doPastEventLog(startBlock,latestBlock,FlowerNftAddress,'FlowerNft');
    this.ctx.linfo("flowerNftPastEvent-end",latestBlock);
  }

  async sunTokenPastEvent(){
    this.ctx.linfo("sunTokenPastEvent-start");
    let SunTokenAddress = await this.service.toolService.getContractByName('SunToken');
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let latestBlock = await web3.eth.getBlockNumber();
    let startBlock = await this.service.pastEventLogService.getPastEvnetLog(SunTokenAddress);
    await  this.doPastEventLog(startBlock,latestBlock,SunTokenAddress,'SunToken');
    this.ctx.linfo("sunTokenPastEvent-end",latestBlock);
  }


  //循环抓取历史事件
  async doPastEventLog(startBlock,currentBlock,contractAddress,abiName){
    //获取数据
    let eventData = await this.getMarketPastLog(startBlock,currentBlock,contractAddress,abiName);
    if(!_.isEmpty(eventData)){
      for(let info of eventData){
        await this.service.watchService.watchNftCoin(info);
      }
    }
    //获取最后一次跑批的block
    let lastBatchBlock = await this.service.pastEventLogService.getPastEvnetLog(contractAddress);
    if(lastBatchBlock>=currentBlock){
      return null;
    }else{
      //不是最新当前块 继续调用
      await this.doPastEventLog(lastBatchBlock,currentBlock,contractAddress,abiName);
    }
  }


  /**
   * 查询市场的历史事件
   * @param startBlock
   * @param currentBlock
   * @param increas
   * @param i
   * @returns []
   */
  async getMarketPastLog(startBlock,currentBlock,contractAddress,abiName,increas=1000,i=0){
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let Contract = new web3.eth.Contract(ABI[abiName], contractAddress);
    let endBlock = parseInt(startBlock)+parseInt(increas);
    if(endBlock>=currentBlock){
      endBlock = currentBlock;
    }
    this.ctx.linfo("getMarketPastLog",{startBlock,endBlock});
    try{
      let eventData = await this.web3GetPastEvents(Contract,startBlock,endBlock);
      await this.service.pastEventLogService.doPastEvnetLog({address:contractAddress, fromBlock:startBlock,toBlock: endBlock});
      this.ctx.linfo(_.size(eventData),JSON.stringify(eventData));
      return eventData;
    }catch (e) {
      if(i>=5){
        this.ctx.lerror(`查询市场历史事件fail-彻底失败：address:${contractAddress},params:${JSON.stringify({startBlock,currentBlock,increas,i})}`);
        return null;
      }
      await this.getMarketPastLog(startBlock,currentBlock,contractAddress,abiName,increas,++i);
    }

  }

  //web3 查询历史事件
  async web3GetPastEvents(Contract,startBlock,endBlock){
    return new Promise((resolve, reject) => {
      Contract.getPastEvents('allEvents', {
        fromBlock:startBlock,
        toBlock: endBlock
      }, function(error, events) {
      })
        .then((events) => {
          resolve(events)
        })
        .catch((err) => {
          return reject(false);
        });
    })
  }





}

module.exports = NftPastEventSchedule;
