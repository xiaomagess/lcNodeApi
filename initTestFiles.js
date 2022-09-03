const fs = require('fs')
const path = require('path')

const ctlFiles = fs.readdirSync('./app/controller')
const serviceFiles = fs.readdirSync('./app/service')

for (const file of ctlFiles) {
  const tagetTestFile = path.resolve('./test/app/controller', file).replace('.js', '.test.js')
  if (!fs.existsSync(tagetTestFile)) {
    const filename = file.replace('.js', '')
    fs.writeFileSync(tagetTestFile,
`const { app, assert } = require('egg-mock/bootstrap')
describe('Test ${filename}', () => {
  let ctx, redis, redisService, model, mongo
  before(async() => {
    ctx = app.mockContext()
    redis = app.redis
    model = app.model
    mongo = app.mongo
    this.service = this.ctx.service.redisService
  })

  it('Test controller get', async() => {
    const {body} = await app.httpRequest()
      .get('/')
      .set({
        'Content-Type': 'application/json',
        'authorization': token
      })
      .send({
        page: 1
      })
    assert.equal(body.error_code, 0)
  })

  it('Test controller post', async() => {
    const data = await app.httpRequest()
      .post('/')
      .set({
        'Content-Type': 'application/json',
        'authorization': token
      })
      .send({
        tokenid: 2,
        address: 'asdfghjklzxc',
      })
  })

  after(async() => {
    app.close()
  })
})
`
    )
  }
}

for (const file of serviceFiles) {
  const tagetTestFile = path.resolve('./test/app/service', file).replace('.js', '.test.js')
  if (!fs.existsSync(tagetTestFile)) {
    let filename = file.replace('.js', '')
    filename = filename[0].toLowerCase() + filename.substring(1, filename.length)
    fs.writeFileSync(tagetTestFile,
      `const { app, assert } = require('egg-mock/bootstrap')
describe('Test ${filename}', () => {
  let ctx, redis, model, mongo
  before(async() => {
    this.ctx = app.mockContext()
    this.redis = app.redis
    this.model = app.model
    this.mongo = app.mongo
    this.service = this.ctx.service.${filename}
  })

  it('Test service method', async() => {
    await this.service.setCircleStatistic()
  })
  
  after(async() => {
    app.close()
  })
})
`
    )
  }
}
