const ChainUtil = require('../util/chain-util')
const { DIFFICULTY, BLOCK_TIME } = require('./config/config')

class Block {
  /**
  * @constructor
  **/
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp
    this.lastHash = lastHash
    this.hash = hash
    this.data = data
    this.nonce = nonce
    this.difficulty = difficulty || DIFFICULTY
  }

  toString() {
    return `-------------- BLOCK ------------------
    Timestamp: ${this.timestamp}
    Last hash: ${this.lastHash.substring(0, 10)}
    Hash     : ${this.hash.substring(0, 10)}
    Nonce    : ${this.nonce}
    Diff.    : ${this.difficulty}
    Data     : ${this.data}`
  }

  /*Static method calls are made directly on the class
  *and are not callable on instances of the class.
  *Static methods are often used to create utility functions.
  * Only callable from class (eg. Block.genesis) and not blockone.genesis
  */
  static genesis() {
    //create new block with dummy values
    //Timestamp, lastHash, hash, Data, Nonce
    return new this('Genesis', '0x0', '0x0', [], 0, DIFFICULTY)
  }

  static mineBlock(lastBlock, data) {
    const lastHash = lastBlock.hash
    let hash, timestamp
    let nonce = 0
    let difficulty = lastBlock.difficulty
    /*
    * Proof-of-work
    * As long as the hash does not start with the required
    * amount of leading 0's as set by DIFFICULTY
    * Increment the nonce, get the new current time and hash again
    */
    do {
      nonce++
      timestamp = Date.now()
      difficulty = Block.adjustDiff(lastBlock, timestamp)
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty)
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty))
    return new this(timestamp, lastHash, hash, data, nonce, difficulty)
  }

  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString()
  }

  static blockHash(block) {
    const { timestamp, lastHash, data, nonce, difficulty} = block
    return Block.hash(timestamp, lastHash, data, nonce, difficulty)
  }

  static adjustDiff(lastBlock, currentTime) {
    let difficulty = lastBlock.difficulty
    difficulty = lastBlock.timestamp + BLOCK_TIME > currentTime ? difficulty+1 : difficulty-1
    return difficulty
  }
}

module.exports = Block
