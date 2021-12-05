import React from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {useHistory} from 'react-router-dom'

export default function Header({authorityAccount, connected, connectToWallet}) {
  const history = useHistory()

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <img
            src="/logoChainLock.png"
            alt="chainLockLogo"
            width="100"
            height="50"
          />
          <div style={{flexGrow: 1}}/>
          {
            connected ?
              <CheckCircleIcon sx={{color: "limegreen", mr: 1}}/>
              :
              <CancelIcon sx={{color: "red", mr: 1}}/>
          }
          <Typography variant="caption" component="div" sx={{mr: 2}}>
            {connected ? "MetaMask connected" : "MetaMask not connected"}
          </Typography>
          {
            connected ?
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => {
                  const path = authorityAccount ? "/account/issueCertificate": "/account/certificates"
                  history.push(path)
                }}
              >Go to your profile</Button>
              :
              <Button
                color="inherit"
                variant="outlined"
                onClick={connectToWallet}
              >Connect your wallet</Button>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}