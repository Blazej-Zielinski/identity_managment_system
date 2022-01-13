import React, {createContext, useEffect, useReducer} from "react";
import {Route, Switch, useHistory} from 'react-router-dom';
import Web3 from "web3";
import CertificatesStorage from '../build/CertificatesStorage.json'
import KeysProvider from '../build/PublicKeysProvider.json'
import StartPage from "./views/StartPage";
import Error404 from "./views/Error404";
import Account from "./views/Account";
import {create} from 'ipfs-http-client'
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {createsKeyPair, decryptASYN, validatePrivateKey, verifySignature} from "./utils/CryptoFunctions";
import {nextWeek} from "./utils/DateFunctions";
import Typography from "@mui/material/Typography";
import {Alert, FormHelperText, Paper, Snackbar, TextField, Tooltip} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {useCookies} from 'react-cookie';
import {COOKIE_NAME} from "./assets/CookieName";
import {ACTIONS, reducer} from "./assets/AppReducer";
import LoadingPage from "./views/LoadingPage";

// Declare IPFS
export const ipfs = create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'}) // leaving out the arguments will default to these values

// Context for storing certificates
export const CertificatesContext = createContext({})

function App() {
  const history = useHistory()
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);
  const [state, dispatch] = useReducer(reducer, {
    certificateStorage: {}, // certificate object
    keysProvider: {}, // certificate object
    isCertificateAuthorityAccount: false,
    address: "",
    publicKey: "",
    blockchainCertificates: [], // blockchain certificates
    awaitingCertificates: [], // certificates not yet accepted by user, ( they need to be encrypted by user )
    certificates: [], // user certificates
    generatedKeys: {},
    isNewUser: false,
    loadingButton: false,
    snackbarOpen: false,
    isPrivateKeyCookieSet: true,
    isPrivateKeyValid: true,
    privateKeyField: "",
    loadingBlockchainData: true
  })

  useEffect(() => {
    async function checkIfWalletConnected() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
      }

      const accounts = await window.web3.eth.getAccounts()
      if (accounts > 0) {
        dispatch({type: ACTIONS.SET_ADDRESS, payload: accounts[0]})
        await loadBlockChainData()
      }
    }

    checkIfWalletConnected()

    // handle event accountsChanged and account disconnected
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) dispatch({type: ACTIONS.SET_ADDRESS, payload: accounts[0]});
      else dispatch({type: ACTIONS.ACCOUNT_DISCONNECTED});
      history.push("/")
    });
  }, [history])

  async function connectToWallet() {
    await loadWeb3()
    await loadBlockChainData()
  }

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      //this function enables metamask popup window
      await window.ethereum.request({method: 'eth_requestAccounts'})
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying Metamask!')
    }
  }

  async function loadBlockChainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    const userAddress = accounts[0]
    dispatch({type: ACTIONS.SET_ADDRESS, payload: userAddress})

    // Getting the contract
    const networkId = await web3.eth.net.getId()
    const dataKP = KeysProvider.networks[networkId]
    const dataCS = CertificatesStorage.networks[networkId]

    if (dataKP && dataCS) {
      // getting keysProvider contract
      const keysProvider = new web3.eth.Contract(KeysProvider.abi, dataKP.address)
      dispatch({type: ACTIONS.SET_KEYS_PROVIDER_CERTIFICATE, payload: keysProvider})

      const userPublicKey = await keysProvider.methods.publicKeys(userAddress).call()

      if (userPublicKey === "") {
        // new user
        const keys = createsKeyPair()
        dispatch({type: ACTIONS.NEW_USER, payload: keys})
      } else {
        dispatch({type: ACTIONS.SET_PUBLIC_KEY, payload: userPublicKey})

        // check if privateKey cookie is set and if private key match public key
        if (!cookie[COOKIE_NAME] || !validatePrivateKey(cookie[COOKIE_NAME], userPublicKey)) {
          dispatch({type: ACTIONS.SECRET_KEY_COOKIE_NOT_SET})
        }
        // if it set properly load certificates
        else {
          await loadCertificates(cookie[COOKIE_NAME])
        }
      }

    dispatch({type: ACTIONS.BLOCKCHAIN_DATA_LOADED})
    } else {
      window.alert("CertificatesStore or KeysProvider contract not deployed to detected network")
    }
  }

  async function loadCertificates(userPrivateKey) {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    const userAddress = accounts[0]

    // Getting the contract
    const networkId = await web3.eth.net.getId()
    const dataKP = KeysProvider.networks[networkId]
    const dataCS = CertificatesStorage.networks[networkId]

    // getting keysProvider contract
    const keysProvider = new web3.eth.Contract(KeysProvider.abi, dataKP.address)

    // getting certificatesStorage contract
    const certificatesStorage = new web3.eth.Contract(CertificatesStorage.abi, dataCS.address)
    dispatch({type: ACTIONS.SET_CERTIFICATES_STORAGE_CERTIFICATE, payload: certificatesStorage})

    // check if account is Certificate Authority
    const certificatesAuthorityAddress = await keysProvider.methods.certificatesAuthority().call()
    if (certificatesAuthorityAddress === userAddress) {
      dispatch({type: ACTIONS.CERTIFICATES_AUTHORITY_LOGGED})

      // no need to load certificates
      return
    }

    // Load certificates
    const userCertificates = await certificatesStorage.methods.getCertificates().call({from: userAddress})
    for (const certificate of userCertificates) {
      dispatch({type: ACTIONS.SET_BLOCKCHAIN_CERTIFICATES, payload: certificate})

      // Getting issuer public key
      const issuerPublicKey = await keysProvider.methods.publicKeys(certificate.issuer).call()

      // Getting issuer name ( Authority name )
      const authorityName = await keysProvider.methods.authorityName().call()

      // Getting encrypted certificate from ipfs
      axios.get(`https://ipfs.infura.io/ipfs/${certificate.ipfsHash}`)
        .then(response => {
          const {encryptedCertificate, signature} = response.data

          const decryptedCertificate = decryptASYN(encryptedCertificate, issuerPublicKey, userPrivateKey)
          const isCertificateVerify = verifySignature(decryptedCertificate, signature, issuerPublicKey)

          // check if signature is correct
          if (!isCertificateVerify) return

          // Add only certificates with correct signature
          const type = certificate.isAccepted ? ACTIONS.SET_CERTIFICATES : ACTIONS.SET_AWAITING_CERTIFICATES
          const payload = {id: certificate.id, decryptedCertificate, signature, nonce: encryptedCertificate.nonce, authorityName}
          dispatch({type, payload})
        })
    }
  }

  async function savePublicKey() {
    // save private key to blockchain
    dispatch({type: ACTIONS.LOADING_BUTTON})

    state.keysProvider.methods.addKey(state.generatedKeys.publicKey).send({from: state.address})
      .on('transactionHash', async () => {
        setCookie(COOKIE_NAME, state.generatedKeys.secretKey, {path: '/', expires: nextWeek()});
        dispatch({type: ACTIONS.PUBLIC_KEY_SAVED, payload: state.generatedKeys.publicKey})
        await loadCertificates(state.generatedKeys.secretKey)
      })
  }

  async function savePrivateKey() {
    // validate private key
    const isPrivateKeyValid = validatePrivateKey(state.privateKeyField, state.publicKey)

    if (isPrivateKeyValid) {
      setCookie(COOKIE_NAME, state.privateKeyField, {path: '/', expires: nextWeek()});
      dispatch({type: ACTIONS.USER_INSERT_SECRET_KEY})
      await loadCertificates(state.privateKeyField)
    } else {
      dispatch({type: ACTIONS.USER_INSERT_INVALID_SECRET_KEY})
    }
  }

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <StartPage
            authorityAccount={state.isCertificateAuthorityAccount}
            connected={state.address !== ''}
            connectToWallet={connectToWallet}
          />

          {/*Dialog window for generating keys*/}
          <Dialog open={state.isNewUser} maxWidth="md">
            <DialogTitle>Copy your private key</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" sx={{mb: 3}}>
                Copy your private key and store it in save place. This is like a password to your account.
                Application doesn't store your private key but sometimes needs it. You don't have to copy your public
                key.
                Application permanently binds it to your account and store it on blockchain.
              </Typography>
              <Typography variant="overline">
                Your Public key
              </Typography>
              <Paper variant="outlined" sx={{p: 2, mb: 3}}>
                <Tooltip title="Copy to clipboard" placement="top">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(state.generatedKeys.publicKey)
                    }}>
                    {state.generatedKeys.publicKey}
                  </Button>
                </Tooltip>
              </Paper>
              <Typography variant="overline">
                Your Private key
              </Typography>
              <Paper variant="outlined" sx={{p: 2}}>
                <Tooltip title="Copy to clipboard" placement="top">
                  <Button
                    variant="text"
                    size="small"
                    sx={{textTransform: "none"}}
                    onClick={() => {
                      navigator.clipboard.writeText(state.generatedKeys.secretKey)
                    }}>
                    {state.generatedKeys.secretKey}
                  </Button>
                </Tooltip>
              </Paper>
            </DialogContent>
            <DialogActions>
              <LoadingButton
                onClick={savePublicKey}
                loading={state.loadingButton}
                variant="contained">
                Close the window
              </LoadingButton>
            </DialogActions>
          </Dialog>

          {/*Dialog window for inserting private key*/}
          <Dialog open={!state.isPrivateKeyCookieSet} maxWidth="md">
            <DialogTitle>Insert your private key</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" sx={{mb: 3}}>
                We cannot find your secret key. You see this message probably because cookies have expired or you are
                trying to use this app from another device. You need to pass your private key in order to access your
                account. Insert key into field bellow and save key.
              </Typography>
              <TextField
                error={!state.isPrivateKeyValid}
                value={state.privateKeyField}
                name="userPrivateKey"
                onChange={evt => dispatch({type: ACTIONS.PRIVATE_KEY_FIELD_CHANGES, payload: evt.target.value})}
                label="Secret key"
                sx={{width: "100%"}}
              >
              </TextField>
              <FormHelperText
                error={!state.isPrivateKeyValid}
                sx={state.isPrivateKeyValid && {visibility: "hidden"}}>
                Private key is invalid
              </FormHelperText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={savePrivateKey}
                variant="contained">
                Save key
              </Button>
            </DialogActions>
          </Dialog>

          {/*Snackbar*/}
          <Snackbar
            open={state.snackbarOpen}
            autoHideDuration={3000}
            onClose={() => dispatch({type: ACTIONS.CLOSE_SNACKBAR})}>
            <Alert
              onClose={() => dispatch({type: ACTIONS.CLOSE_SNACKBAR})}
              severity="success"
              variant="filled"
              sx={{width: '100%'}}>
              Key saved successfully!
            </Alert>
          </Snackbar>


        </Route>
        <Route path="/account">
          <CertificatesContext.Provider
            value={{
              certificateStorage: state.certificateStorage,
              keysProvider: state.keysProvider
            }}>
            {
              state.loadingBlockchainData ?
                <LoadingPage/>
                :
                <Account
                  authorityAccount={state.isCertificateAuthorityAccount}
                  address={state.address}
                  certificates={state.certificates}
                  awaitingCertificates={state.awaitingCertificates}
                  dispatch={dispatch}
                />
            }
          </CertificatesContext.Provider>
        </Route>
        <Route exact path="*">
          <Error404/>
        </Route>
      </Switch>

    </div>
  );
}

export default App;
