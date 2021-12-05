export const ACTIONS = {
  NEW_USER: "new_user",
  SET_ADDRESS: "set_address",
  SET_PUBLIC_KEY: "set_public_key",
  PUBLIC_KEY_SAVED: "public_key_saved",
  CLOSE_SNACKBAR: "close_snackbar",
  LOADING_BUTTON: "loading_button",
  SET_BLOCKCHAIN_CERTIFICATES: "set_blockchain_certificates",
  SET_AWAITING_CERTIFICATES: "set_awaiting_certificates",
  SET_CERTIFICATES: "set_certificates",
  ACCOUNT_DISCONNECTED: "account_disconnected",
  CERTIFICATE_ACCEPTED: "certificate_accepted",
  USER_INSERT_SECRET_KEY: "user_insert_secret_key",
  USER_INSERT_INVALID_SECRET_KEY: "user_insert_invalid_secret_key",
  SECRET_KEY_COOKIE_NOT_SET: "secret_key_cookie_not_set",
  CERTIFICATES_AUTHORITY_LOGGED: "certificates_authority_logged",
  SET_CERTIFICATES_STORAGE_CERTIFICATE: "set_certificate_storage_certificate",
  SET_KEYS_PROVIDER_CERTIFICATE: "set_keys_provider_certificate",
  PRIVATE_KEY_FIELD_CHANGES: "private_key_field_changes",
  BLOCKCHAIN_DATA_LOADED: "blockchain_data_loaded"
}

export function reducer(state, action) {
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
    case ACTIONS.LOADING_BUTTON:
      return {
        ...state,
        loadingButton: true
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
        certificateStorage: {},
        keysProvider: {},
        isCertificateAuthorityAccount: false,
        address: "",
        publicKey: "",
        blockchainCertificates: [],
        awaitingCertificates: [],
        certificates: [],
        generatedKeys: {},
        isNewUser: false,
        loadingButton: false,
        snackbarOpen: false,
        isPrivateKeyCookieSet: true,
        isPrivateKeyValid: true,
        privateKeyField: "",
        loadingBlockchainData: true
      }
    case ACTIONS.CERTIFICATE_ACCEPTED:
      return {
        ...state,
        certificates: [...state.certificates, action.payload],
        awaitingCertificates: state.awaitingCertificates.filter(el => el !== action.payload)
      }
    case ACTIONS.USER_INSERT_SECRET_KEY:
      return {
        ...state,
        isPrivateKeyCookieSet: true,
        isPrivateKeyValid: true,
        snackbarOpen: true,
        privateKeyField: ""
      }
    case ACTIONS.USER_INSERT_INVALID_SECRET_KEY:
      return {
        ...state,
        isPrivateKeyValid: false
      }
    case ACTIONS.SECRET_KEY_COOKIE_NOT_SET:
      return {
        ...state,
        isPrivateKeyCookieSet: false
      }
    case ACTIONS.CERTIFICATES_AUTHORITY_LOGGED:
      return {
        ...state,
        isCertificateAuthorityAccount: true
      }
    case ACTIONS.SET_CERTIFICATES_STORAGE_CERTIFICATE:
      return {
        ...state,
        certificateStorage: action.payload
      }
    case ACTIONS.SET_KEYS_PROVIDER_CERTIFICATE:
      return {
        ...state,
        keysProvider: action.payload
      }
    case ACTIONS.PRIVATE_KEY_FIELD_CHANGES:
      return {
        ...state,
        privateKeyField: action.payload
      }
    case ACTIONS.BLOCKCHAIN_DATA_LOADED:
      return {
        ...state,
        loadingBlockchainData: false
      }
    default:
      return state
  }
}