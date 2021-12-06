import React, {useState,useEffect, useContext} from "react";
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {green} from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Alert, Avatar, Grid, Paper, Snackbar, Tooltip} from "@mui/material";
import Divider from "@mui/material/Divider";
import CheckIcon from '@mui/icons-material/Check';
import {camelcaseToWords} from "../utils/StringFunctions"
import {certificateIconPicker} from "../utils/IconPicker"
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import AssignmentIcon from '@mui/icons-material/Assignment';
import {SizedAvatar} from "../utils/StyledComponents";
import {ipfs,CertificatesContext} from "../App";
import {encryptSYM} from "../utils/CryptoFunctions";
import {useCookies} from "react-cookie";
import {COOKIE_NAME} from "../assets/CookieName";
import {ACTIONS} from "../assets/AppReducer";

const ExpandMore = styled((props) => {
  const {expand, ...other} = props;
  return <IconButton {...other} />;
})(({theme, expand}) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Certificate({address, data, dispatch= undefined, isCertificateAccepted = true}) {
  const [expanded, setExpanded] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const {certificateStorage} = useContext(CertificatesContext)
  const [cookie] = useCookies([COOKIE_NAME]);

  useEffect(() => {
    console.log(data)
  })

  async function acceptCertificate() {
    const {decryptedCertificate, signature, nonce, id} = data
    const userPrivateKey = cookie[COOKIE_NAME]

    // User encrypts certificate
    const encryptedData = encryptSYM({decryptedCertificate, signature, nonce}, userPrivateKey)

    // Adding certificate to ipfs
    const cid = await ipfs.add(JSON.stringify(encryptedData))

    certificateStorage.methods.acceptCertificate(id, cid.path)
      .send({from: address})
      .on('transactionHash', () => {
        setSnackbarOpen(true)
        dispatch({type:ACTIONS.CERTIFICATE_ACCEPTED, payload: data})
      })
  }

  return (
    <Card raised={true} sx={{width: 700}}>
      <CardHeader
        avatar={
          <Avatar variant="rounded">
            {certificateIconPicker(data.decryptedCertificate.type)}
          </Avatar>
        }
        action={
          <SizedAvatar size={4} sx={{backgroundColor: green[500]}}>
            <CheckIcon/>
          </SizedAvatar>
        }
        title={
          <Typography variant="h6">
            {data.decryptedCertificate.type}
          </Typography>
        }
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider/>
        <CardContent>
          <Grid container spacing={2}>
            {
              Object.entries(data.decryptedCertificate.state).map(([property, value], idx) =>
                <Grid item xs={6} key={idx}>
                  <Typography variant="body2" color="text.secondary">
                    {`${camelcaseToWords(property)}: ${value}`}
                  </Typography>
                </Grid>
              )
            }
          </Grid>
        </CardContent>
      </Collapse>
      <CardActions disableSpacing>
        {!isCertificateAccepted &&
        <Button
          variant={"text"}
          size={"small"}
          onClick={acceptCertificate}>
          Accept Certificate
        </Button>
        }
        <Tooltip title="Open signature">
          <IconButton aria-label="add to favorites" onClick={() => setOpenDialog(true)}>
            <AssignmentIcon/>
          </IconButton>
        </Tooltip>
        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon/>
        </ExpandMore>
      </CardActions>

      {/*Dialog window*/}
      <Dialog open={openDialog} maxWidth="md" onClose={() => setOpenDialog(false)}>
        <DialogTitle>Certificate signature</DialogTitle>
        <DialogContent>
          <Typography variant="overline">
            Sign by
          </Typography>
          <Paper variant="outlined" sx={{p: 2, mb: 3}}>
            <Tooltip title="Copy to clipboard" placement="top">
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText("")
                }}>
                {data.authorityName}
              </Button>
            </Tooltip>
          </Paper>
          <Typography variant="overline">
            Signature
          </Typography>
          <Paper variant="outlined" sx={{p: 2, mb: 3}}>
            <Tooltip title="Copy to clipboard" placement="top">
              <Button
                variant="text"
                size="small"
                sx={{textTransform: "none"}}
                onClick={() => {
                  navigator.clipboard.writeText(data.signature)
                }}>
                {data.signature}
              </Button>
            </Tooltip>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
          Certificate Accepted
        </Alert>
      </Snackbar>
    </Card>
  );
}