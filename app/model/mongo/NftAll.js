const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const NftAll = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    type:{type: String,lowercase: true},
    name: {type: String},
    url: {type: String},
    isUsed:{type:Boolean,default: false},
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

  return mongoose.model('NftAll', NftAll, 'NftAll')
}
