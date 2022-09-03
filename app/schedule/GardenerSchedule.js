const Subscription = require('egg').Subscription;
const _ = require('lodash');
const keccak256 = require('keccak256');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const web3SolidityEvent  = require('@truffle/contract');
const gardenerAbi = [ { "inputs": [ { "internalType": "contract LockToken", "name": "_govToken", "type": "address" }, { "internalType": "address", "name": "_devaddr", "type": "address" }, { "internalType": "address", "name": "_liquidityaddr", "type": "address" }, { "internalType": "address", "name": "_comfundaddr", "type": "address" }, { "internalType": "address", "name": "_founderaddr", "type": "address" }, { "internalType": "uint256", "name": "_rewardPerBlock", "type": "uint256" }, { "internalType": "uint256", "name": "_startBlock", "type": "uint256" }, { "internalType": "uint256", "name": "_halvingAfterBlock", "type": "uint256" }, { "internalType": "uint256", "name": "_userDepFee", "type": "uint256" }, { "internalType": "uint256", "name": "_devDepFee", "type": "uint256" }, { "internalType": "uint256[]", "name": "_rewardMultiplier", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "_blockDeltaStartStage", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "_blockDeltaEndStage", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "_userFeeStage", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "_devFeeStage", "type": "uint256[]" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "EmergencyWithdraw", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "lockAmount", "type": "uint256" } ], "name": "SendGovernanceTokenReward", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "FINISH_BONUS_AT_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "HALVING_AT_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_FOR_COM", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_FOR_DEV", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_FOR_FOUNDERS", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERCENT_FOR_LP", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "PERCENT_LOCK_BONUS_REWARD", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "REWARD_MULTIPLIER", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "REWARD_PER_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "START_BLOCK", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "contract IERC20", "name": "_lpToken", "type": "address" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" } ], "name": "add", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_toAdd", "type": "address" } ], "name": "addAuthorized", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "authorized", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "blockDeltaEndStage", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "blockDeltaStartStage", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newFinish", "type": "uint256" } ], "name": "bonusFinishUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" } ], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_pids", "type": "uint256[]" } ], "name": "claimRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newCom", "type": "address" } ], "name": "comUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "comfundaddr", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_ref", "type": "address" } ], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_devaddr", "type": "address" } ], "name": "dev", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "devDepFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "devFeeStage", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "devaddr", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" } ], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newFounder", "type": "address" } ], "name": "founderUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "founderaddr", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getGlobalAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getGlobalRefAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" } ], "name": "getLockPercentage", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" } ], "name": "getMultiplier", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "pid1", "type": "uint256" } ], "name": "getNewRewardPerBlock", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_from", "type": "uint256" }, { "internalType": "uint256", "name": "_to", "type": "uint256" }, { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" } ], "name": "getPoolReward", "outputs": [ { "internalType": "uint256", "name": "forDev", "type": "uint256" }, { "internalType": "uint256", "name": "forFarmer", "type": "uint256" }, { "internalType": "uint256", "name": "forLP", "type": "uint256" }, { "internalType": "uint256", "name": "forCom", "type": "uint256" }, { "internalType": "uint256", "name": "forFounders", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "address", "name": "_user2", "type": "address" } ], "name": "getRefValueOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getTotalRefs", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "govToken", "outputs": [ { "internalType": "contract LockToken", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "halvingAtBlock", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_newHalving", "type": "uint256[]" } ], "name": "halvingUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "liquidityaddr", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_newlock", "type": "uint256[]" } ], "name": "lockUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newcomlock", "type": "uint256" } ], "name": "lockcomUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newdevlock", "type": "uint256" } ], "name": "lockdevUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newfounderlock", "type": "uint256" } ], "name": "lockfounderUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newlplock", "type": "uint256" } ], "name": "locklpUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newLP", "type": "address" } ], "name": "lpUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "massUpdatePools", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "mingWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" } ], "name": "pendingReward", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "name": "poolExistence", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "poolId1", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "poolInfo", "outputs": [ { "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "total", "type": "uint256" }, { "internalType": "uint256", "name": "accGovTokenPerShare", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "poolLength", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_newOwner", "type": "address" } ], "name": "reclaimTokenOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_toRemove", "type": "address" } ], "name": "removeAuthorized", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_block", "type": "uint256" } ], "name": "reviseDeposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_block", "type": "uint256" } ], "name": "reviseWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_newMulReward", "type": "uint256[]" } ], "name": "rewardMulUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "rewardMultiplier", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newReward", "type": "uint256" } ], "name": "rewardUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" } ], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_devDepFees", "type": "uint256" } ], "name": "setDevDepFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_devFees", "type": "uint256[]" } ], "name": "setDevFeeStage", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_blockEnds", "type": "uint256[]" } ], "name": "setStageEnds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_blockStarts", "type": "uint256[]" } ], "name": "setStageStarts", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_usrDepFees", "type": "uint256" } ], "name": "setUserDepFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256[]", "name": "_userFees", "type": "uint256[]" } ], "name": "setUserFeeStage", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_newstarblock", "type": "uint256" } ], "name": "starblockUpdate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalAllocPoint", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" } ], "name": "updatePool", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "usdOracle", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" } ], "name": "userDelta", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "userDepFee", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userFeeStage", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "userGlobalInfo", "outputs": [ { "internalType": "uint256", "name": "globalAmount", "type": "uint256" }, { "internalType": "uint256", "name": "totalReferals", "type": "uint256" }, { "internalType": "uint256", "name": "globalRefAmount", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" } ], "name": "userInfo", "outputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebtAtBlock", "type": "uint256" }, { "internalType": "uint256", "name": "lastWithdrawBlock", "type": "uint256" }, { "internalType": "uint256", "name": "firstDepositBlock", "type": "uint256" }, { "internalType": "uint256", "name": "blockdelta", "type": "uint256" }, { "internalType": "uint256", "name": "lastDepositBlock", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_ref", "type": "address" } ], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
const gardenerAddress = "0x3c9d0D2f8f82FC80aD402BA2faa671eE74d1c71D";
/**
 * 该跑批是 跑 fsn 用户触发过指定的mint事件 的日志记录
 * 然后筛选出借过的用户address 更新其负流动性 清算用
 **/
