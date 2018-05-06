const Transaction = require('./transaction')

class MemPool {
  constructor() {
    this.transactions = []
  }

  updateOrAddTx(transaction) {
    //Check whether tx already exists in the pool
    let txWithId = this.transactions.find(tx => tx.id === transaction.id)
    if (txWithId) {
      this.transactions[this.transactions.indexOf(txWithId)] = transaction
    } else {
      this.transactions.push(transaction)
    }
  }

  findExistingTx(pubKey) {
    return this.transactions.find(tx => tx.input.address === pubKey)
  }

  validTransactions() {
    return this.transactions.filter(tx => {
      const outputTotal = tx.outputs.reduce((total, output) => {
        return total + output.amount
      }, 0) //start total at 0 for first iteration

      if(outputTotal !== tx.input.balance) {
        console.info(`Invalid transaction from ${tx.input.address.substring(0,10)}`)
        return
      }
      if(!Transaction.verifyTx(tx)) {
        console.info(`Invalid signature from ${tx.input.address}`)
        return
      }
      return tx
    })
  }

  //clear the mempool 
  clear() {
    this.transactions = []
  }
}

module.exports = MemPool
