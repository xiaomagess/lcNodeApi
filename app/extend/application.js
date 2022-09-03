module.exports = {
  getSuccess(data){ return { code: 200, msg: 'success',  data }},
  error(err) {return { code: 500, msg: err }},
}
