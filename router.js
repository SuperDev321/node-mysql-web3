const express = require('express');
const { fetchNFTData, getNFT, getMarketplaceNFTs, fetchDefaultNFTData, getOneNFT } = require('./controller/NFT');
const router = express.Router();

router.post('/fetchFromBC', async function (req, res) {
  try {
    const { collectionAddress, startId, endId } = req.body
    let result = null
    if (collectionAddress == 'default') {
      result = await fetchDefaultNFTData()
    } else {
      result = await fetchNFTData(collectionAddress, startId, endId)
    }
    console.log(result)
    return res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ error: 'unknown_error' });
  }
});
router.get('/:collectionAddress', getNFT);

router.get('/:collectionAddress/:tokenId', getOneNFT);

router.post('/getItems', getMarketplaceNFTs);

//export this router to use in our index.js
module.exports = router;
