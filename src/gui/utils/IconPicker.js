import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import React from "react";

export const CERTIFICATE_TYPE = {
  ID: "ID",
  STUDENT_CARD: "Student Card",
  DRIVING_LICENCE: "Driving Licence",
  PASSPORT: "Passport",
}

export function certificateIconPicker(type) {
  switch (type) {
    case CERTIFICATE_TYPE.ID:
      return <AccountBalanceIcon fontSize="large"/>
    case CERTIFICATE_TYPE.STUDENT_CARD:
      return <PersonIcon fontSize="large"/>
    case CERTIFICATE_TYPE.DRIVING_LICENCE:
      return <DirectionsCarIcon fontSize="large"/>
    case CERTIFICATE_TYPE.PASSPORT:
      return <AirplanemodeActiveIcon fontSize="large"/>
    default:
      return null
  }
}