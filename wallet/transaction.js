const ChainUtil = require('../util/chain-util')
const { BLOCK_REWARD } = require('../blockchain/config/config')

class Transaction {
  constructor() {
    this.id = ChainUtil.id()
    this.input = null
    this.outputs = []
  }

  /**
  * @notice Update an existing transaction with another output
  * @param {Object} sender The sender's WALLET
  * @param {String} receiver The receiver's publicKey (address)
  * @param {Number} amount The amount to send
  * @return {Object} tx - Signed transaction
  **/
  updateTx(sender, receiver, amount) {
    let senderOutputExisting = this.outputs.find(output => output.address === sender.publicKey)
    if (amount > sender.balance) {
      console.error(`Amount to send (${amount}) exceeds balance (${sender.balance}).`)
      return
    }
    //Update the amount sent in the existing sender output
    senderOutputExisting.amount -= amount
    //Push the additional receiver output into our transaction outputs
    this.outputs.push({amount, address: receiver})
    //Sign the transaction
    Transaction.signTx(this, sender)
    return this
  }

  /**
  * @notice Helper function that assembles the outputs for a transaction and signs it
  * @param {Object} sender - Sender wallet object
  * @param {Array} outputs - An array of UTXO's created by newTx()
  * @returns {Object} Signed transaction
  **/
  static txWithOutputs(sender, outputs) {
    //create a new instance of this class
    const tx = new this()
    tx.outputs.push(...outputs)
    Transaction.signTx(tx, sender)
    return tx
  }

  /**
  * Sends a reward transaction to a miner for mining a block
  * This is a special transaction sent and signed by the blockchain itself
  * wallet.js contains a static method that generates this wallet
  * @param {Object} miner - the miner wallet to receive the reward
  * @param {Object} blockchainWallet - The wallet 'owned' by the blockchain
  * @returns {Object} Reward transaction
  **/
  static rewardTx(miner, blockchainWallet) {
    const rewardOutput = {
      amount: BLOCK_REWARD, //amount
      address: miner.publicKey //to
    }
    return Transaction.txWithOutputs(blockchainWallet, [rewardOutput])
  }

  /**
  * @notice Creates UTXO's for sender and receiver and passes them to txWithOutputs()
  * @param {Object} sender The sender's WALLET
  * @param {String} receiver The receiver's publicKey (address)
  * @param {Number} amount The amount to send
  * @returns {Object} signed transaction
  **/
  static newTx(sender, receiver, amount) {
    //check sender balance
    if (amount > sender.balance) {
      console.error(`Amount to send (${amount}) exceeds balance (${sender.balance}).`)
      return
    }
    //Create output objects
    //ES6 spread operator ...[] spreads an array
    let senderOutput = { amount: sender.balance - amount, address: sender.publicKey }
    let receiverOutput = {amount, address: receiver}
    //Pass outputs to helper function
    return Transaction.txWithOutputs(sender, [senderOutput, receiverOutput])
  }

  /**
  * @notice Sign a newly created transaction throug the sender private key and the transaction outputs
  * @param {Object} transaction newly generated transaction class with transaction outputs
  * @param {Object} sender The sender's WALLET for access to sign method and the private key
  **/
  static signTx(transaction, sender) {
    transaction.input = {
      timestamp: Date.now(),
      balance: sender.balance, //balance before tx
      address: sender.publicKey,
      signature: sender.sign(ChainUtil.hash(transaction.outputs))
    }
  }
  /**
  * @notice Verify the signature of a transaction
  * @param {Object} transaction newly generated transaction class object with transaction outputs, an instance of this class
  * @returns {bool} true/false depending on valid signature
  **/
  static verifyTx(transaction) {
    return ChainUtil.verifySig(
      transaction.input.address, //publicKey
      transaction.input.signature, //signature
      ChainUtil.hash(transaction.outputs) //dataHash
    )
  }
}

module.exports = Transaction
