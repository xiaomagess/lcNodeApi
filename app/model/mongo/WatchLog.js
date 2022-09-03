const shortid = require('shortid');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const WatchLog = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    address:{type: String,lowercase: true},
    event:{type: String,lowercase: true},
    transactionHash:{type: String,lowercase: true},
    signature:{type: String,lowercase: true},
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

  return mongoose.model('WatchLog', WatchLog, 'WatchLog')
}
