const Subscription = require('egg').Subscription;
const Web3 = require('web3');
const Web3WsProvider = require('web3-providers-ws');
const ABI = require('../constants/ABI');

const  options = {
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
class WatchNftSchedule extends Subscription {
  static get schedule() {
    return {
      immediate: true,
      disable:false,
      type: 'worker',
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
    this.ClaimAirdrop();
    this.OpenBox();
    this.flowerNftEvent();
    // this.ReceiveMint();
    // this.Breed();
    this.ReceiveToken();
  }

  //监听领取白名单领取盲盒
  async ClaimAirdrop() {
    let {address,rpc} = await this.service.toolService.getContractRpcByName('AirdropBox');
    let wsProvider = new Web3WsProvider(rpc, options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.AirdropBox, address);
    let latestBlock = await web3.eth.getBlockNumber();
    let fromBlock =  parseInt(latestBlock)-10;
    this.ctx.linfo('ClaimAirdrop-latestBlock 监听开始:',fromBlock, latestBlock, address);
    let subscription = Contract.events.ClaimAirdrop({
      fromBlock:fromBlock,
      toBlock: 'latest'
    }, function(error, event) {
    })
      .on('data', result => {
        this.ctx.linfo('ClaimAirdrop- ondata:', JSON.stringify(result));
        this.service.watchService.watchNftCoin(result);
      })
      .on('changed', result => {
        this.ctx.linfo('ClaimAirdrop- changed:', result);
      })
      .on('error', result => {
        this.ctx.linfo('ClaimAirdrop- error:', result);
      });
    this.ctx.linfo('ClaimAirdrop- success:');
  }

  //监听打开盲盒
  async OpenBox() {
    let {address,rpc} = await this.service.toolService.getContractRpcByName('Box');
    let wsProvider = new Web3WsProvider(rpc, options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.Box, address);
    let latestBlock = await web3.eth.getBlockNumber();
    let fromBlock =  parseInt(latestBlock)-10;
    this.ctx.linfo('OpenBox-latestBlock 监听开始:',fromBlock, latestBlock, address);
    let subscription = Contract.events.OpenBox({
      fromBlock:fromBlock,
      toBlock: 'latest'
    }, function(error, event) {
    })
      .on('data', result => {
        this.ctx.linfo('Openbox- ondata:', JSON.stringify(result));
        this.service.watchService.watchNftCoin(result);
      })
      .on('changed', result => {
        this.ctx.linfo('Openbox- changed:', result);
      })
      .on('error', result => {
        this.ctx.linfo('Openbox- error:', result);
      });

    this.ctx.linfo('Openbox- success:');
  }

  async flowerNftEvent(){
    let {address,rpc} = await this.service.toolService.getContractRpcByName('FlowerNft');
    let wsProvider = new Web3WsProvider(rpc, options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.FlowerNft, address);
    let latestBlock = await web3.eth.getBlockNumber();
    let fromBlock =  parseInt(latestBlock)-10;
    this.ctx.linfo('flowerNftEvent-latestBlock 监听开始:',fromBlock ,latestBlock, address);
    let subscription = Contract.events.allEvents({
      fromBlock:fromBlock,
      toBlock: 'latest'
    }, function(error, event){
    }).on('data', result => {
      this.ctx.linfo('flowerNftEvent- ondata:', JSON.stringify(result));
      this.service.watchService.watchNftCoin(result);
    }).on('changed', result => {
      this.ctx.linfo('flowerNftEvent- changed:', result);
    }).on('error', result => {
      this.ctx.linfo('flowerNftEvent- error:', result);
    });
    this.ctx.linfo('flowerNftEvent- success:');
  }


  //监听领取币
  async  ReceiveToken(){
    let {address,rpc} = await this.service.toolService.getContractRpcByName('SunToken');
    let wsProvider = new Web3WsProvider(rpc, options);
    let web3 = new Web3(wsProvider);
    let Contract = new web3.eth.Contract(ABI.SunToken, address);
    let latestBlock = await web3.eth.getBlockNumber();
    let fromBlock =  parseInt(latestBlock)-10;
    this.ctx.linfo('ReceiveToken-latestBlock 监听开始:',fromBlock, latestBlock, address);
    let subscription = Contract.events.ReceiveToken({
      fromBlock:fromBlock,
      toBlock: 'latest'
    }, function(error, event){
    }).on('data', result => {
      this.ctx.linfo('ReceiveToken- ondata:', JSON.stringify(result));
      this.service.watchService.watchNftCoin(result);
    }).on('changed', result => {
      this.ctx.linfo('ReceiveToken- changed:', result);
    }).on('error', result => {
      this.ctx.linfo('ReceiveToken- error:', result);
    });
    this.ctx.linfo('ReceiveToken- success:');
  }



  // //监听领取装备
  // async  ReceiveMint() {
  //   let FlowerNftAddress = await this.service.toolService.getContractByName('FlowerNft');
  //   let wsProvider = new Web3WsProvider(this.getWsRpc(), options);
  //   let web3 = new Web3(wsProvider);
  //   let Contract = new web3.eth.Contract(ABI.FlowerNft, FlowerNftAddress);
  //   let latestBlock = await web3.eth.getBlockNumber();
  //   let fromBlock =  parseInt(latestBlock)-10;
  //   this.ctx.linfo('ReceiveMint-latestBlock 监听开始:',fromBlock ,latestBlock, FlowerNftAddress);
  //   let subscription = Contract.events.ReceiveMint({
  //     fromBlock:fromBlock,
  //     toBlock: 'latest'
  //   }, function(error, event){
  //   }).on('data', result => {
  //     this.ctx.linfo('ReceiveMint- ondata:', JSON.stringify(result));
  //     this.service.watchService.watchNftCoin(result);
  //   }).on('changed', result => {
  //     this.ctx.linfo('ReceiveMint- changed:', result);
  //   }).on('error', result => {
  //     this.ctx.linfo('ReceiveMint- error:', result);
  //   });
  //   this.ctx.linfo('ReceiveMint- success:');
  // }
  //
  // //监听繁殖
  // async  Breed(){
  //   let FlowerNftAddress = await this.service.toolService.getContractByName('FlowerNft');
  //   let wsProvider = new Web3WsProvider(this.getWsRpc(), options);
  //   let web3 = new Web3(wsProvider);
  //   let Contract = new web3.eth.Contract(ABI.FlowerNft, FlowerNftAddress);
  //   let latestBlock = await web3.eth.getBlockNumber();
  //   let fromBlock =  parseInt(latestBlock)-10;
  //   this.ctx.linfo('Breed-latestBlock 监听开始:',fromBlock ,latestBlock, FlowerNftAddress);
  //   let subscription = Contract.events.Breed({
  //     fromBlock:fromBlock,
  //     toBlock: 'latest'
  //   }, function(error, event){
  //   }).on('data', result => {
  //     this.ctx.linfo('Breed- ondata:', JSON.stringify(result));
  //     this.service.watchService.watchNftCoin(result);
  //   }).on('changed', result => {
  //     this.ctx.linfo('Breed- changed:', result);
  //   }).on('error', result => {
  //     this.ctx.linfo('Breed- error:', result);
  //   });
  //   this.ctx.linfo('Breed- success:');
  // }




}

module.exports = WatchNftSchedule;
