const express = require('express');
const { fetchNFTData, getNFT } = require('./controller/NFT');
const router = express.Router();

router.post('/fetchFromBC', async function (req, res) {
  const { collectionAddress, totalSupply } = req.body
  console.log(req.body)
  await fetchNFTData(collectionAddress, totalSupply)
  
   res.send(collectionAddress);
});
router.get('/:collectionAddress', getNFT);

//export this router to use in our index.js
module.exports = router;
