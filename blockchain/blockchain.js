const Block = require('./block')

class Blockchain {
  /**
  * @constructor
  * Sets the chain to an array with 1 element, the genesis block
  **/
  constructor() {
    //Set the first element of the blockchain array to the genesis block
    this.chain = [Block.genesis()]
  }

  addBlock(data) {
    //get the last block from the blockchain array
    const lastBlock = this.chain[this.chain.length-1]
    //Create a new block by mining it
    const block = Block.mineBlock(lastBlock, data)
    //Add the mined block to the array
    this.chain.push(block)
    //return the block
    return block
  }

  isValidChain(chain) {
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false
    for (let i=1; i < chain.length; i ++) {
      let block = chain[i]
      let lastBlock = chain[i-1]
      if (block.hash !== Block.blockHash(block) || block.lastHash !== lastBlock.hash) return false
    }
    return true
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.error('Received chain is shorted than the current chain.')
      return
    } else if (!this.isValidChain(newChain)) {
      console.error('Received chain is not valid.')
      return
    }
    console.info('===== Replacing blockchain with the new chain. =====')
    this.chain = newChain
  }
}

module.exports = Blockchain
