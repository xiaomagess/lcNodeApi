const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const Nft = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    tokenId:{type: Number,unique: true,required: true},
    level:{type: Number},
    enable:{type:Boolean,default: false},
    type:{type: String,lowercase: true},
    name: {type: String},
    url: {type: String},
    endLifeCycle: { type: Date},
    startMiningTime: { type: Date},
    endMiningTime: { type: Date},
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

  return mongoose.model('Nft', Nft, 'Nft')
}
