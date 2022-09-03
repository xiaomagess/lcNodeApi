const {MD5} = require('crypto-js')

module.exports = {
  MD5(str) {
    return MD5(String(str)).toString()
  },

  /**
   * undefind 判断
   * @param val
   */
  realIf(val){
    let rel = false;
    if(typeof(val) != 'undefined' && val != 'undefined'){
      rel = true;
    }
    return rel;
  },

  /**
   * 针对apy特殊处理 3.24555  =》 324.55
    * @param num
   * @returns {number}
   */
  apyFormat(num,decimal=2){
    if(!isFinite(num)){
      return 0;
    }
    num = Math.floor(num * 10000) / 100;
    num = num.toString();
    var index = num.indexOf('.');
    if (index !== -1) {
      num = num.substring(0, decimal + index + 1);
    } else {
      num = num.substring(0)
    }
    num = parseFloat(num).toFixed(decimal)*1;
    return num || 0;
  },

  priceDecimal(num,decimal=2){//保留非小数后的2位小数
    num = num?num.toString():'';
    var index = num.indexOf('.');
    if (index !== -1) {
      let zreo_some_arr = num.split('.');
      let zreo_some = zreo_some_arr[1];
      let zreo_index = 0;
      for(let i in zreo_some){
        if(parseInt(zreo_some[i])<=0){
          zreo_index+=1;
        }else{
          break;
        }
      }
      decimal = decimal + zreo_index;
      // zreo_some = zreo_some.substring(0, decimal + zreo_index);
      // num = zreo_some_arr[0]+'.'+zreo_some;
      // console.log(num,zreo_some)
    } else {
      num = num.substring(0);
      num = parseFloat(num);
    }
    num = parseFloat(num).toFixed(decimal)*1;
    return num || 0;

  },

  /**
   * 针对币价控制在4为小数点
   * @param num
   * @returns {number}
   */
  // priceDecimal(num,decimal=4){
  //   num = num.toString();
  //   var index = num.indexOf('.');
  //   if (index !== -1) {
  //     num = num.substring(0, decimal + index + 1);
  //   } else {
  //     num = num.substring(0)
  //   }
  //   num = parseFloat(num).toFixed(decimal)*1;
  //   return num;
  // }



}
