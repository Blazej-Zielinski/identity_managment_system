import React, {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {makeStyles} from "@mui/styles";
import LogoutIcon from '@mui/icons-material/Logout';
import {useHistory, useLocation, useRouteMatch} from 'react-router-dom'
import CardMedia from "@mui/material/CardMedia";
import Badge from '@mui/material/Badge';
import {userDrawerElements, authorityDrawerElements, userDrawerLinks, authorityDrawerLinks} from "../assets/DrawerElements";

const useStyles = makeStyles({
  flexColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  imageButton: {
    "&:hover": {
      cursor: "pointer"
    }
  }
});

export default function DrawerMenu({window, authorityAccount, address, drawerWidth, mobileOpen, handleDrawerToggle, notifications}) {
  const [selectedItem, setSelectedItem] = useState(0);
  const classes = useStyles()
  const history = useHistory()
  const {path} = useRouteMatch();
  const location = useLocation();
  const drawerElements = authorityAccount ? authorityDrawerElements : userDrawerElements

  useEffect(() => {
    const paths = authorityAccount ?
      authorityDrawerLinks
      :
      userDrawerLinks

    paths.forEach((el, idx) => {
      if (path + el === location.pathname) {
        setSelectedItem(idx + 1)
      }
    })
  }, [authorityAccount, location, path])

  function handleListItemClick(endpoint, idx) {
    if (mobileOpen) {
      handleDrawerToggle()
    }
    setSelectedItem(idx + 1)
    history.push(path + "/" + endpoint)
  }

  const drawer = (
    <Box>
      <Box className={classes.flexColumn} sx={{p: 1}}>
        <CardMedia
          component="img"
          image="/logoChainLock.png"
          width="100%"
          height="auto"
          alt="chainLockLogo"
          onClick={() => history.push("/")}
          className={classes.imageButton}
        />
        <Typography variant="caption" component="div" sx={{mt: 3}}>
          {"Address: " + address.slice(0, 6) + "..." + address.slice(-6)}
        </Typography>
      </Box>
      <Divider/>
      <List>
        {drawerElements.map(({title, icon, endpoint}, idx) => (
          <ListItem
            button
            key={idx}
            onClick={() => handleListItemClick(endpoint, idx)}
            selected={selectedItem === idx + 1}>
            <ListItemIcon>
              {
                title === "Notifications" && notifications ?
                  <Badge badgeContent={notifications} color="primary">{icon}</Badge>
                  :
                  icon
              }
            </ListItemIcon>
            <ListItemText primary={title}/>
          </ListItem>
        ))}
      </List>
      <Divider/>
      <List>
        <ListItem
          button
          onClick={() => history.push("/")}
          key={"Log out"}>
          <ListItemIcon>
            <LogoutIcon/>
          </ListItemIcon>
          <ListItemText primary={"Log out"}/>
        </ListItem>
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{display: 'flex'}}>

      <Box
        component="nav"
        sx={{width: {sm: drawerWidth}, flexShrink: {sm: 0}}}
        aria-label="navigation"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: {xs: 'block', sm: 'none'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: {xs: 'none', sm: 'block'},
            '& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  )
}