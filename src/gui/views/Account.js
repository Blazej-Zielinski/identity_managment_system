import React, {useState} from "react";
import DrawerMenu from "../components/DrawerMenu";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import {AppBar, IconButton} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import Certificates from "./Certificates";
import NotificationsPage from "./NotificationsPage";
import IssueCertificate from "./IssueCertificate";
import Error404 from "./Error404";

const drawerWidth = 240;

export default function Account({authorityAccount, address, certificates, awaitingCertificates, dispatch}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  let {path} = useRouteMatch();


  return (
    <Box sx={{display: 'flex'}}>
      <CssBaseline/>

      {/* Header */}
      <AppBar
        position="fixed"
        sx={{display: {sm: 'none'}}}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{mr: 2}}
          >
            <MenuIcon/>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <DrawerMenu
        authorityAccount={authorityAccount}
        address={address}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        notifications={awaitingCertificates.length}
      />

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3, mt: {xs: 6, sm: 0},
          width: {sm: `calc(100% - ${drawerWidth}px)`}
        }}
      >
        <Switch>
          <Route path={`${path}/certificates`}>
            <Certificates address={address} certificates={certificates}/>
          </Route>
          <Route path={`${path}/notifications`}>
            <NotificationsPage address={address} awaitingCertificates={awaitingCertificates} dispatch={dispatch}/>
          </Route>
          <Route path={`${path}/issueCertificate`}>
            <IssueCertificate address={address}/>
          </Route>
          <Route path={`${path}/*`}>
            <Error404/>
          </Route>
        </Switch>
      </Box>
    </Box>
  );
}