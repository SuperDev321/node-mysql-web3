const Web3 = require('web3')
const Contract = require('web3-eth-contract')
const { abi, address } = require('../constant/marketplace')
const ListItem = require('../model/ListItem')

Contract.setProvider(new Web3.providers.HttpProvider('https://rpc.ftm.tools/'))

class Marketplace {
  constructor() {
    this.contract = null
  }

  init () {
    this.contract = new Contract(abi, address)
  }

  getAllPastListItems() {
    this.contract.getPastEvents('TokenListed', {
      fromBlock: 0,
      toBlock: 'latest'
    }, function(error, events) {
      events.forEach(async (event) => {
        console.log(event)
        const {
          nftContract,
          tokenId,
          contractType,
          amount,
          price,
          seller,
          paymentToken,
          listType,
          expireTimestamp,
          time
        } = event.returnValues;
        const listItem = await ListItem.create({
          nftContract,
          tokenId,
          contractType,
          amount,
          price,
          seller,
          paymentToken,
          listType,
          expireTimestamp,
          time
        })
      });
    })
  }
}

const marketplace = new Marketplace()

module.exports = marketplace
