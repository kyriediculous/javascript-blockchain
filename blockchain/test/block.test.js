const Block = require('../block')
const { DIFFICULTY } = require('../config/config')

describe('Block', () => {
  let data, lastBlock, block
  beforeEach(() => {
    data = 'bar'
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data)
  })
  it('Sets the `data` to match the input', () => {
    expect(block.data).toEqual(data)
  })
  it('Sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash)
  })
  it('Generates a hash that matches the difficulty', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty))
    console.log(block.toString())
  })
  it('Lowers the difficulty for slowly mined blocks', () => {
    expect(Block.adjustDiff(block, block.timestamp+3000)).toEqual(block.difficulty-1)
  })
  it('Raises the difficulty for quickly mined blocks', () => {
    expect(Block.adjustDiff(block, block.timestamp-1500)).toEqual(block.difficulty+1)
  })
})
