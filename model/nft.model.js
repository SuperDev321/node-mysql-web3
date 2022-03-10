const sql = require("./db.js");

const NFT = function(nft) {
  this.title = nft.title;
  this.description = nft.description;
  this.collectionAddress = nft.collectionAddress;
  this.tokenId = nft.tokenId;
  this.attributes = nft.attributes;
  this.assetURI = nft.assetURI;
  this.assetType = nft.assetType;
};

NFT.create = (newNft) => {
  return new Promise((resolve, reject) => {
    sql.query("INSERT INTO NFT SET ?", newNft, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      resolve({ id: res.insertId, ...newNft });
    });
  })
};

NFT.update = (id, newNft) => {
  return new Promise((resolve, reject) => {
    sql.query("UPDATE NFT SET ? WHERE id = ?", [newNft, id], (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  })
};

NFT.findOne = ({ collectionAddress, tokenId }) => {
  return new Promise((resolve, reject) => {
    sql.query(`SELECT * from NFT WHERE collectionAddress = '${collectionAddress}' AND tokenId = '${tokenId}'`,(err, res) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(res[0])
    });
  })
  
};

NFT.createMany = (newNfts, result) => {
  const {
    tokenId,
    collectionAddress,
    title,
    description,
    assetURI,
    assetType,
    attributes
  } = newNfts
  let query = 'INSERT INTO NFT (tokenId, collectionAddress, title, description, assetURI, assetType, attributes) VALUES '
  newNfts.forEach((element, index) => {
    if (index < newNfts.length - 1) {
      query += `
        (${tokenId}, ${collectionAddress}, ${title}, ${description}, ${assetURI}, ${assetType}, ${attributes}),
      `
    } else {
      query += `
        (${tokenId}, ${collectionAddress}, ${title}, ${description}, ${assetURI}, ${assetType}, ${attributes});
      `
    }
    
  });
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    result(null);
  });
};

NFT.getCollectionNFT = (collectionAddress, page, limit, result) => {
  let query = `SELECT * FROM NFT WHERE collectionAddress = '${collectionAddress}' ORDER BY tokenId LIMIT ${page * limit}, ${limit}`;
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("nfts: ", res);
    result(null, res);
  });
};

module.exports = NFT
