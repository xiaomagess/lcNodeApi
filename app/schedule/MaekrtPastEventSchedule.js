const Subscription = require('egg').Subscription;
const Web3 = require('web3');
const _ = require("lodash");
const ABI = require('../constants/ABI');

class MaekrtPastEventSchedule extends Subscription {
  static get schedule() {
    return {
      cron: '0 */10 * * * *',
      type: 'worker',
      disable:false,
      immediate: true,
    };
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
    this.marketPastEvent();
  }


  async marketPastEvent(){
    this.ctx.linfo("marketPastEvent--start");
    let MarketAddress = await this.service.toolService.getContractByName('Market');
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let latestBlock = await web3.eth.getBlockNumber();
    let startBlock = await this.service.pastEventLogService.getPastEvnetLog(MarketAddress);
    await  this.doPastEventLog(startBlock,latestBlock,MarketAddress);
    this.ctx.linfo("marketPastEvent--end",latestBlock);
  }


  async doPastEventLog(startBlock,currentBlock,MarketAddress){
    //获取数据
    let eventData = await this.getMarketPastLog(startBlock,currentBlock,MarketAddress);
    if(!_.isEmpty(eventData)){
      for(let info of eventData){
        await this.service.watchService.watchMarket(info);
      }
    }
    //获取最后一次跑批的block
    let lastBatchBlock = await this.service.pastEventLogService.getPastEvnetLog(MarketAddress);
    if(lastBatchBlock>=currentBlock){
      return null;
    }else{
      //不是最新当前块 继续调用
      await this.doPastEventLog(lastBatchBlock,currentBlock,MarketAddress);
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
  async getMarketPastLog(startBlock,currentBlock,MarketAddress,increas=1000,i=0){
    let provider = new Web3.providers.HttpProvider(this.getRpc());
    let web3 = new Web3(provider);
    let Contract = new web3.eth.Contract(ABI.Market, MarketAddress);
    let endBlock = parseInt(startBlock)+parseInt(increas);
    if(endBlock>=currentBlock){
      endBlock = currentBlock;
    }
    this.ctx.linfo("getMarketPastLog",{startBlock,endBlock});
    try{
      let eventData = await this.web3GetPastEvents(Contract,startBlock,endBlock);
      await this.service.pastEventLogService.doPastEvnetLog({address:MarketAddress, fromBlock:startBlock,toBlock: endBlock});
      return eventData;
    }catch (e) {
      if(i>=5){
        this.ctx.lerror(`查询市场历史事件fail-彻底失败：address:${MarketAddress},params:${JSON.stringify({startBlock,currentBlock,increas,i})}`);
        return null;
      }
      await this.getMarketPastLog(startBlock,currentBlock,increas,++i);
    }

  }

  //web3 查询历史事件
  async web3GetPastEvents(Contract,startBlock,endBlock){
    return new Promise((resolve, reject) => {
      Contract.getPastEvents('allEvents', {
        fromBlock:startBlock,
        toBlock: endBlock
      }, function(error, events) {
        console.log("events",events)
      })
        .then((events) => {
          console.log("event2",events);
          resolve(events)
        })
        .catch((err) => {
          return reject(false);
        });
    })
  }





}

module.exports = MaekrtPastEventSchedule;