class GardenerSchedule extends Subscription {
  static get schedule() {
    return {
      cron: '0 0/10 * * * *',
      type: 'worker',
      disable:true,
      immediate: true,
    }
  }
  chainId(){
    return 'bsc';
  }

  getNewWork(){
    let config =  this.app.config[this.chainId()];
    return config.network.toUpperCase();
  }

  web3() {
    // const rpcUrl = 'https://bsc-dataseed1.binance.org';
    const rpcUrl = 'https://bsc-dataseed4.defibit.io';
    const provider = new Web3.providers.HttpProvider(rpcUrl);
    const web3 = new Web3(provider);
    return web3
  }

  gardenerConnect(){
    const web3 = this.web3();
    const Contract = new web3.eth.Contract(gardenerAbi, gardenerAddress);
    return Contract
  }

  async subscribe() {
    this.ctx.chain = this.chainId();
    this.ctx.network = this.getNewWork();
    this.ctx.index = 1;
    this.ctx.eventName = "deposit";

    let currentBlock = await this.getCurrentBlock();
    this.logInfo(`日志跑批开始:currentBlock--->${currentBlock}`);

    let startBlock =  17132200 +  3600 * 24 / 3;
    let lastBatchBlock = await this.getLogLastBlock(gardenerAddress);
    startBlock = lastBatchBlock>0 ? lastBatchBlock : startBlock ;
    //获取该市场下的所有操作记录
    await this.getMarkertBlockLog(gardenerAddress,startBlock,currentBlock);
    this.logInfo(`日志跑批完毕:currentBlock--->${currentBlock}`);


    await this.gardenerUserPoint();
    this.logInfo(`更新用户比例完毕:currentBlock--->${currentBlock}`);
  }

  /**
   * 计算用户在gaedener池子的存钱的比例
   * @returns {Promise<void>}
   */
  async gardenerUserPoint(){
    let connect = this.gardenerConnect();
    let poolInfo = await connect.methods.poolInfo(0).call();
    let pool_amount = poolInfo.total;
    let depositUser = await this.getGardenerUserDb();
    let num = 0;
    for(let info of depositUser){
      let address = info.address;
      let userInfo = await connect.methods.userInfo(0,address).call();
      let user_amount = userInfo.amount;
      let point =  new BigNumber(user_amount).dividedBy(pool_amount).toFixed(4);
      console.log(address,user_amount,point);
      await this.saveGardenerUserAmountDb(address,{user_amount,pool_amount,point});
      num+= parseFloat(point);
    }
    console.log('num',num)
  }


  /**
   * 获取当前市场的所有的用户操作日志
   * @param markAddress
   * @param startBlock
   * @param currentBlock
   * @returns {Promise<null>}
   */
  async getMarkertBlockLog(markAddress,startBlock,currentBlock){
    //获取数据
    let logData = await this.getBlockLogApi(markAddress,startBlock,currentBlock);
    if(!_.isEmpty(logData)){
      //日志解析对象
      let Web3SolidityEvent = this.getWeb3SolidityEvent();
      for(let info of logData){
        let logDecode =    Web3SolidityEvent.decodeLogs([info]);
        let event = _.get(logDecode[0],'event');
        if(event && event.toLowerCase() == this.ctx.eventName){
          let userAddress = _.get(logDecode[0],'args[0]','');
          console.log("event.toLowerCase()",event.toLowerCase(),userAddress);
          //把借的用户存起来
          await this.saveGardenerUserDb(userAddress);
        }
      }
    }
    //获取最后一次跑批的block
    let lastBatchBlock = await this.getLogLastBlock(markAddress);
    if(lastBatchBlock>=currentBlock){
      return null;
    }else{
      //不是最新当前块 继续调用
      await this.getMarkertBlockLog(markAddress,lastBatchBlock,currentBlock);
    }
  }


