import React, { PureComponent } from 'react';
import { Box, Button, Popover } from '@mui/material';
import './MenuPopOver.scss';

class MenuPopOver extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.anchorOrigin = {
      vertical: 'bottom',
      horizontal: 'left',
    };
    this.transformOrigin = {
      vertical: 'top',
      horizontal: 'left',
    };
  }

  handleClose() {
    this.props.onClosePopup();
  }

  render() {
    const { anchorEl } = this.props;
    if (!anchorEl) {
        return null;
    }
    return (
      <Popover
        open
        anchorOrigin={this.anchorOrigin}
        transformOrigin={this.transformOrigin}
        className="menu-popover"
        anchorEl={anchorEl}
        onClose={this.handleClose}
      >
        <Box className="gif-menu-items">
            <Box>What is gif-t?</Box>
            <Box>Gif-t for sales</Box>
            <Box>Gif-t for marketing</Box>
            <Box>Gif-spiration</Box>
            <Box>Rights & Privacy</Box>
        </Box>
        <Button onClick={this.handleClose} className="close-menu">CLOSE MENU</Button>
      </Popover>
    );
  }
}


export default MenuPopOver;
