const Block = require('../block')
const Blockchain = require('../blockchain')

describe('Blockchain', () => {
  let blockchain, blockchain2
  beforeEach(() => {
    blockchain = new Blockchain()
    blockchain2 = new Blockchain()
  })

  it('Starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })

  it('Adds a new block', () => {
    let data = 'foo'
    blockchain.addBlock(data)
    expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(data)
  })

  it('Validates a valid chain', () => {
    blockchain2.addBlock('foo')
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(true)
  })

  it('Invalidates a chain with a corrupt genesis block', () => {
    //Changing the data will change the hash
    blockchain2.chain[0].data = 'Bad data'
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
  })

  it('Invalidates a corrupted chain', () => {
    //changing the data will change the hash
    blockchain2.addBlock('foo')
    blockchain2.chain[1].data = 'Not foo'
    expect(blockchain.isValidChain(blockchain2.chain)).toBe(false)
  })

  it('Replaces the chain with a valid chain', () => {
    blockchain2.addBlock('bar')
    //Genesis blocks are equal, blockchain2 is two blocks compared to one
    blockchain.replaceChain(blockchain2.chain)
    expect(blockchain.chain).toEqual(blockchain2.chain)
  })

  it('Does not replace a longer or equal length chain', () => {
    blockchain.addBlock('foo')
    //Trying to replace a blockchain of length 2 with one of length 1
    blockchain.replaceChain(blockchain2.chain)
    expect(blockchain.chain).not.toEqual(blockchain2.chain)
  })
})
