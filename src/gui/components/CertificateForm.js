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
      [item]: {value: "", isValid: true},
    };
  }, initialValue);
}

export default function CertificateForm({address, type, fields}) {
  const textFields = [...fields, "receiverAddress"]
  const [state, setState] = useState(defaultState(textFields))
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false)
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false)
  const {certificateStorage, keysProvider} = useContext(CertificatesContext)
  const [cookie] = useCookies([COOKIE_NAME]);

  function handleChange(evt) {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: {...state[evt.target.name], value}
    });
  }

  function validateInput() {
    let isInputValid = true

    for (const [key, el] of Object.entries(state)) {
      if (el.value === "") {
        isInputValid = false
        setState(prevState => ({
          ...prevState,
          [key]: {...prevState[key], isValid: false}
        }))
      } else {
        setState(prevState => ({
          ...prevState,
          [key]: {...prevState[key], isValid: true}
        }))
      }
    }

    const regex = /^(0x)([A-Fa-f0-9]{40})$/
    if(!regex.test(state.receiverAddress.value)) {
      isInputValid = false
      setState(prevState => ({
        ...prevState,
        receiverAddress: {...prevState.receiverAddress, isValid: false}
      }))
    } else {
      setState(prevState => ({
        ...prevState,
        receiverAddress: {...prevState.receiverAddress, isValid: true}
      }))
    }

    return isInputValid
  }

  async function sendCertificate() {
    // checking if input is valid
    if (!validateInput()) return

    // Getting receiver public key
    const receiverAddress = state.receiverAddress.value
    const receiverPublicKey = await keysProvider.methods.publicKeys(receiverAddress).call()
    const authorityPrivateKey = cookie[COOKIE_NAME]

    // If user with this address doesnt exit
    if(receiverPublicKey === "") {
      setErrorSnackbarOpen(true)
      setState(prevState => ({
        ...prevState,
        receiverAddress: {...prevState.receiverAddress, isValid: false}
      }))
      return
    }

    // Getting only input values from state
    const inputsValues = {}
    for (const key of fields) {
      inputsValues[key] = state[key].value
    }

    const certificate = {type, state: inputsValues}

    // Encrypt certificate
    const encryptedCertificate = encryptASYN(certificate, receiverPublicKey, authorityPrivateKey)

    // Create sender signature
    const signature = createSignature(certificate, authorityPrivateKey)

    // Adding certificate to ipfs
    const cid = await ipfs.add(JSON.stringify({encryptedCertificate, signature}))

    certificateStorage.methods.createCertificate(receiverAddress, cid.path)
      .send({from: address})
      .on('transactionHash', () => {
        setSuccessSnackbarOpen(true)
        setState(defaultState(textFields))
      })
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", mt: 2}}>
      <Grid container spacing={5} sx={{width: "70%", maxWidth: 1000}}>
        {
          textFields.map((el, idx) =>
            <Grid item xs={6} key={idx}>
              <TextField
                required
                error={!state[el].isValid}
                value={state[el].value}
                name={el}
                label={camelcaseToWords(el)}
                onChange={handleChange}
                sx={{width: "100%"}}
              />
            </Grid>)
        }
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

      {/*Success Snackbar*/}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbarOpen(false)}>
        <Alert
          onClose={() => setSuccessSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{width: '100%'}}>
          Certificate Send
        </Alert>
      </Snackbar>

      {/*Success Snackbar*/}
      <Snackbar
        open={errorSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setErrorSnackbarOpen(false)}>
        <Alert
          onClose={() => setErrorSnackbarOpen(false)}
          severity={"error"}
          variant="filled"
          sx={{width: '100%'}}>
          No such user exists
        </Alert>
      </Snackbar>
    </Box>
  )
}