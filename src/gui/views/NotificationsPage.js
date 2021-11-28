import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Certificate from "../components/Certificate";

export default function NotificationsPage({address, awaitingCertificates}) {
  return (
    <Box>
      <Typography variant="h3">
        Notifications
      </Typography>
      <Box
        sx={{display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: "4em",
          p: 2,
          mt: 4
        }}
      >
        {
          awaitingCertificates.map((data,idx) => <Certificate address={address} data={data} isCertificateAccepted={false} key={idx}/>)
        }
      </Box>
    </Box>
  )
}