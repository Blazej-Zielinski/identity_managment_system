import React, {useState} from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {styled} from '@mui/material/styles';
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Dropzone from "../components/Dropzone";
import {Grid, TextField} from "@mui/material";


const SizedAvatar = styled(Avatar)(({size, theme}) => ({
  width: theme.spacing(size),
  height: theme.spacing(size)
}))

export default function Profile() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Typography variant="h3">
        Profile
      </Typography>

      <Box sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>


        {/*Avatar*/}
        <Box sx={{mt: 4}}>
          <Tooltip title="App photo">
            <IconButton onClick={handleClickOpen}>
              <SizedAvatar size={30}/>
            </IconButton>
          </Tooltip>
        </Box>

        {/*Account info*/}
        <Grid container spacing={5} justifyContent="center" sx={{mt: 4, width: "70%", maxWidth: 1000}}>
          <Grid item xs={6}>
            <TextField
              required
              id="outlined-required"
              label="First name"
              defaultValue="Adam"
              sx={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              id="outlined-required"
              label="Last name"
              defaultValue="Smith"
              sx={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              id="outlined-required"
              label="Email"
              defaultValue="AdamSmith@gmail.com"
              sx={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              id="outlined-required"
              label="Nationality"
              defaultValue="Poland"
              sx={{width: "100%"}}
            />
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" size="large" sx={{width: "100%"}}>
              Update data
            </Button>
          </Grid>
        </Grid>
      </Box>


      {/*Dialog window*/}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Photo</DialogTitle>
        <DialogContent>
          <Dropzone/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}