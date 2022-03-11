const Web3 = require('web3')
const fetch = require('node-fetch')
const { collectionABI, NFTContractABI } = require('../constant/abi')
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
const contractAddress = "0x86c4764a936b0277877cb83abf1ad79ce35c754c"

const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc.ftm.tools/'));

const fetchNFTData = async (_collectionAddress, _totalSupply) => {
  try {
    const collectionAddress = _collectionAddress.toLowerCase()
    const contract = new web3.eth.Contract(collectionABI, collectionAddress);
    const promises = []
    const createArray = []
    const total = await contract.methods.totalSupply().call()
    const totalSupply = 4500
    for (let id = 4400; id <= totalSupply; id ++) {
      const promise = (async () => {
        try {
        const token_uri = await contract.methods.tokenURI(id).call()

        let uri = token_uri
        
        let tokenURI = ''
        let metadata = null
        let isImage = false
        const ipfsSufix = getIPFSSufix(uri);
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

        let jsonAttributes = attributes ? JSON.stringify(attributes): null

        if (title) title = title.replace(/\'/g, "\\'")
        else title = ''
        if (description) description = description.replace(/\'/g, "\\'")
        else description = ''
        if (jsonAttributes) jsonAttributes = jsonAttributes.replace(/\'/g, "\\'")

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
          createArray.push({collectionAddress,
            tokenId: id, 
            assetURI,
            assetType,
            title,
            description,
            attributes: jsonAttributes
          })
        // }
        } catch (err) {
          console.log('error1',err)
          return null
        }
      })
      promises.push(promise)
    }
    await Promise.all(promises.map((promise) => promise()))
    if (createArray.length)
      await NFT.createMany(createArray)
  } catch (err) {
    return null
  }
}

const fetchDefaultNFTData = async () => {
  const contract = new web3.eth.Contract(NFTContractABI, contractAddress);

  const totalSupply = await contract.methods.totalTokenCount().call()
  const startId = 1
  let ids = []
  const createArray = []

  const promise = (id) => contract.methods.getMetadata(id).call()
    .then(async (result) => {
      let cardItem = {};
      cardItem.collectionAddress = contractAddress;
      cardItem.tokenId = id;
      cardItem.assetURI = getImageURI(result.assetURI);
      cardItem.title = result.title.replace(/\'/g, "\\'");
      cardItem.attributes = JSON.stringify([])
      cardItem.description = ''
      console.log(cardItem)

      if (result.assetType && result.assetType !== '') {
        cardItem.assetType = result.assetType
      } else {
        cardItem.assetType = await getAssetType(cardItem.assetURI)
      }
      createArray.push(cardItem)
    })
    .catch((err) => {
      console.log(err.message)
    })

  for(let id = startId; id <= totalSupply; id++) {
    ids.push(id)
  }
  await Promise.all(ids.map((id) => promise(id)))
  if (createArray.length)
      await NFT.createMany(createArray)
}

// rest api

const getNFT = async (req, res) => {
  const { collectionAddress: _collectionAddress } = req.params
  const collectionAddress = _collectionAddress.toLowerCase()
  const { index, limit } = req.query
  try {
    NFT.getCollectionNFT(collectionAddress, index, limit, (result, data) => {
      if (result) {
        res
        .status(200)
        .json({
          result: true,
          data
        })
      } else {
        res
        .status(500)
        .json({
          result: false,
          data
        })
      }
    })
    
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'database error'})
  }
}

const getOneNFT = async (req, res) => {
  const { collectionAddress: _collectionAddress, tokenId } = req.params
  try {
    const collectionAddress = _collectionAddress.toLowerCase()
    NFT.getNFT(collectionAddress, tokenId, (result, data) => {
      if (result) {
        res
        .status(200)
        .json({
          result: true,
          data
        })
      } else {
        res
        .status(500)
        .json({
          result: false,
          data
        })
      }
    })
    
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'database error'})
  }
}

const getMarketplaceNFTs = async (req, res) => {
  const { items } = req.body
  console.log(items)
  try {
    NFT.getMarketplaceNFTs(items, (result, data) => {
      if (result) {
        res
        .status(200)
        .json({
          result: true,
          data
        })
      } else {
        res
        .status(500)
        .json({
          result: false,
          data
        })
      }
    })
    
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: 'database error'})
  }
}


module.exports = {
  fetchDefaultNFTData,
  fetchNFTData,
  getNFT,
  getOneNFT,
  getMarketplaceNFTs
}
