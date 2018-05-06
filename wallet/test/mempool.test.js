const MemPool = require('../mempool')
const Transaction = require('../transaction')
const Wallet = require('../wallet')
const Blockchain = require('../../blockchain/blockchain')
describe('Pending transaction pool', () => {
  let mempool, wallet, tx
  beforeEach(() => {
    mempool = new MemPool()
    wallet = new Wallet()
    blockchain = new Blockchain()
    tx = wallet.createTx('0xfoo', 10, mempool, blockchain)
    /* This does the same ~~
    tx = Transaction.newTx(wallet, '0xfoo', 10)
    mempool.updateOrAddTx(tx)
    */
  })
  it('Adds a transaction to the pool', () => {
    let txWithId = mempool.transactions.find(t => t.id === tx.id)
    expect(txWithId).toEqual(tx)
  })
  it('Updates a transaction in the pool', () => {
    let oldTx = JSON.stringify(tx)
    let newTx = tx.updateTx(wallet, '0xbar', 10)
    mempool.updateOrAddTx(newTx)
    let txWithId = JSON.stringify(mempool.transactions.find(t => t.id === newTx.id))
    expect(txWithId).not.toEqual(oldTx)
  })
  it('Clears transactions from the mempool', () => {
    mempool.clear()
    expect(mempool.transactions).toEqual([])
  })

  describe('Mixing valid and invalid transactions', () => {
    let validTransactions = []
    beforeEach(() => {
      validTransactions = [...mempool.transactions]
      for (let i=0; i<6; i++) {
        wallet = new Wallet();
        tx = wallet.createTx(`0x${i}foo`, 5, mempool, blockchain)
        if (i%2==0) {
          //corrupt transactions that are even in the loop
          tx.input.balance = 9999
        } else {
          //Add valid transactions to our array to compare with mempool
          validTransactions.push(tx)
        }
      }
    })
    it('Shows a difference between valid and invalid transactions', () => {
      expect(JSON.stringify(mempool.transactions)).not.toEqual(JSON.stringify(validTransactions))
    })
    it('Grabs valid transactions only', () => {
      expect(mempool.validTransactions()).toEqual(validTransactions)
    })
  })
})
