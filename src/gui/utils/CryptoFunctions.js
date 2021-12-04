import CryptoJS from 'crypto-js'
import AsyCrypto from 'asymmetric-crypto'


export function createsKeyPair() {
  return AsyCrypto.keyPair()
}

export function validatePrivateKey(secretKey, publicKey) {
  if(secretKey.length !== 88) return false

  const newKeyPair = AsyCrypto.fromSecretKey(secretKey)
  return newKeyPair.publicKey === publicKey
}

export function encryptASYN(data, receiverPublicKey, senderPrivateKey) {
  return AsyCrypto.encrypt(JSON.stringify(data), receiverPublicKey, senderPrivateKey)
}
// -> {
//   data: '63tP2r8WQuJ+k+jzsd8pbT6WYPHMTafpeg==',
//   nonce: 'BDHALdoeBiGg7wJbVdfJhVQQyvpxrBSo'
// }

export function decryptASYN(encryptedData, senderPublicKey, receiverPrivateKey) {
  return JSON.parse(AsyCrypto.decrypt(encryptedData.data, encryptedData.nonce, senderPublicKey, receiverPrivateKey))
}

export function createSignature(data, senderPrivateKey) {
  return AsyCrypto.sign(JSON.stringify(data), senderPrivateKey)
}

export function verifySignature(data, signature, senderPublicKey){
  return AsyCrypto.verify(JSON.stringify(data), signature, senderPublicKey)
}

export function encryptSYM(data, privateKey) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), privateKey).toString()
}

export function decryptSYM(ciphertext, privateKey) {
  let bytes = CryptoJS.AES.decrypt(ciphertext, privateKey)

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

