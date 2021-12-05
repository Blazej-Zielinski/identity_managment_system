import React from "react";
import {Box, Paper, Typography} from "@mui/material";


export default function Error404() {
  return (
    <Box sx={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Paper elevation={4} sx={{width: "30%", p:4, textAlign: "center"}}>
        <Typography variant={"h4"} gutterBottom>
          Error 404
        </Typography>
        <Typography variant={"body1"}>
          You are trying to access page that doesnt exists
        </Typography>
      </Paper>
    </Box>
  )
}