'use strict';
const Controller = require('egg').Controller;
const _ = require("lodash")
const moment = require('moment')
class HomeController extends Controller {
  async index() {
    const ctx = this.ctx;
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    // this.app.runSchedule('MaekrtPastEventSchedule');
    // this.app.runSchedule('NftPastEventSchedule');
    return ctx.body = {
      timestamp,
    };
  }
}

module.exports = HomeController;
