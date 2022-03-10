const Web3 = require('web3')
const fetch = require('node-fetch')
const { collectionABI } = require('../constant/abi')
const NFT = require('../model/nft.model')
const {
  sleep,
  isBase64,
  isIpfs,
  isIdInURI,
  getIPFSSufix,
  getTokenURI,
  getAssetType,
  getImageURI
} = require('../utils/common')

const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.ftm.tools/'));

const fetchNFTData = async (_collectionAddress, totalSupply) => {
  const collectionAddress = _collectionAddress.toLowerCase()
  const contract = new web3.eth.Contract(collectionABI, collectionAddress);
  const promises = []
  for (let id = 1; id <= totalSupply; id ++) {
    const promise = (async () => {
      try {
      const token_uri = await contract.methods.tokenURI(id).call()

      let uri = token_uri
      
      let tokenURI = ''
      let metadata = null
      let isImage = false
      const ipfsSufix = getIPFSSufix(uri);
      console.log(uri, ipfsSufix)
      let p = uri.indexOf('?')
      if (p !== -1) {
        const subStr = uri.slice(p, uri.length)
        if (!subStr.includes('?index='))
          uri = uri.slice(0, p)
      }
      if (!isIpfs(uri) || isBase64(uri)) {
        tokenURI = uri
      } else if (ipfsSufix === 'url') {
        const p = token_uri.indexOf('?')
        if (p !== -1) uri = token_uri.slice(0, p)
        if (uri.includes('Qm') ) {
          let p = uri.indexOf("Qm");
          let locationQm = ""
          if (p !== -1) locationQm = uri.substring(p)
          tokenURI = 'https://operahouse.mypinata.cloud/ipfs/' + locationQm
        } else {
          tokenURI = uri
        }
      } else {
        let p = token_uri.indexOf('?')
        if (p !== -1) uri = token_uri.slice(0, p)
        let involveId = isIdInURI(uri);
        let ipfsPos = uri.lastIndexOf('/ipfs/')
        let subUri = uri.substring(ipfsPos + 6)
        while (subUri && subUri.length > 0) {
          const firstCharacter = subUri[0]
          if (!firstCharacter.match(/[a-z]/i)) subUri = subUri.substring(1)
          else break
        }
        tokenURI = getTokenURI(id, '', ipfsSufix, involveId, subUri);
      }
      console.log(tokenURI)
      const tokenAssetType = await getAssetType(tokenURI)

      if (tokenAssetType === 'other') {
        try {
          let response = await fetch(tokenURI);
          const responseText = await response.text()
          const regex = /\,(?!\s*?[\{\[\"\'\w])/g;
          const correct = responseText.replace(regex, '');
          metadata = JSON.parse(correct)
        } catch (err) {
          await sleep(100)
          try {
            let response = await fetch(tokenURI);
            const responseText = await response.text()
            const regex = /\,(?!\s*?[\{\[\"\'\w])/g;
            const correct = responseText.replace(regex, '');
            metadata = JSON.parse(correct)
          } catch (err) {
            return null
          }
        }
      } else {
        isImage = true
      }

      let {
        name: title,
        description,
        attributes
      } = metadata

      let assetURI = ''
      let assetType = ''

      const jsonAttributes = attributes ? JSON.stringify(attributes): null

      if (isImage) {
        assetURI = getImageURI(tokenURI)
        assetType = await getAssetType(assetURI)
        title = collectionInfo.name + ' ' + ("00" + id).slice(-3);
      } else if (metadata.image) {
        assetURI = getImageURI(metadata.image)
        assetType = await getAssetType(assetURI)
      } else if (metadata.animation_url){
        assetURI = getImageURI(metadata.animation_url)
        assetType = await getAssetType(assetURI)
      } else {
        assetURI = ''
        assetType = 'other'
      }
      // return {
      //       collectionAddress,
      //       tokenId: id,
      //       assetURI,
      //       assetType,
      //       title,
      //       description,
      //       attributes: jsonAttributes
      //     }
      
      const nft = await NFT.findOne({ collectionAddress, tokenId: id})
      if (nft) {
        await NFT.update(nft.id, {
          collectionAddress,
          tokenId: id,
          assetURI,
          assetType,
          title,
          description,
          attributes: jsonAttributes
        })
      } else {
        await NFT.create({
          collectionAddress,
          tokenId: id,
          assetURI,
          assetType,
          title,
          description,
          attributes: jsonAttributes
        })
      }
      } catch (err) {
        console.log(err)
        return null
      }
    })
    promises.push(promise)
  }
  await Promise.all(promises.map((promise) => promise()))
}

// rest api

const getNFT = async (req, res) => {
  const { collectionAddress: _collectionAddress } = req.params
  const collectionAddress = _collectionAddress.toLowerCase()
  const { page, limit } = req.query
  try {
    console.log(collectionAddress, page, limit)
    NFT.getCollectionNFT(collectionAddress, page, limit, (result, data) => {
      res
      .status(200)
      .json({
        result: true,
        data
      })
    })
    
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'database error'})
  }
}

module.exports ={
  fetchNFTData,
  getNFT
}
