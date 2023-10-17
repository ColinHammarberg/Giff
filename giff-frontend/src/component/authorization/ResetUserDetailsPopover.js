import React, { PureComponent } from 'react';
import { Popover, Button, InputLabel } from '@mui/material';
import './ResetUserDetailsPopover.scss';
import PasswordField from './PasswordField';

class ResetUserDetailsPopover extends PureComponent {
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
    this.props.onClosePopover();
  }

  handleContinue() {
    this.props.requestChangeUserPassword();
    this.props.onClosePopover();
  }

  handleOnChange(e, field) {
    this.props.onChange(e, field);
  }

  render() {
    const { anchorEl, onKeyPress } = this.props;
    if (!anchorEl) {
        return null;
    }
    return (
      <Popover
        open
        anchorOrigin={this.anchorOrigin}
        transformOrigin={this.transformOrigin}
        className="user-details-popover"
        anchorEl={anchorEl}
        onClose={this.handleClose}
      >
        <div className="content">
            <div className="title">Edit Password</div>
            <div className="user-fields">
                <div>
                    <InputLabel>
                        Current Password
                    </InputLabel>
                    <PasswordField
                        type="password"
                        onKeyPress={onKeyPress}
                        onChange={(e) => this.handleOnChange(e, 'currentPassword')} 
                    />
                </div>
                <div>
                    <InputLabel>
                        New Password
                    </InputLabel>
                    <PasswordField 
                        type="password"
                        onKeyPress={onKeyPress}
                        onChange={(e) => this.handleOnChange(e, 'newPassword')} 
                    />
                </div>
            </div>
            <div className="buttons">
                <Button onClick={this.handleContinue}>Continue</Button>
            </div>
        </div>
      </Popover>
    );
  }
}

export default ResetUserDetailsPopover;
