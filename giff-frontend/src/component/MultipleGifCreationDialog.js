import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './MultipleGifCreationDialog.scss';

let resolve;
let containerElement;

class MultipleGifCreationDialog extends PureComponent {
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
          <MultipleGifCreationDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        MultipleGifCreationDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false,  }, () => {
        MultipleGifCreationDialog.destroy();
    });
  }

  handleConfirm() {
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
        MultipleGifCreationDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
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
            className="multiple-gif-creation-dialog"
            open={true}
            fullScreen={null}
            maxWidth={'sm'}
            transitionDuration={400}
        >
        <DialogContent className="dialog-content styled-scrollbar">
            <Box className="close-btn-actions">
                <Button onClick={this.handleCancel} className="close-btn">Close error box</Button>
            </Box>
            <Box className="multiple-gif-creation-content">
                <div>
                    Sorry, champ. We can only create 10 gifs at the time for you, and you’ve added 10 urls (That’s amazing, btw).<br></br><br></br>
                    Click “Create gifs” to generate gifs from the urls you have added. Afterwards, you can always create 10 more. 
                </div>
            </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

MultipleGifCreationDialog.propTypes = {
  
};

export default MultipleGifCreationDialog;
