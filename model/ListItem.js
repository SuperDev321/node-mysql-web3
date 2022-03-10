const { Schema, model } = require('mongoose');

const ListItemSchema = new Schema({
  nftContract: {
    type: String,
    required: true,
  },
  contractType: {
    type: Number,
    required: true,
  },
  tokenId: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  paymentToken: {
    type: String,
    required: true,
  },
  seller: {
    type: String,
    required: true,
  },
  expireTimestamp: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
});

ListItemSchema.index({nftContract: 1, tokenId: 1, seller: 1});

const ListItem = model('ListItem', ListItemSchema);

module.exports = ListItem;
