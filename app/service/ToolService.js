const Service = require('egg').Service
const _ = require('lodash')
const Web3 = require('web3')
const ABIs = require('../constants/ABI.json')
const shortid = require('shortid');
const ethers = require('ethers');
const BigNumber = require('bignumber.js');
BigNumber.config({
  EXPONENTIAL_AT: 100,
  DECIMAL_PLACES: 18,
});

class ToolService extends Service {
  get Connect_db() {
    return this.app.model.Mongo.Connect
  }

  web3() {
    let chain = this.ctx.chain || 'bsc';
    let config = this.app.config[chain];
    let network = config.network.toLowerCase();
    const rpcUrl = config[network].http;
    const provider = new Web3.providers.HttpProvider(rpcUrl);
    const web3 = new Web3(provider);
    return web3
  }

  getContract({ name, address}) {
    const web3 = this.web3();
    const ABI = ABIs[name];
    const Contract = new web3.eth.Contract(ABI, address);
    return Contract
  }


  async getTypedContract(name) {
    let network = this.ctx.network;
    const list = await this.Connect_db.findOne({
      name, network
    }).lean();
    let data = {name:_.get(list,'name'),address:_.get(list,'address')};
    return this.getContract(data);
  }


  async getContractByName(name) {
    let network = this.ctx.network;
    const list = await this.Connect_db.findOne({
      name, network
    }).lean();
    return _.get(list,'address');
  }

  async getContractRpcByName(name) {
    let network = this.ctx.network;
    const list = await this.Connect_db.findOne({
      name, network
    }).lean();
    return {address:list.address,rpc:list.rpc};
  }


  async getKeySignature(address){
    const signer = new ethers.Wallet(this.app.config.privateKey);
    let key =  shortid.generate();
    let  message = ethers.utils.solidityPack(["string","address"], [key,address]);
    message = ethers.utils.solidityKeccak256(["bytes"], [message]);
    let  signature = await signer.signMessage(ethers.utils.arrayify(message));
    return {key,signature};
  }


  async getWithDrawKeySignature(address,amount){
    amount = new BigNumber(amount*1e18).toString();
    const signer = new ethers.Wallet(this.app.config.privateKey);
    let key =  shortid.generate();
    let  message = ethers.utils.solidityPack(["uint256","string","address"], [amount,key,address]);
    message = ethers.utils.solidityKeccak256(["bytes"], [message]);
    let  signature = await signer.signMessage(ethers.utils.arrayify(message));
    return {key,signature};
  }

  //验证前端用户的签名
  checkUserSignature(address,msg,receipte){
    try{
      let web3 = this.web3();
      let r = receipte.slice(0, 66);
      let s = '0x' + receipte.slice(66, 130);
      let v = '0x' + receipte.slice(130, 132);
      let signAddress = web3.eth.accounts.recover(msg,v,r,s);
      this.ctx.sinfo({signAddress,address});
      if(signAddress.toLowerCase() == address.toLowerCase()){
        return true;
      }
      return false;
    }catch (e) {
      return false;
    }


  }



}
module.exports = ToolService;
