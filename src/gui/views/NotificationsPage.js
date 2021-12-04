import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Certificate from "../components/Certificate";

export default function NotificationsPage({address, awaitingCertificates, dispatch}) {
  return (
    <Box>
      <Typography variant="h3">
        Notifications
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: "4em",
          p: 2,
          mt: 4
        }}
      >
        {
          awaitingCertificates.length === 0 ?
            <Typography variant={"h3"}>
              No awaiting certificates
            </Typography>
            :
            awaitingCertificates.map((data, idx) =>
              <Certificate
                id={idx}
                address={address}
                data={data}
                dispatch={dispatch}
                isCertificateAccepted={false}
                key={idx}/>
            )
        }
      </Box>
    </Box>
  )
}