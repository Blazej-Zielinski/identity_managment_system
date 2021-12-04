import React, {useState, useContext} from "react";
import {Alert, Box, Grid, Snackbar, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {ipfs} from "../App";
import {CertificatesContext} from "../App";
import {createSignature, encryptASYN} from "../utils/CryptoFunctions";
import {camelcaseToWords} from "../utils/StringFunctions";
import {useCookies} from "react-cookie";
import {COOKIE_NAME} from "../assets/CookieName";

const defaultState = (fields) => {
  const initialValue = {};
  return fields.reduce((obj, item) => {
    return {
      ...obj,
      [item]: "",
    };
  }, initialValue);
}

export default function CertificateForm({address, type, fields}) {
  const [state, setState] = useState(defaultState(fields))
  const [receiverAddress, setReceiverAddress] = useState("0xA40CfeAb2Fd477f0da91dF4481AC5B6944C6BF91")
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const {certificateStorage, keysProvider} = useContext(CertificatesContext)
  const [cookie] = useCookies([COOKIE_NAME]);

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
    const authorityPrivateKey = cookie[COOKIE_NAME]

    const certificate = {type, state}

    // Encrypt certificate todo change getting sender private key
    const encryptedCertificate = encryptASYN(certificate, receiverPublicKey, authorityPrivateKey)

    // Create sender signature
    const signature = createSignature(certificate, authorityPrivateKey)

    // Adding certificate to ipfs
    const cid = await ipfs.add(JSON.stringify({encryptedCertificate, signature}))

    certificateStorage.methods.createCertificate(receiverAddress, cid.path)
      .send({from: address})
      .on('transactionHash', () => {
        setSnackbarOpen(true)
        setReceiverAddress("")
        setState(defaultState(fields))
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
            label="Receiver address"
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