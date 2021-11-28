import {styled} from "@mui/material/styles";
import {Avatar} from "@mui/material";

export const SizedAvatar = styled(Avatar)(({size, theme}) => ({
  width: theme.spacing(size),
  height: theme.spacing(size)
}))