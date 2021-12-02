import React, {useEffect, useState, useReducer, createContext} from "react";
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
import {createsKeyPair, decryptASYN, verifySignature, decryptSYM} from "./utils/CryptoFunctions";
import {nextWeek} from "./utils/DateFunctions";
import Typography from "@mui/material/Typography";
import {Alert, Paper, Snackbar, Tooltip} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {useCookies} from 'react-cookie';
import {userPrivateKey as userPK} from "./assets/DummyData";

// Declare IPFS
export const ipfs = create({host: 'ipfs.infura.io', port: 5001, protocol: 'https'}) // leaving out the arguments will default to these values

// Context for storing certificates
export const CertificatesContext = createContext({})

const COOKIE_NAME = "userPrivateKey"

export const ACTIONS = {
  NEW_USER: "new_user",
  SET_ADDRESS: "set_address",
  SET_PUBLIC_KEY: "set_public_key",
  PUBLIC_KEY_SAVED: "public_key_saved",
  CLOSE_SNACKBAR: "close_snackbar",
  LOADING: "loading",
  SET_BLOCKCHAIN_CERTIFICATES: "set_blockchain_certificates",
  SET_AWAITING_CERTIFICATES: "set_awaiting_certificates",
  SET_CERTIFICATES: "set_certificates",
  ACCOUNT_DISCONNECTED: "account_disconnected",
  CERTIFICATE_ACCEPTED: "certificate_accepted"
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.NEW_USER:
      return {
        ...state,
        generatedKeys: action.payload,
        isNewUser: true
      }
    case ACTIONS.SET_PUBLIC_KEY:
      return {
        ...state,
        publicKey: action.payload
      }
    case ACTIONS.CLOSE_SNACKBAR:
      return {
        ...state,
        snackbarOpen: false
      }
    case ACTIONS.PUBLIC_KEY_SAVED:
      return {
        ...state,
        loading: false,
        generatedKeys: {},
        isNewUser: false,
        snackbarOpen: true,
        publicKey: action.payload
      }
    case ACTIONS.LOADING:
      return {
        ...state,
        loading: true
      }
    case ACTIONS.SET_ADDRESS:
      return {
        ...state,
        address: action.payload
      }
    case ACTIONS.SET_BLOCKCHAIN_CERTIFICATES:
      return {
        ...state,
        blockchainCertificates: [...state.blockchainCertificates, action.payload]
      }
    case ACTIONS.SET_AWAITING_CERTIFICATES:
      return {
        ...state,
        awaitingCertificates: [...state.awaitingCertificates, action.payload]
      }
    case ACTIONS.SET_CERTIFICATES:
      return {
        ...state,
        certificates: [...state.certificates, action.payload]
      }
    case ACTIONS.ACCOUNT_DISCONNECTED:
      return {
        address: "",
        publicKey: "",
        blockchainCertificates: [],
        awaitingCertificates: [],
        certificates: [],
        generatedKeys: {},
        isNewUser: false,
        loading: false,
        snackbarOpen: false,
      }
    case ACTIONS.CERTIFICATE_ACCEPTED:
      return {
        ...state,
        certificates: [...state.certificates, action.payload],
        awaitingCertificates: state.awaitingCertificates.filter(el => el !== action.payload)
      }
    default:
      return state
  }
}

