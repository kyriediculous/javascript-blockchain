const ChainUtil = require('../util/chain-util')
const Transaction = require('./transaction')
const { INITIAL_BALANCE } = require('../blockchain/config/config')

class Wallet {
  /**
  * @constructor
  * Sets the initial balance (dev mode only)
  * Generates a new keypair through the EC module
  * Gets the public key (address)
  **/
  constructor() {
    this.balance = INITIAL_BALANCE //0 in production
    this.keyPair = ChainUtil.generateKeys()
    this.publicKey = this.keyPair.getPublic().encode('hex')
  }

  toString() {
    return `Wallet --
    Public Key: ${this.publicKey.toString()}
    Balance   : ${this.balance}`
  }

  /**
  * Sign some data with the keypair through the sign() function available in the EC module
  * @param {string} dataHash SHA256 hash from the data
  **/
  sign(dataHash) {
    return this.keyPair.sign(dataHash)
  }

  createTx(receiver, amount, mempool, blockchain) {
    this.balance = this.calcBalance(blockchain)
    //find possible existing tx
    if (amount > this.balance) {
      console.error(`Amount to send (${amount}) exceeds balance (${this.balance}).`)
      return
    }
    let tx = mempool.findExistingTx(this.publicKey)
    if (tx) {
      tx = tx.updateTx(this, receiver, amount)
    } else {
      tx = Transaction.newTx(this, receiver, amount)
    }
    mempool.updateOrAddTx(tx)
    return tx
  }

  //The balance of a wallet is the output belonging to this wallet
  //of this wallets most recent sent transaction
  //PLUS received outputs since it's own most recent sent input
  calcBalance(blockchain) {
    let balance = this.balance, transactions = [], startTime = 0
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }))

    const walletInputTs = transactions.filter(transaction => transaction.input.address === this.publicKey)

    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current)
      balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount
      startTime = recentInputT.input.timestamp
    }

    transactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find(output => {
          if (output.address === this.publicKey) {
            balance += output.amount
          }
        })
      }
    })
    return balance;
  }

  static walletInfo(address, blockchain) {
    let transactions = [], startTime = 0, balance
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }))

    let sentTransactions = transactions.filter(transaction => transaction.input.address === address)
    let receivedTransactions = transactions.filter(tx => tx.input.address !== address).filter(tx => tx.outputs.find(o => o.address === address))
    if (sentTransactions.length > 0) {
      const mostRecent = sentTransactions.reduce((prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current)
      balance = mostRecent.outputs.find(output => output.address === address)
      startTime = mostRecent.input.timestamp
    } else {
      balance = INITIAL_BALANCE
    }

    receivedTransactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find(output => {
          if (output.address === address) {
            balance += output.amount
          }
        })
      }
    })
    return {
      address,
      sentTransactions,
      receivedTransactions,
      balance
    }
  }

  static blockchainWallet() {
    const blockchainWallet = new this()
    //blockchainwallet.balance = total supply
    blockchainWallet.address = "0x0blockchain-wallet"
    return blockchainWallet
  }
}

module.exports = Wallet
