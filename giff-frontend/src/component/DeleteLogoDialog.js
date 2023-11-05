import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './DeleteLogoDialog.scss';

let resolve;
let containerElement;

class DeleteLogoDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasConfirmed: false,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleHistoryStateChanged = this.handleHistoryStateChanged.bind(this);
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
          <DeleteLogoDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        DeleteLogoDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false,  }, () => {
        DeleteLogoDialog.destroy();
    });
  }

  handleConfirm() {
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
        DeleteLogoDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
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
            className="delete-logo-dialog"
            open={true}
            fullScreen={null}
            maxWidth={'sm'}
            transitionDuration={400}
        >
        <DialogContent className="dialog-content styled-scrollbar">
            <Box className="delete-logo-content">
                Are you sure, Champ? <br></br><br></br>
                If you delete your account your gifs will be deleted and you won’t have access to the cool features that only gif-ters can use. <br></br><br></br> 
                Why not  sleep on it before you make a decision?
            </Box>
            <Box className="delete-btn-actions">
                <Button onClick={this.handleConfirm} className="confirm-btn">No, delete my logo</Button>
                <Button onClick={this.handleCancel} className="keep-logo-btn">Ok, let's keep my logo</Button>
            </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

DeleteLogoDialog.propTypes = {
  
};

export default DeleteLogoDialog;
