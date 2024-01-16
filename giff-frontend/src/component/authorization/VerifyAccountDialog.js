import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './VerifyAccountDialog.scss';
import { showNotification } from '../notification/Notification';
import { ResendVerificationEmail } from '../../endpoints/UserEndpoints';

let resolve;
let containerElement;

class VerifyAccountDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasConfirmed: false,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleHistoryStateChanged = this.handleHistoryStateChanged.bind(this);
    this.handleOnResendEmailVerification =
      this.handleOnResendEmailVerification.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleHistoryStateChanged);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleHistoryStateChanged);
    resolve = null;
    containerElement = null;
  }

  static show() {
    containerElement = document.createElement('div');
    document.body.appendChild(containerElement);
    return new Promise((res) => {
      resolve = res;
      ReactDOM.render(
        <ThemeProvider theme={createTheme()}>
          <VerifyAccountDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
      VerifyAccountDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  async handleOnResendEmailVerification() {
    const response = await ResendVerificationEmail();
    if (response.status === 'Sent new email verification link') {
      showNotification('success', `Sent new verification email`);
      this.setState({ isOpen: false, hasConfirmed: false }, () => {
        VerifyAccountDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
      });
    } else {
      showNotification('error', `Oh no! Something went wrong!`);
    }
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false }, () => {
      VerifyAccountDialog.destroy();
    });
  }

  handleConfirm() {
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
      VerifyAccountDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  static destroy(retVal = false) {
    if (containerElement) {
      document.body.removeChild(containerElement);
    }
    if (typeof resolve === 'function') {
      resolve(retVal);
    }
  }

  render() {
    if (!this.state.isOpen) {
      return null;
    }
    return (
      <Dialog
        className="verify-account-dialog"
        open={true}
        fullScreen={null}
        maxWidth={'sm'}
        transitionDuration={400}
      >
        <DialogContent className="dialog-content styled-scrollbar">
          <Box className="header-content">You need to verify your email</Box>
          <Box className="verify-account-content">
            <div>
              Sorry, Champ. You need to verify your email <br></br>
              before you can use Gif-T. Just click the link in <br></br>
              the email you've received from hello@gif-t.io.
              <Box className="confirm-btn-actions">
                <Button onClick={this.handleCancel} className="confirm-btn">
                  Ok
                </Button>
                <Button
                  onClick={this.handleOnResendEmailVerification}
                  className="confirm-btn"
                >
                  Send verification link
                </Button>
              </Box>
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

VerifyAccountDialog.propTypes = {};

export default VerifyAccountDialog;
