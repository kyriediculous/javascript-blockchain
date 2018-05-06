const Wallet = require('../wallet')
const Transaction = require('../transaction')
const {BLOCK_REWARD} = require('../../blockchain/config/config')
describe('Succesful transaction', () => {
  let transaction, wallet, recipient, amount

  beforeEach(() => {
    wallet = new Wallet()
    amount = 50 //Anything
    recipient = '0x0'
    //Sender Wallet, receiver, amount
    transaction = Transaction.newTx(wallet, recipient, amount)
  })

  it('Outputs the `amount` substracted from the wallet balance', () => {
    let senderOutput = transaction.outputs.find(output => output.address === wallet.publicKey)
    expect(senderOutput.amount).toEqual(wallet.balance - amount)
  })
  it('Outputs the `amount` added to the recipient', () => {
    let receiverOutput = transaction.outputs.find(output => output.address === recipient)
    expect(receiverOutput.amount).toEqual(amount)
  })
  it('Inputs the balance of the wallet', () => {
    expect(transaction.input.balance).toEqual(wallet.balance)
  })
  it('Validates a valid transaction', () => {
    expect(Transaction.verifyTx(transaction)).toBe(true)
  })
  it('Invalidates a corrupt transaction output', () => {
    transaction.outputs[0].amount = 50000
    expect(Transaction.verifyTx(transaction)).toBe(false)
  })

  describe('Unsuccesful transaction: insufficient balance', () => {
    beforeEach(() => {
      amount = 50000
      transaction = Transaction.newTx(wallet, recipient, amount)
    })
    it('does not create a succesful transaction',() => {
      expect(transaction).toEqual(undefined)
    })
  })

  describe('Update transaction', () => {
    let nextAmount, nextReceiver
    beforeEach(() => {
      nextAmount = 5
      nextReceiver = '0x1'
      transaction = transaction.updateTx(wallet, nextReceiver, nextAmount)
    })
    it('Substracts the next amount from the sender output', () => {
      senderOutput = transaction.outputs.find(output => output.address === wallet.publicKey)
      expect(senderOutput.amount).toEqual(wallet.balance-amount-nextAmount)
    })
    it('Outputs an amount for the next receiver', () => {
      nextReceiverOutput = transaction.outputs.find(output => output.address === nextReceiver)
      expect(nextReceiverOutput.amount).toEqual(nextAmount)
    })
  })

  describe('Creating a reward transaction', () => {
    beforeEach(() => {
      tx = Transaction.rewardTx(wallet, Wallet.blockchainWallet())
      it('Rewards the miners wallet', () => {
        let minerOutput = tx.outputs.find(output => wallet.publicKey)
        expect(minerOutput.amount).toEqual(BLOCK_REWARD)
      })
    })
  })

})