function App() {
  const history = useHistory()
  const [cookie, setCookie] = useCookies([COOKIE_NAME]);
  const [state, dispatch] = useReducer(reducer, {
    address: "",
    publicKey: "",
    blockchainCertificates: [], // blockchain certificates
    awaitingCertificates: [], // certificates not yet accepted by user, ( they need to be encrypted by user )
    certificates: [], // user certificates
    generatedKeys: {},
    isNewUser: false,
    loading: false,
    snackbarOpen: false,
  })

  //Certificates
  const [certificateStorage, setCertificateStorage] = useState({})
  const [keysProvider, setKeysProvider] = useState({})

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
    dispatch({type: ACTIONS.SET_ADDRESS, payload: accounts[0]})

    // Getting the contract
    const networkId = await web3.eth.net.getId()
    const dataCS = CertificatesStorage.networks[networkId]
    const dataKP = KeysProvider.networks[networkId]

    if (dataCS && dataKP) {
      // getting keysProvider certificate
      const keysProvider = new web3.eth.Contract(KeysProvider.abi, dataKP.address)
      setKeysProvider(keysProvider)

      const userPublicKey = await keysProvider.methods.publicKeys(accounts[0]).call()

      if (userPublicKey === "") {
        // new user
        const keys = createsKeyPair()
        dispatch({type: ACTIONS.NEW_USER, payload: keys})
      } else {
        dispatch({type: ACTIONS.SET_PUBLIC_KEY, payload: userPublicKey})
      }

      // getting certificatesStorage certificate
      const certificatesStorage = new web3.eth.Contract(CertificatesStorage.abi, dataCS.address)
      setCertificateStorage(certificatesStorage)

      const userCertificates = await certificatesStorage.methods.getCertificates().call({from: accounts[0]})

      // Load certificates
      for (const certificate of userCertificates) {
        dispatch({type: ACTIONS.SET_BLOCKCHAIN_CERTIFICATES, payload: certificate})

        // Getting issuer public key
        const issuerPublicKey = await keysProvider.methods.publicKeys(certificate.issuer).call()

        if(certificate.isAccepted) {
          // certificates encrypted by user

          // Getting encrypted certificate from ipfs
          axios.get(`https://ipfs.infura.io/ipfs/${certificate.ipfsHash}`)
            .then(response => {
              const encryptedCertificate = response.data
              //todo
              const userPrivateKey = userPK

              const {decryptedCertificate, signature, nonce} = decryptSYM(encryptedCertificate, userPrivateKey)
              const isCertificateVerify = verifySignature(decryptedCertificate, signature, issuerPublicKey)

              // check if signature is correct
              if (!isCertificateVerify) return

              // Add only certificates with correct signature
              dispatch({type: ACTIONS.SET_CERTIFICATES, payload: {id: certificate.id, decryptedCertificate, signature, nonce}})
            })

        }else {
          // new certificates, encrypted by certificates authority

          // Getting encrypted certificate from ipfs
          axios.get(`https://ipfs.infura.io/ipfs/${certificate.ipfsHash}`)
            .then(response => {
              const {encryptedCertificate, signature} = response.data

              const decryptedCertificate = decryptASYN(encryptedCertificate, issuerPublicKey, cookie.userPrivateKey)
              const isCertificateVerify = verifySignature(decryptedCertificate, signature, issuerPublicKey)

              // check if signature is correct
              if (!isCertificateVerify) return

              // Add only certificates with correct signature
              dispatch({type: ACTIONS.SET_AWAITING_CERTIFICATES, payload: {id: certificate.id, decryptedCertificate, signature, nonce: encryptedCertificate.nonce}})
            })
        }
      }
    } else {
      window.alert("CertificatesStore or KeysProvider contract not deployed to detected network")
    }
  }

  function savePublicKey() {
    // save private key to blockchain
    dispatch({type: ACTIONS.LOADING})

    keysProvider.methods.addKey(state.generatedKeys.publicKey).send({from: state.address})
      .on('transactionHash', () => {
      setCookie(COOKIE_NAME, state.generatedKeys.secretKey, {path: '/', expires: nextWeek()});
      dispatch({type: ACTIONS.PUBLIC_KEY_SAVED, payload: state.generatedKeys.publicKey})
    })
  }

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <StartPage
            connected={state.address !== ''}
            connectToWallet={connectToWallet}
          />

          {/*Dialog window*/}
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
                loading={state.loading}
                variant="contained">
                Close the window
              </LoadingButton>
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
          <CertificatesContext.Provider value={{certificateStorage, keysProvider}}>
            <Account
              address={state.address}
              certificates={state.certificates}
              awaitingCertificates={state.awaitingCertificates}
              dispatch={dispatch}
            />
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
