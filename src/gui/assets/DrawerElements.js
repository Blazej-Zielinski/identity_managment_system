import ClassIcon from "@mui/icons-material/Class";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import React from "react";

export const userDrawerElements = [
  // todo to delete
  // {
  //   title: "Profile",
  //   icon: <PersonIcon/>,
  //   endpoint: "profile"
  // },
  {
    title: "Certificates",
    icon: <ClassIcon/>,
    endpoint: "certificates"
  },
  {
    title: "Notifications",
    icon: <NotificationsIcon/>,
    endpoint: "notifications"
  },
]

export const authorityDrawerElements = [
  {
    title: "Issue Certificate",
    icon: <InfoIcon/>,
    endpoint: "issueCertificate"
  },
]

export const userDrawerLinks = ["/certificates", "/notifications"]

export const authorityDrawerLinks = ["/issueCertificate"]