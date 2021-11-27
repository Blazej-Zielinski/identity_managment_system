import React from "react";
import Header from "../components/Header";
import {Paper, Typography} from "@mui/material";
import {makeStyles} from "@mui/styles";

const useStyles = makeStyles({
  mainContainer:{
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  card: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    borderRadius: "1em"
  },
});

export default function StartPage({connected, connectToWallet}) {
  const classes = useStyles()

  return (
    <div>
      <Header
        connected={connected}
        connectToWallet={connectToWallet}
      />
      <main style={{textAlign: "center"}}>
        <div className={classes.mainContainer}>
          <Typography variant="h2" component="div" sx={{mt: 5}}>
            ChainLock
          </Typography>
          <Typography variant="h5" component="div" sx={{mt: 2}}>
            The future of storing identity
          </Typography>

          <Paper elevation={3} sx={{mt: 10, px: 4, py: 8}} className={classes.card}>
            <Paper elevation={0} sx={{mr: 4}}>
              <img
                src="/logoChainLock.png"
                alt="chainLockLogo"
                width="200"
                height="100"
              />
            </Paper>
            <Paper elevation={0}>
              <Typography variant="h3" component="div" sx={{mb: 4}}>
                What is ChainLock?
              </Typography>
              <Typography variant="body1" component="div" >
                ChainLock is the future of storing your personal data.
                Unlike other identity systems, here you have control over
                your data yourself. You can be sure that no one is using
                your data without your knowledge.
              </Typography>
            </Paper>
          </Paper>
        </div>
      </main>
    </div>
  )
}