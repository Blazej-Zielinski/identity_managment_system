import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Certificate from "../components/Certificate";

export default function Certificates({certificates}) {
  return (
    <Box>
      <Typography variant="h3">
        Certificates
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
          certificates.map((data,idx) => <Certificate data={data} key={idx}/>)
        }
      </Box>
    </Box>
  )
}