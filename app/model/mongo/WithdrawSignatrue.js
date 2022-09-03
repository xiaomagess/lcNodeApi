const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const WithDrawSignatrue = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    address:{type: String},
    signature:{type: String},
    key:{type: String},
    amount:{type:Number},
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

  return mongoose.model('WithDrawSignatrue', WithDrawSignatrue, 'WithDrawSignatrue')
}
