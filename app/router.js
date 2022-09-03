'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  router.get('/',controller.home.index)

  router.get('/upload/initFlowerNft',controller.upload.initFlowerNftConfig);
  router.get('/upload/initConnect',controller.upload.initConnect);
  router.get('/upload/initLiqlog',controller.upload.initLiqlog);
  router.get('/upload/file',controller.upload.file);
  router.get('/upload/createUsedNft',controller.upload.createUsedNftimage);


  router.get('/addWhitelist/:address',controller.aidrop.addWhitelist);
  router.get('/getUserWhite/:address',controller.aidrop.getUserWhite);

  router.get('/userAmount/:address',controller.user.getUserAmount);
  router.get('/userAmountLog/:address',controller.user.getUserAmountLog);
  router.get('/userWithdraw',controller.user.userWithdraw);
  router.get('/getUserWithDrawList/:address',controller.user.getUserWithDrawList);
  router.get('/addUserEquipmentList/:address',controller.user.addUserEquipmentList);
  router.get('/getUserEquipmentList/:address',controller.user.getUserEquipmentList);

  router.get('/nftList',controller.nft.nftList);
  router.get('/nft/:id',controller.nft.nftInfo);

  router.get('/nftEnable',controller.nft.nftEnable);
  router.get('/dig',controller.nft.dig);

  router.get('/market/list',controller.market.list);

};
