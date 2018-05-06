const Websocket = require('ws')

const P2P_PORT = process.env.P2P_PORT || 5001
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
//$ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  tx: 'TX',
  clearTx: 'CLEARTX'
}

class P2Pserver {
  constructor(blockchain, mempool) {
    this.blockchain = blockchain
    this.mempool = mempool
    //List of websocket servers that connect to this one
    this.sockets = []
  }

  //Starting the server and creating it
  listen() {
    const server = new Websocket.Server({ port: P2P_PORT })
    //event listener to fire code when a socket connects to the server
    server.on('connection', socket => this.connectSocket(socket))
    this.connectToPeers()
    console.info(`===== Listening for P2P connections on port ${P2P_PORT}. =====`)
  }

  connectSocket(socket) {
    this.sockets.push(socket)
    console.info(`----- SOCKET CONNECTED: ${socket._socket.remoteAddress}:${socket._socket.remotePort} -----`)
    this.messageHandler(socket)
    socket.send(JSON.stringify(this.blockchain.chain))
  }

  //Connect to an existing WS server
  connectToPeers() {
    peers.forEach(peer => {
      //eg. peer = 'ws://localhost:5002'
      const socket = new Websocket(peer)
      socket.on('open', () => this.connectSocket(socket))
    })
  }

  messageHandler(socket) {
    socket.on('message', message => {
      const data = JSON.parse(message);
      switch(data.type) {
        //Replace chain with longest if necessary
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain)
          break
        case MESSAGE_TYPES.tx:
          this.mempool.updateOrAddTx(data.tx)
          break
        case MESSAGE_TYPES.clearTx:
          this.mempool.clear()
          break
      }
    })
  }

  syncChains() {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain}))
    })
  }

  broadcastTx(transaction) {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: MESSAGE_TYPES.tx,
        tx: transaction
      }))
    })
  }

  broadcastClearTx() {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: MESSAGE_TYPES.clearTx
      }))
    })
  }
}

module.exports = P2Pserver
