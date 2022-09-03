const shortid = require('shortid')

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const GardenerLog = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    address: {type: String,lowercase: true},
    fromBlock: {type: Number},
    toBlock: {type: Number},
    event:{type: String},
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
  })

  return mongoose.model('GardenerLog', GardenerLog, 'GardenerLog')
}
