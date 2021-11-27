import React, {useState} from "react";
import {styled} from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import {Grid} from "@mui/material";
import Divider from "@mui/material/Divider";

const ExpandMore = styled((props) => {
  const {expand, ...other} = props;
  return <IconButton {...other} />;
})(({theme, expand}) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Certificate({data}) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card raised={true} sx={{width: 700}}>
      <CardHeader
        avatar={<AccountBalanceIcon fontSize="large"/>}
        action={
          <IconButton aria-label="share">
            <ShareIcon/>
          </IconButton>
        }
        title={
          <Typography variant="h6">
            {data.title}
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sign by: {data.signBy}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Signature: {data.signature}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {/*{*/}
            {/*  // todo*/}
            {/*  data.extras.map((item,idx) =>*/}
            {/*    <Grid item xs={6} key={idx}>*/}
            {/*      <Typography variant="body2" color="text.secondary">*/}
            {/*        {item}*/}
            {/*      </Typography>*/}
            {/*    </Grid>*/}
            {/*  )*/}
            {/*}*/}
          </Grid>
        </CardContent>
      </Collapse>
      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon/>
        </ExpandMore>
      </CardActions>
    </Card>
  );
}