import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './DeleteGifDialog.scss';

let resolve;
let containerElement;

class DeleteGifDialog extends PureComponent {
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
          <DeleteGifDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        DeleteGifDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false,  }, () => {
        DeleteGifDialog.destroy();
    });
  }

  handleConfirm() {
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
        DeleteGifDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
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
            className="delete-gif-dialog"
            open={true}
            fullScreen={null}
            maxWidth={'sm'}
            transitionDuration={400}
        >
        <DialogContent className="dialog-content styled-scrollbar">
            <Box className="delete-gif-content">
                Are you sure, Champ? <br></br><br></br>
                Deleting your gif will mean it’s gone for good. 
            </Box>
            <Box className="delete-btn-actions">
                <Button onClick={this.handleConfirm} className="confirm-btn">No, delete my gif</Button>
                <Button onClick={this.handleCancel} className="keep-gif-btn">Ok, let's keep my gif</Button>
            </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

DeleteGifDialog.propTypes = {
  
};

export default DeleteGifDialog;
