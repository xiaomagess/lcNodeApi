const Service = require('egg').Service;
var fs = require('fs');//引用文件系统模块
var image = require("imageinfo"); //引用imageinfo模块


class FileService extends Service {

  //获取文件夹下的所有图片
  getImageFiles(path) {
    var imageList = [];
    this.getFileList(path).forEach((item) => {
      var ms = image(fs.readFileSync(item.path + item.filename));
      ms.mimeType && (imageList.push(item.filename))
    });
    return imageList;
  }

  //获取文件夹下的所有文件
  getFileList (path) {
    var filesList = [];
    this.readFileList(path, filesList);
    return filesList;
  }

  readFileList(path, filesList) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
      var stat = fs.statSync(path + itm);
      if (stat.isDirectory()) {
        //递归读取文件
        this.readFileList(path + itm + "/", filesList)
      } else {
        var obj = {};//定义一个对象存放文件的路径和名字
        obj.path = path;//路径
        obj.filename = itm//名字
        filesList.push(obj);
      }
    })
  }

}

module.exports = FileService;

//
// //获取文件夹下的所有图片
// var srclist=getFiles.getImageFiles("../../static/images/");
// var srcNewList=[];
// console.log(srclist);
// srclist.forEach(function (item, index){
//   console.log(item);
//   if(item.split(".")[1]=='jpg'){
//     srcNewList.push({'imsrc':item})
//   }else{
//     srcNewList.push({'videosrc':item})
//   }
// })
// console.log(srcNewList)
// //获取文件夹下的所有文件以及路径
// // console.log(getFiles.getFileList("../../static/"));
