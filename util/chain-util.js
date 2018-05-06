const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const uuidV1 = require('uuid/v1')
const SHA256 = require('crypto-js/sha256')


class ChainUtil {
  /**
  * Uses the Ellyptic Curve module to generate a new keypair
  * @returns {Object} Public/Private keypair and functions
  **/
  static generateKeys() {
    return ec.genKeyPair()
  }

  /**
  * Use the uuid module to generate a 32-character unique transaction id
  * @returns {string} transaction id
  **/
  static id() {
    return uuidV1()
  }

  /**
  * Takes the SHA256 of the input
  * @param {Object} data Either a transaction class instance object or blockdata for a new block
  * @returns {string} Sha256 hash of the data
  **/
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString()
  }

  /**
  * Verify a signature through the EC module's verify method
  * Decrypting the signature with the public key should result in the dataHash if the signature is valid
  * @param {hex} publicKey
  * @param {Object} signature
  * @param {string} dataHash
  * @returns {bool} valid/invalid
  **/
  static verifySig(publicKey, signature, dataHash) {
    publicKey =  ec.keyFromPublic(publicKey, 'hex')
    return publicKey.verify(dataHash, signature) //true or false
  }
}

module.exports = ChainUtil
