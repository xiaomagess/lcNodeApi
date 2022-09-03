const Subscription = require('egg').Subscription;
const Web3 = require('web3');
const _ = require("lodash");
const Web3WsProvider = require('web3-providers-ws');
const ABI = require('../constants/ABI');

const options = {
  timeout: 30000, // ms

  clientConfig: {
    // Useful if requests are large
    maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
    maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60000 // ms
  },

  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 500,
    onTimeout: false
  }
};

class WatchMarketSchedule extends Subscription {
  static get schedule() {
    return {
      immediate: true,
      type: 'worker',
      disable:false,
    };
  }

  init() {
    this.ctx.chain = 'bsc';
    this.ctx.network = 'BSCTESTNET';
  }

  getWsRpc() {
    let config = this.app.config[this.ctx.chain];
    let network = config.network.toLowerCase();
    return config[network].wsshttp;
  }


  async subscribe() {
    this.init();
    this.MarketEvents();
  }


  //监听市场sale cancel buy
  async MarketEvents() {
    let {address,rpc} = await this.service.toolService.getContractRpcByName('Market');
    let wsProvider = new Web3WsProvider(rpc, options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.Market, address);
    let latestBlock = await web3.eth.getBlockNumber();
    let fromBlock =  parseInt(latestBlock)-10;
    this.ctx.linfo('MarketEvents-latestBlock 监听开始:', latestBlock, address);
    let subscription = Contract.events.allEvents({
      fromBlock:fromBlock,
      toBlock: 'latest'
    }, (error, event) => {
      this.ctx.linfo('MarketEvents- error:', error);
    })
      .on('data', result => {
        this.ctx.linfo('MarketEvents- ondata:', JSON.stringify(result));
        this.service.watchService.watchMarket(result);
      })
      .on('changed', result => {
        this.ctx.linfo('MarketEvents- onchanged:', result);
      })
      .on('error', result => {
        this.ctx.linfo('MarketEvents- error:', result);
      });
    this.ctx.linfo('MarketEvents- success:');
  }

  //监听市场出售nft
  async MarketSale() {
    let MarketAddress = await this.service.toolService.getContractByName('Market');
    let wsProvider = new Web3WsProvider(this.getWsRpc(), options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.Market, MarketAddress);
    let latestBlock = await web3.eth.getBlockNumber();
    this.ctx.linfo('MarketSale-latestBlock 监听开始:', latestBlock, MarketAddress);
    let subscription = Contract.events.Sale({
      fromBlock: 'latest'
    }, (error, event) => {
      this.ctx.linfo('MarketSale- error:', error);
    })
      .on('data', result => {
        this.ctx.linfo('MarketSale- ondata:', result);
        let eventData = result.returnValues;
        let { seller, tokenId, price } = eventData;
        // this.service.watchService.watchSale(seller, tokenId, price);
      })
      .on('changed', result => {
        this.ctx.linfo('MarketSale- onchanged:', result);
      })
      .on('error', result => {
        this.ctx.linfo('MarketSale- error:', result);
      });
    this.ctx.linfo('MarketSale- success:', subscription);
  }

  //监听市场取消出售nft
  async MarketCancel() {
    let MarketAddress = await this.service.toolService.getContractByName('Market');
    let web3 = new Web3(new Web3.providers.WebsocketProvider(this.getWsRpc()));
    let Contract = new web3.eth.Contract(ABI.Market, MarketAddress);
    let latestBlock = await web3.eth.getBlockNumber();
    this.ctx.linfo('MarketCancel-latestBlock 监听开始:', latestBlock, MarketAddress);
    let subscription = Contract.events.Cancel({
      fromBlock: 'latest'
    }, (error, event) => {
      this.ctx.linfo('MarketCancel- error:', error);
    })
      .on('data', result => {
        this.ctx.linfo('MarketCancel- ondata:', result);
        let eventData = result.returnValues;
        let { seller, tokenId } = eventData;
        this.service.watchService.watchCancel(seller, tokenId);
      })
      .on('changed', result => {
        this.ctx.linfo('MarketCancel- onchanged:', result);
      })
      .on('error', result => {
        this.ctx.linfo('MarketCancel- error:', result);
      });
    this.ctx.linfo('MarketCancel- success:', subscription);
  }


  //监听市场购买nft
  async MarketBuy() {
    let MarketAddress = await this.service.toolService.getContractByName('Market');
    let web3 = new Web3(new Web3.providers.WebsocketProvider(this.getWsRpc()));
    let Contract = new web3.eth.Contract(ABI.Market, MarketAddress);
    let latestBlock = await web3.eth.getBlockNumber();
    this.ctx.linfo('MarketBuy-latestBlock 监听开始:', latestBlock, MarketAddress);
    let subscription = Contract.events.Buy({
      fromBlock: 'latest'
    }, (error, event) => {
      this.ctx.linfo('MarketBuy- error:', error);
    })
      .on('data', result => {
        this.ctx.linfo('MarketBuy- ondata:', result);
        let eventData = result.returnValues;
        let { buyer, seller, tokenId } = eventData;
        this.service.watchService.watchBuy(buyer, seller, tokenId);
      })
      .on('changed', result => {
        this.ctx.linfo('MarketBuy- onchanged:', result);
      })
      .on('error', result => {
        this.ctx.linfo('MarketBuy- error:', result);
      });
    this.ctx.linfo('MarketBuy- success:', subscription);
  }


}

module.exports = WatchMarketSchedule;
