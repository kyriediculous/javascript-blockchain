const Wallet = require('../wallet')
const MemPool = require('../mempool')
const Blockchain = require('../../blockchain/blockchain')
const {INITIAL_BALANCE} = require('../../blockchain/config/config')
describe('Wallet', () => {
  let wallet, mempool, blockchain
  beforeEach(() => {
    wallet = new Wallet()
    mempool = new MemPool()
    blockchain = new Blockchain()
  })
  describe('Creating a transaction', () => {
    let transaction, amount, receiver
    beforeEach(() => {
      amount = 10
      receiver = '0xfoo'
      transaction = wallet.createTx(receiver, amount, mempool, blockchain)
    })
    describe('Doing the same transaction', () => {
      beforeEach(() => {
        wallet.createTx(receiver, amount, mempool, blockchain)
      })
      it('Doubles `amount` substracted from the wallet balance', () => {
        let senderUTXO = transaction.outputs.find(output  => output.address === wallet.publicKey)
        expect(senderUTXO.amount).toEqual(wallet.balance - amount *2)
      })
      it('Clones the amount` out put for the receiver', () => {
        let receiverOutputAmounts = transaction.outputs
          //Array of UTXO's going to receiver
          .filter(output => output.address === receiver)
          //Only amounts
          .map(output => output.amount)
        expect(receiverOutputAmounts).toEqual([amount, amount])
      })
    })
  })
  describe('Calculating a balance', () => {
    let initialBalance, addBalance, repeatAdd, sender
    beforeEach(() => {
      sender = new Wallet()
      initialBalance = INITIAL_BALANCE //is the same as INITIAL_BALANCE from config
      addBalance = 10
      repeatAdd = 4
      for (let i =0; i < repeatAdd; i ++) {
        sender.createTx(wallet.publicKey, addBalance, mempool, blockchain)
      }
      blockchain.addBlock(mempool.transactions)
    })
    it('Calculates the balance for transactions matching the recipient', () => {
      expect(wallet.calcBalance(blockchain)).toEqual(initialBalance+(addBalance*repeatAdd))
    })
    it('Calculates the balance for tx matching the sender', () => {
      expect(sender.calcBalance(blockchain)).toEqual(initialBalance-(addBalance*repeatAdd))
    })

    describe('The recipient conducts a transaction', () => {
      let subtractBalance, recipientBalance

      beforeEach(() => {
        mempool.clear()
        substractBalance = 5
        recipientBalance = wallet.calcBalance(blockchain)
        wallet.createTx(sender.publicKey, subtractBalance, mempool, blockchain)
        blockchain.addBlock(mempool.transactions)
      })

      describe('and the sender sends another tx to the recipient', () => {
        beforeEach(() => {
          mempool.clear()
          sender.createTx(wallet.publicKey, addBalance, mempool, blockchain)
          blockchain.addBlock(mempool.transactions)
        })
        it('calculate the recipient balance only using the transactions since the most recent one', () => {
          expect(wallet.calcBalance(blockchain)).toEqual(recipientBalance - subtractBalance + addBalance)
        })
      })
    })
  })
})
