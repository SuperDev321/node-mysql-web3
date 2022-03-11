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
    sql.query("INSERT INTO nfts SET ?", newNft, (err, res) => {
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
    sql.query("UPDATE nfts SET ? WHERE id = ?", [newNft, id], (err, res) => {
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
    sql.query(`SELECT * from nfts WHERE collectionAddress = '${collectionAddress}' AND tokenId = '${tokenId}'`,(err, res) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(res[0])
    });
  })
  
};

NFT.createMany = (newNfts) => {
  return new Promise((resolve, reject) => {
    
    let query = 'INSERT INTO nfts (tokenId, collectionAddress, title, description, assetURI, assetType, attributes) VALUES '
    newNfts.forEach((_element, index) => {
      const {
        tokenId,
        collectionAddress,
        title,
        description,
        assetURI,
        assetType,
        attributes
      } = _element
      if (index < newNfts.length - 1) {
        query += `('${tokenId}', '${collectionAddress}', '${title}', '${description}', '${assetURI}', '${assetType}', '${attributes}'), `
      } else {
        query += `('${tokenId}', '${collectionAddress}', '${title}', '${description}', '${assetURI}', '${assetType}', '${attributes}') `
      }
    });
    query += `ON DUPLICATE KEY UPDATE 
              title = VALUES(title),
              description = VALUES(description),
              assetURI = VALUES(assetURI),
              assetType = VALUES(assetType),
              attributes = VALUES(attributes);`
    console.log(query)
    sql.query(query, (err, res) => {
      if (err) {
        console.log("error: ", err);
        reject(err);
        return;
      }
      resolve(true)
    });
  })
};

NFT.getCollectionNFT = (collectionAddress, index, limit, result) => {
  let query;
  if (!index || !limit) {
    query = `SELECT * FROM nfts WHERE collectionAddress = '${collectionAddress}' ORDER BY tokenId`;
  } else {
    query = `SELECT * FROM nfts WHERE collectionAddress = '${collectionAddress}' ORDER BY tokenId LIMIT ${index}, ${limit}`;
  }
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(false, err);
      return;
    }

    console.log("nfts: ", res);
    result(true, res);
  });
};

NFT.getMarketplaceNFTs = (items, result) => {
  console.log(items)
  let query = `SELECT * FROM nfts WHERE `
  items.forEach((item, index) => {
    const { collectionAddress, id } = item
    if (index < items.length - 1) query += `(collectionAddress = '${collectionAddress}' AND tokenId = '${id}') OR `
    else query += `(collectionAddress = '${collectionAddress}' AND tokenId = '${id}')`
  })
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(false, err);
      return;
    }

    console.log("nfts: ", res);
    result(true, res);
  });
};

NFT.getNFT = (collectionAddress, tokenId, result) => {
  let query = `SELECT * FROM nfts WHERE collectionAddress = '${collectionAddress}' AND tokenId = '${tokenId}'`
  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(false, err);
      return;
    }

    if (res && res.length) {
      result(true, res[0]);
    } else {
      result(false, null)
    }
    
  });
}

module.exports = NFT
