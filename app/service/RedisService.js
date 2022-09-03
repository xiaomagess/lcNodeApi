const Service = require('egg').Service
class RedisService extends Service {

  //设置挖矿调用锁
  async setRedisDigLock(address){
    address = address.toLowerCase();
    let key_s = "lc_nft:dig:"+address;
    let time = 10;
    let rel =  await this.app.redis.setnx(key_s,'lock');
    if(rel){
      await this.app.redis.expire(key_s,time)
    }
    return rel;
  }

  //删除调用锁
  async delRedisDigLock(address){
    address = address.toLowerCase();
    let key_s = "lc_nft:dig:"+address;
    await this.app.redis.del(key_s);
  }


  //设置提现锁
  async setRedisWithdrawLock(address){
    address = address.toLowerCase();
    let key_s = "lc_nft:withdraw:"+address;
    let time = 10;
    let rel =  await this.app.redis.setnx(key_s,'lock');
    if(rel){
      await this.app.redis.expire(key_s,time)
    }
    return rel;
  }

  //删除提现锁
  async delRedisWithdrawLock(address){
    address = address.toLowerCase();
    let key_s = "lc_nft:withdraw:"+address;
    await this.app.redis.del(key_s);
  }

}
module.exports = RedisService;
