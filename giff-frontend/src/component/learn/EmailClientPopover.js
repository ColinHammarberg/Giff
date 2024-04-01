import React, { PureComponent } from 'react';
import { Box, Button, Popover } from '@mui/material';
import './EmailClientPopover.scss';
import MicrosoftLogo from '../../resources/Microsoft_logo.png';
import GoogleLogo from '../../resources/Gmail_Logo.png';

class EmailClientPopover extends PureComponent {
  handleGoogle = () => {
    this.props.onSelectGoogle();
  };

  handleOutlook = () => {
    this.props.onSelectOutlook();
  };

  render() {
    const { open, anchorEl, onClose } = this.props;

    console.log('anchorEl', anchorEl);

    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        className="email-client-popover"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'bottom',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'top',
        }}
      >
        <Box className="description">
          Which email client are your using? <br />
        </Box>
        <Box className="email-client-actions">
          <Button className="addon-btn" onClick={this.handleOutlook}>
            <img src={MicrosoftLogo} alt="Microsoft logo" /> Outlook client
          </Button>
          <Button className="addon-btn" onClick={this.handleGoogle}>
            <img src={GoogleLogo} alt="Microsoft logo" /> Gmail client
          </Button>
        </Box>
      </Popover>
    );
  }
}

export default EmailClientPopover;
