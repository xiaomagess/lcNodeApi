const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const Market = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    seller_address: {type: String}, //出售的用户
    tokenId:{type: Number}, //出售的ndt id
    type:{type: String,lowercase: true},//nft 类型
    price:{type: Number, default: 0},//出售价格
    buyer_address: {type: String}, //购买的用户
    status: {
      type: Number,
      default: 0 //0 - 出售中 1 - 已成交  2 -取消
    },
    network: {type: String, uppercase: true},
    createTime: {
      type: Date,
      default: Date.now
    },
    updateTime: {
      type: Date,
      default: Date.now
    }
  }, {
    versionKey : false,
    timestamps: { createdAt:'createTime', updatedAt:'updateTime'}
  });

  return mongoose.model('Market', Market, 'Market')
}
