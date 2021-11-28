import React, {useState, useContext} from "react";
import {Alert, Box, Grid, Snackbar, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {ipfs} from "../App";
import {CertificatesContext} from "../App";
import {createSignature, encryptASYN} from "../utils/CryptoFunctions";
import {camelcaseToWords} from "../utils/StringFunctions";

export default function CertificateForm({address, type, fields}) {
  const [state, setState] = useState(() => {
    const initialValue = {};
   return fields.reduce((obj, item) => {
      return {
        ...obj,
        [item]: "",
      };
    }, initialValue);
  })
  const [receiverAddress, setReceiverAddress] = useState("0xA40CfeAb2Fd477f0da91dF4481AC5B6944C6BF91")
  const [senderPrivateKey, setSenderPrivateKey] = useState("6zRP0nBASVjhudLqyk/F7UXqUjaxKNB3TDgfnqJiw0yXqm8FL0bMd/xklJcuHi7CMV9/wTTHiH0TYpVbgxxWWg==")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const {certificateStorage, keysProvider} = useContext(CertificatesContext)

  function handleChange(evt) {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value
    });
  }

  async function sendCertificate() {
    // Getting receiver public key
    const receiverPublicKey = await keysProvider.methods.publicKeys(receiverAddress).call()

    const certificate = {type , state}

    // Encrypt certificate todo change getting sender private key
    const encryptedCertificate = encryptASYN(certificate, receiverPublicKey, senderPrivateKey)

    // Create sender signature
    const signature = createSignature(certificate, senderPrivateKey)

    // Adding certificate to ipfs
    const cid = await ipfs.add(JSON.stringify({encryptedCertificate, signature}))

    certificateStorage.methods.createCertificate(receiverAddress, cid.path)
      .send({from: address})
      .on('transactionHash', () => {
        setSnackbarOpen(true)
      })
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 2}}>
      <Grid container spacing={5} sx={{width: "70%", maxWidth: 1000}}>
        {
          fields.map((el, idx) =>
            <Grid item xs={6} key={idx}>
              <TextField
                required
                value={state[el]}
                name={el}
                label={camelcaseToWords(el)}
                onChange={handleChange}
                id="outlined-required"
                sx={{width: "100%"}}
              />
            </Grid>)
        }
        <Grid item xs={6}>
          <TextField
            required
            value={receiverAddress}
            name="receiverAddress"
            onChange={evt => setReceiverAddress(evt.target.value)}
            id="outlined-required"
            label="Receiver address"
            sx={{width: "100%"}}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            required
            value={senderPrivateKey}
            name="senderPrivateKey"
            onChange={evt => setSenderPrivateKey(evt.target.value)}
            id="outlined-required"
            label="Sender Private Key"
            sx={{width: "100%"}}
          />
        </Grid>
      </Grid>

      <Grid container spacing={5} justifyContent="center" sx={{width: "70%", maxWidth: 1000, mt: 0}}>
        <Grid item xs={6}>
          <Button
            onClick={sendCertificate}
            variant="contained"
            size="large"
            sx={{width: "100%"}}>
            Issue Certificate
          </Button>
        </Grid>
      </Grid>

      {/*Snackbar*/}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{width: '100%'}}>
          Certificate Send
        </Alert>
      </Snackbar>
    </Box>
  )
}