  /**
   *
   * @param address
   * @param startBlock
   * @param currentBlock
   * @param increas  递增索引 默认1000
   * @param i       失败递归查询次数 最多5次
   * @returns {Promise<null|Log[]>}
   */
  async getBlockLogApi(address,startBlock,currentBlock,increas=1000,i=0){
    const web3 = this.web3();
    let topic0 = this.getTopideposit();
    let endBlock = parseInt(startBlock)+parseInt(increas);
    if(endBlock>=currentBlock){
      endBlock = currentBlock;
    }
    let params ={
      'address':address,
      "topics":[topic0],
      "fromBlock": startBlock,
      "toBlock": endBlock
    };
    let paramsClo = _.cloneDeep(params);
    try {
      let response = await  web3.eth.getPastLogs(params);
      paramsClo['num'] = _.size(response);
      this.logInfo(`查询success：address:${address},params:${JSON.stringify(paramsClo)}`);
      await this.saveLogRelDb(paramsClo);
      return response;
    }catch (e) {
      if(e.message == 'Returned error: query returned more than 10000 results'){
        if(i>=5){
          paramsClo['type'] = 2;
          await this.saveLogRelDb(paramsClo);
          this.pushFailLogRedis(paramsClo);
          this.logError(`查询fail-彻底失败：address:${address},params:${JSON.stringify(paramsClo)}`);
          return null;
        }
        this.logError(`查询fail-继续尝试：address:${address},params:${JSON.stringify(paramsClo)}-尝试次数:${i}`);
        increas = parseInt(increas)/2;
        await this.getBlockLogApi(address,startBlock,currentBlock,increas,++i);
      }
    }
  }


  get GardenerLog(){
    return this.app.model.Mongo.GardenerLog;
  }


  get GardenerUser(){
    return this.app.model.Mongo.GardenerUser;
  }



  //获取 当前address 最后的一次数据跑批
  async getLogLastBlock(address){
    let network = this.ctx.network;
    let data =  await this.GardenerLog.findOne({
      address,network,event:this.ctx.eventName
    });
    return _.get(data,'toBlock',0);
  }

  //保存跑批结果到日志
  async saveLogRelDb(data){
    let network = this.ctx.network;
    let type = _.get(data,'type',1);
    data['topics'] = _.get(data['topics'],'0');
    data['network'] = network;
    data['event'] = this.ctx.eventName;
    if(type==1){
      let address = _.get(data,'address');
      await this.GardenerLog.updateOne({
        network,
        address,
        event:this.ctx.eventName,
      },{
        $set:data
      },{
        upsert: true,
        setDefaultsOnInsert: true,
      });
    }else{
      await this.GardenerLog.create(data);
    }
  }

  //gardener保存despot行为的用户到db
  async saveGardenerUserDb(userAddress){
    if(!userAddress)return;
    userAddress = userAddress.toLowerCase();
    let network = this.ctx.network;
    await this.GardenerUser.updateOne({
      network,
      address:userAddress,
      event:this.ctx.eventName,
      index:this.ctx.index
    },{
      $set:{
        address:userAddress,
        event:this.ctx.eventName,
        index:this.ctx.index,
        network
      }
    },{
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  //gardener保存despot amount
  async saveGardenerUserAmountDb(userAddress,data){
    if(!userAddress)return;
    let network = this.ctx.network;
    await this.GardenerUser.updateOne({
      network,
      address:userAddress,
      event:this.ctx.eventName,
      index:this.ctx.index
    },{
      $set:data
    },{
      upsert: true,
      setDefaultsOnInsert: true,
    });
  }

  //获取存取的gaedener的用户
  async getGardenerUserDb(){
    let network = this.ctx.network;
    let list = await this.GardenerUser.find({network, event:this.ctx.eventName,index:this.ctx.index}).lean();
    return list;
  }


  //当前块
  async getCurrentBlock(){
    const web3 = this.web3();
    let currentBlock =  await web3.eth.getBlockNumber();
    await this.setCurrentRedis(currentBlock);
    return currentBlock;
  }

  //把当前块设置到redis里面
  async setCurrentRedis(currentBlock){
    let key = 'batch_gardener_current_block_'+this.ctx.chain;
    await this.app.redis.set(key,currentBlock);
    this.app.redis.expire(key,300)
  }



  //把当前更新失败的log 保存起来
  async pushFailLogRedis(data){
    let key = 'gardener_block_log_error'+this.ctx.chain;
    if(_.isObject(data)){
      data = JSON.stringify(data);
    }
    await this.app.redis.lpush(key,data);
  }

  getTopideposit(){
    let topic0 = '0x'+keccak256('Deposit(address,uint256,uint256)').toString('hex');
    return topic0;
  }


  //获取解析log的对象
  getWeb3SolidityEvent(){
    let abiMtoken = gardenerAbi;
    let Web3SolidityEvent = web3SolidityEvent({abi:abiMtoken});
    return Web3SolidityEvent;
  }

  logInfo(info){
    this.ctx.linfo(info);
  }

  logError(info){
    this.ctx.lerror(info);
  }
}
module.exports = GardenerSchedule;
