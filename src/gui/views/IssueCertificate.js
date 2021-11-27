import React, {useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Tab} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {DrivingLicence, ID, Passport, StudentCard} from "../assets/CertificateSchemes"
import CertificateForm from "../components/CertificateForm";

export default function IssueCertificate({address}) {
  const [value, setValue] = useState('2');

  return (
    <Box>
      <Typography variant="h3">
        IssueCertificate
      </Typography>

      <Box sx={{width: '100%', mt: 4}}>
        <TabContext value={value}>
          <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
            <TabList onChange={(event, newValue) => setValue(newValue)}>
              <Tab label="ID" value="1"/>
              <Tab label="Student Card" value="2"/>
              <Tab label="Driving Licence" value="3"/>
              <Tab label="Passport" value="4"/>
            </TabList>
          </Box>
          <TabPanel value="1">
            <CertificateForm address={address} type={"ID"} fields={Object.keys(new ID())}/>
          </TabPanel>
          <TabPanel value="2">
            <CertificateForm address={address} type={"Student Card"} fields={Object.keys(new StudentCard())}/>
          </TabPanel>
          <TabPanel value="3">
            <CertificateForm address={address} type={"Driving Licence"} fields={Object.keys(new DrivingLicence())}/>
          </TabPanel>
          <TabPanel value="4">
            <CertificateForm address={address} type={"Passport"} fields={Object.keys(new Passport())}/>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  )
}