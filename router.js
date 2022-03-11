const express = require('express');
const { fetchNFTData, getNFT, getMarketplaceNFTs, fetchDefaultNFTData, getOneNFT } = require('./controller/NFT');
const router = express.Router();

router.post('/fetchFromBC', async function (req, res) {
  const { collectionAddress, totalSupply } = req.body
  if (collectionAddress == 'default') {
    await fetchDefaultNFTData()
  } else {
    await fetchNFTData(collectionAddress, totalSupply)
  }
  
   res.send(collectionAddress);
});
router.get('/:collectionAddress', getNFT);

router.get('/:collectionAddress/:tokenId', getOneNFT);

router.post('/getItems', getMarketplaceNFTs);

//export this router to use in our index.js
module.exports = router;
