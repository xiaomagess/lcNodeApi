const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const NftConfig = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    type:{type: String,lowercase: true},
    levelBetween:{type: Array},
    lifeCycle:{type: Number},
    baseProduction:{type: Number},
    intervalTime:{type: Number},
    luckyFactor:{type: Number},
    price:{type: Number},
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

  return mongoose.model('NftConfig', NftConfig, 'NftConfig')
}
