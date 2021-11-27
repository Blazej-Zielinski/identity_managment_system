import React, {useEffect} from "react";
import {
  createSignature,
  createsKeyPair,
  decryptASYN,
  encryptASYN,
  verifySignature,
  encryptSYM,
  decryptSYM
} from "../utils/CryptoFunctions";
import {useCookies} from 'react-cookie';
import {ID} from "../assets/CertificateSchemes"

export default function Error404() {
  const [cookies, setCookie] = useCookies(['myCookie']);

  useEffect(() => {
    setCookie('myCookie', 'PrivateKey', {path: '/', expires: new Date('2021-12-01')});

    const message = {
      name: "Adam",
      surname: "Smith"
    }

    const senderKeys = createsKeyPair()
    const receiverKeys = createsKeyPair()

    console.log({senderKeys})
    console.log({receiverKeys})

    const encryptedData = encryptASYN(message, receiverKeys.publicKey, senderKeys.secretKey)
    const decryptedData = decryptASYN(encryptedData, senderKeys.publicKey, receiverKeys.secretKey)

    console.log({encryptedData})
    console.log({decryptedData})

    const signature = createSignature(message, senderKeys.secretKey)
    const isSignatureValid = verifySignature(message, signature, senderKeys.publicKey)

    console.log({signature})
    console.log({isSignatureValid})

    const cipherText = encryptSYM(message, senderKeys.secretKey)
    const decodedText = decryptSYM(cipherText, senderKeys.secretKey)

    console.log({cipherText})
    console.log({decodedText})

    console.log(Object.keys(new ID()))

    // todo for uploading to ipfs
    // const object = JSON.stringify({
    //   title: "Student Card",
    //   signBy: "University",
    //   signature: "h455h...84hdg",
    //   extras: [
    //     "University name: Politechnika Krakowska",
    //     "Expiration date: 31.01.2022",
    //     "Student id: 130787"
    //   ]
    // })
    //
    // const cid = await ipfs.add(object)
    //
    // certificatesStorage.methods.createCertificate(cid.path, accounts[0], "privateKey")
    //   .send({from: accounts[0]})
    //   .on('transactionHash', () => {
    //     console.log("json added to ipfs")
    //   })
  }, [setCookie])

  return (
    <div>
      Error404
      <pre>
        {cookies.name && <h1>Hello {cookies.name}!</h1>}
      </pre>
    </div>
  )
}