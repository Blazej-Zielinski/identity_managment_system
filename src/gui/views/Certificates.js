import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Certificate from "../components/Certificate";

export default function Certificates({address, certificates}) {
  return (
    <Box>
      <Typography variant="h3">
        Certificates
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
          certificates.length === 0 ?
            <Typography variant={"h3"}>
              No certificates
            </Typography>
            :
            certificates.map((data, idx) => <Certificate address={address} data={data} key={idx}/>)
        }
      </Box>
    </Box>
  )
}