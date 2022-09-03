const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const GardenerUser = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    event:{type: String},
    index:{type: Number},
    address:{
      type: String,
      get: v => v ? v.toLowerCase() : '',
      set: v => v ? v.toLowerCase() : '',
    },
    user_amount:{type: Number},
    pool_amount:{type: Number},
    point:{type: Number},
    network: {type: String, uppercase: true,},
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

  return mongoose.model('GardenerUser', GardenerUser, 'GardenerUser')
}
