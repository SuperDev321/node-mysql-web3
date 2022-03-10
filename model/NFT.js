const { Schema, model } = require('mongoose');

const NFTSchema = new Schema({
  collectionAddress: {
    type: String,
    required: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  assetURI: {
    type: String,
  },
  assetType: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  attributes: {
    type: String,
  },
});

NFTSchema.index({nftContract: 1, tokenId: 1, seller: 1});

const NFT = model('NFT', NFTSchema);

module.exports = NFT;
