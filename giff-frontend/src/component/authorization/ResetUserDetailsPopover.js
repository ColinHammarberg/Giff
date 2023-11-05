import React, { PureComponent } from 'react';
import { Popover, Button, InputLabel, TextField } from '@mui/material';
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
    if (this.props.changeUserDetails === 'edit-password') {
      this.props.requestChangeUserPassword();
    } else if (this.props.changeUserDetails === 'edit-email') {
      this.props.requestChangeUserEmail();
    }
    this.props.onClosePopover();
  }

  handleOnChange(e, field) {
    if (this.props.changeUserDetails === 'edit-password') {
      this.props.handleOnChangePassword(e, field);
    } else if (this.props.changeUserDetails === 'edit-email') {
      this.props.handleOnChangeEmail(e, field);
    }
  }

  render() {
    const { anchorEl, changeUserDetails } = this.props;
    if (!anchorEl) {
        return null;
    }
    const isEditingPassword = changeUserDetails === 'edit-password';
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
        <div className="title">{isEditingPassword ? 'Edit Password' : 'Edit Email'}</div>
        <div className="user-fields">
        {isEditingPassword && (
          <div>
            <InputLabel>
              {'Current Password'}
            </InputLabel>
            <PasswordField
              type={isEditingPassword ? 'password' : 'text'}
              onChange={(e) => this.handleOnChange(e, isEditingPassword ? 'currentPassword' : 'currentEmail')} 
            />
          </div>
        )}
          <div>
            <InputLabel>
              {isEditingPassword ? 'New Password' : 'New Email'}
            </InputLabel>
            {isEditingPassword ? (
              <PasswordField
                type={isEditingPassword ? 'password' : 'text'}
                onChange={(e) => this.handleOnChange(e, 'newPassword')} 
              />
            ) : (
              <TextField onChange={(e) => this.handleOnChange(e, 'newEmail')} />
            )}
            
          </div>
          {!isEditingPassword && (
            <div>
              <InputLabel>
                Password
              </InputLabel>
              <PasswordField
                type="password"
                onChange={(e) => this.handleOnChange(e, 'password')}
              />
            </div>
          )}
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
