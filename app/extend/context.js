const path   = require('path');
module.exports = {

  /**
   * 获取函数具体信息
   * @returns {{}}
   */
  getFileInfo() {
    let stackReg  = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    let stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
    let stacklist = (new Error()).stack.split('\n').slice(3);
    let s         = stacklist[0];
    let sp        = stackReg.exec(s) || stackReg2.exec(s);
    let data      = {};
    if (sp && sp.length === 5) {
      data.method = sp[1];
      data.path   = sp[2];
      data.line   = sp[3];
      data.pos    = sp[4];
      data.file   = path.basename(data.path);
    }

    return data;
  },

  /**
   * 获取函数类的方法名称
   * @returns {*}
   */
  getMethod() {
    let info = this.getFileInfo();
    return info['method'];
  },

  sinfo(...args){
    let chain = this.chain;
    if(chain == 'eth'){
      this.app.getLogger('ethInfo').info(chain,...args);
    }else if(chain == 'bsc'){
      this.app.getLogger('bscInfo').info(chain,...args);
    }else if(chain == 'fsn'){
      this.app.getLogger('fsnInfo').info(chain,...args);
    }
  },

  linfo(...args){
    let chain = this.chain;
    if(chain == 'eth'){
      this.app.getLogger('ethWatch').info(chain,...args);
    }else if(chain == 'bsc'){
      this.app.getLogger('bscWatch').info(chain,...args);
    }else if(chain == 'fsn'){
      this.app.getLogger('fsnWatch').info(chain,...args);
    }
  },
  lerror(...args){
    let chain = this.chain;
    if(chain == 'eth'){
      this.app.getLogger('ethWatchError').info(chain,...args);
    }else if(chain == 'bsc'){
      this.app.getLogger('bscWatchError').info(chain,...args);
    }else if(chain == 'fsn'){
      this.app.getLogger('fsnWatchError').info(chain,...args);
    }
  }
};
