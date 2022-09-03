const shortid = require('shortid')

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const Connect = new Schema({
    _id: {
      type: String,
      default: shortid.generate
    },
    name: {type: String},
    address: {type: String, lowercase: true},
    rpc: {type: String},
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

  return mongoose.model('Connect', Connect, 'Connect')
}
