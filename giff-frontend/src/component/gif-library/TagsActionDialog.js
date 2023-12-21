import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Button, Dialog, DialogContent } from '@mui/material';
import './TagsActionDialog.scss';

let resolve;
let containerElement;

class TagsActionDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasConfirmed: false,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
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
          <TagsActionDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        TagsActionDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false,  }, () => {
        TagsActionDialog.destroy();
    });
  }

  handleConfirm() {
    this.setState({ isOpen: false, hasConfirmed: true }, () => {
        TagsActionDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleRemove() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
        TagsActionDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
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
            className="tags-action-dialog"
            open={true}
            fullScreen={null}
            maxWidth={'sm'}
            transitionDuration={400}
        >
        <DialogContent className="dialog-content styled-scrollbar">
            <Box className="tags-content">
                What would you like to do, Champ? <br></br><br></br>
            </Box>
            <Box className="tags-btn-actions">
                <Button onClick={this.handleConfirm} className="add-btn">Assign tag to gif</Button>
                <Button onClick={this.handleRemove} className="remove-btn">Remove tag</Button>
            </Box>
        </DialogContent>
      </Dialog>
    );
  }
}

TagsActionDialog.propTypes = {
  
};

export default TagsActionDialog;
