import React, { PureComponent } from 'react';
import { Popover, Button, TextField } from '@mui/material';
import './EmailAddressPopover.scss';

class EmailAddressPopover extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
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

  handleContinue() {
    this.props.sendGif();
    this.props.onClosePopup();
  }

  handleOnChange(value) {
    this.props.onChange(value);
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
        className="email-popover"
        anchorEl={anchorEl}
        onClose={this.handleClose}
      >
        <div className="content">
            <div className="email-content">
                <TextField placeholder="Email" type="email" onChange={(value) => this.handleOnChange(value)} />
            </div>
            <div className="buttons">
                <Button onClick={this.handleContinue}>Continue</Button>
            </div>
        </div>
      </Popover>
    );
  }
}

export default EmailAddressPopover;
