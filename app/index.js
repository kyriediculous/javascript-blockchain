const express = require('express')
const bodyParser = require('body-parser')
const Blockchain = require('../blockchain/blockchain')
const P2Pserver = require('./p2pserver')
const Wallet = require('../wallet/wallet')
const MemPool = require('../wallet/mempool')
const Miner = require('./miner')
const HTTP_PORT = process.env.HTTP_PORT || 3001

const app = express()
const blockchain = new Blockchain()
const wallet = new Wallet()
const mempool = new MemPool()
//pass the wallet and blockchain instances to the p2pServer for sync
const p2pServer = new P2Pserver(blockchain, mempool)
const miner = new Miner(blockchain, mempool, wallet, p2pServer)

app.use(bodyParser.json())

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain)
})

app.get('/api/mempool/', (req, res) => {
  res.json(mempool.transactions)
})

app.get('/api/address', (req, res) => {
  res.json({publicKey: wallet.publicKey, balance: wallet.calcBalance(blockchain)})
})

app.get('/api/wallet/:address', (req, res) => {
  res.json(Wallet.walletInfo(req.params.address, blockchain))
})

app.get('/api/miner', (req, res) => {
  const block = miner.mine()
  console.info("### NEW BLOCK FOUND ###", block.toString())
  res.redirect('/api/blocks')
})

app.post('/api/send', (req, res) => {
  const { receiver, amount } = req.body;
  const transaction = wallet.createTx(receiver, amount, mempool, blockchain)
  p2pServer.broadcastTx(transaction)
  res.redirect('/api/mempool')
})

app.post('/api/mine', (req, res) => {
  let block = blockchain.addBlock(req.body.data)
  console.info(`===== New Block Added =====
    ${block}`)
  p2pServer.syncChains()
  res.redirect('/api/blocks')
})

app.listen(HTTP_PORT, () => {
  console.info(`===== Server running on port ${HTTP_PORT} =====`)
})
p2pServer.listen()
