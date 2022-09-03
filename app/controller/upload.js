'use strict';
const Controller = require('egg').Controller;
const _ = require("lodash");
var util = require('util');
var fs = require('fs');//引用文件系统模块
const shortid = require('shortid');
class UploadController extends Controller {
  /**
   * 上传文件
   * @returns time
   */
  async file() {
    const { ctx, app} = this;
      let typeArr = ['uncommon','rare', 'epic', 'legendary'];
      let path = 'D:/wnmp/www/lichang/lc_nft_image/wait_image/';
      let path_remove = 'D:/wnmp/www/lichang/lc_nft_image/already_image/';
      const imageList  = await this.service.fileService.getImageFiles(path);
      console.log(imageList);
      for(let index in imageList){
        let imgInfo = imageList[index].split('.');
        let suffix = imgInfo[1];
        let imgNameArr = imgInfo[0].split('_');
        console.log(_.indexOf(typeArr,imgNameArr[0].toLowerCase()))
        if(_.indexOf(typeArr,imgNameArr[0].toLowerCase()) != -1){
          let rename =imgNameArr[0]+'_' + shortid.generate() + '.'+suffix;
          let name = `assets/lcnftprd/${rename}`;
          try{
            let result = await ctx.oss.put(name,path+'/'+imageList[index]);
            if(result.url){
              let imageName = imageList[index];
              let removePathFile = path_remove+'/'+imageName;
              try{
                 await util.promisify(fs.stat)(removePathFile);
                imageName = imgInfo[0]+'_'+shortid.generate()+'.'+suffix;
                removePathFile = path_remove+'/'+imageName;
              }catch (e) {
              }
              //移动
              fs.rename(path+'/'+imageList[index],removePathFile,(err)=>{
                if(err){
                  throw err;
                }else{
                  //数据入库
                  this.service.nftImageService.saveData(imgNameArr[0].toLowerCase(),imageName,result.url);
                }
              })
            }else{
              console.log("上传失败");
            }
          }catch (e) {
            console.log(e)
            console.log("上传失败");
          }
        }else{
          console.log(imageList[index],'命名不合规');
        }
      }
      ctx.body = {
         msg:'success'
      }
  }

  //按照比例生成100个可用的预发的 nft 图片
   async createUsedNftimage(){
      let proportion = {
        'uncommon':50,
        'rare':30,
        'epic':15,
        'legendary':5
      };
     // let proportionBetween = {
     //   'uncommon':[1,9],
     //   'rare':[10,19],
     //   'epic':[20,29],
     //   'legendary':[30,39],
     // };

      let propArr = [];
      for(let type in proportion){
        let num = proportion[type];
        for(let i=1;i<=num;i++){
          propArr.push(type);
        }
      }
     propArr =  _.shuffle(propArr);
     propArr =  _.shuffle(propArr);
     propArr =  _.shuffle(propArr);

      let i = 1;
     for(let type of propArr){
       // let levelStart = proportionBetween[type][0];
       // let levelEnd = proportionBetween[type][1];
       // let level = _.random(levelStart,levelEnd);
       await this.service.nftImageService.workNft(type);
       console.log(i);
       i++;
     }
   }

  //初始化connect数据
  async initConnect(){

    let connectList = {
      "FlowerNft": "0xA45642615d3b7524350ec2d92ADCc1452c95e9a8",
      "Box": "0xc66d7b52E7ca2Fc2e9ae4826065d108c34958efA",
      "AirdropBox": "0xe926fFF0cC0B6265103837235194a8541ab0111B",
      "SunToken": "0xC4AD74761637fe2130849Fd6E8Ea7EbF1c1d315d",
      "Market": "0x280f44c9CedeaAE11E5273e94A25515beeB1EAe0"
    };

    let connectRpc = {
      "FlowerNft": "wss://bsc-01:123456@apis.ankr.com/wss/74d0ca93ec1b4c88815c69adaeaff383/934816b386dd5adbfa87f69a26a24eb2/binance/full/test",
      "Box": "wss://bsc-02:123456@apis.ankr.com/wss/5c59435e074848a696707f3e3c9e4025/934816b386dd5adbfa87f69a26a24eb2/binance/full/test",
      "AirdropBox": "wss://bsc-04:123456@apis.ankr.com/wss/319d817943524f92b9667cf5f0b15556/934816b386dd5adbfa87f69a26a24eb2/binance/full/test",
      "SunToken": "wss://bsc-01:123456@apis.ankr.com/wss/4bcc12c7c12545a8bc02c506c9633069/f68d431f5e4b4153f180c304be457256/binance/full/test",
      "Market": "wss://bsc-02:123456@apis.ankr.com/wss/84eedbef4af84e4fa1dd9a6688b7c20a/f68d431f5e4b4153f180c304be457256/binance/full/test"
    };

    for(let name in connectList){
      console.log(name);
      await this.service.contractService.addConnect(name,connectList[name],connectRpc[name]);
    }
  }


  //初始化跑批数据
  async initLiqlog(){
    let connectList = {
      "FlowerNft": "0xA45642615d3b7524350ec2d92ADCc1452c95e9a8",
      "Box": "0xc66d7b52E7ca2Fc2e9ae4826065d108c34958efA",
      "AirdropBox": "0xe926fFF0cC0B6265103837235194a8541ab0111B",
      "SunToken": "0xC4AD74761637fe2130849Fd6E8Ea7EbF1c1d315d",
      "Market": "0x280f44c9CedeaAE11E5273e94A25515beeB1EAe0"
    };
    for(let name in connectList){
      let address = connectList[name].toLowerCase();
      let result=  {address:address, fromBlock:20216593,toBlock:20216593};
      console.log(name,result);
      await this.service.pastEventLogService.doPastEvnetLog(result);
    }
  }

  //初始化nft属性数据
  async initFlowerNftConfig(){
    let nftList = {
      'uncommon':  {levelBetween:[1,9],  lifeCycle:120, baseProduction:250000,  intervalTime:8, luckyFactor:0.1,  price:10000000},
      'rare':      {levelBetween:[10,19],lifeCycle:150, baseProduction:600000,  intervalTime:12,luckyFactor:0.15, price:25000000},
      'epic':      {levelBetween:[20,29],lifeCycle:180, baseProduction:1300000, intervalTime:24,luckyFactor:0.2,  price:60000000},
      'legendary': {levelBetween:[30,39],lifeCycle:240, baseProduction:4000000, intervalTime:48,luckyFactor:0.25, price:200000000},
    };
    for(let type in nftList){
      nftList[type]['type'] = type;
      console.log(type)
      await this.service.nftService.addNftConfig(nftList[type]);
    }
  }

}

module.exports = UploadController;
