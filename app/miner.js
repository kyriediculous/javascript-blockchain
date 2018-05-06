const Wallet = require('../wallet/wallet')
const Transaction = require('../wallet/transaction')

class Miner {
  constructor(blockchain, mempool, wallet, p2pServer) {
    this.blockchain = blockchain
    this.mempool = mempool
    this.wallet = wallet
    this.p2pServer = p2pServer
  }

  mine() {
    //get valid transactions from the mempool
    const validTransactions = this.mempool.validTransactions()
    //include a reward for the miner
    const rewardTx = Transaction.rewardTx(this.wallet, Wallet.blockchainWallet())
    validTransactions.push(rewardTx)
    //create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions)
    //Synchronize chains in the P2P server
    this.p2pServer.syncChains()
    //Clear the mempool local to this miner
    this.mempool.clear()
    //Broadcast miners to clear the transactions from their mempool
    this.p2pServer.broadcastClearTx()
    //return block
    return block
  }
}

module.exports = Miner
