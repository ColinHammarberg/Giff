import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Dialog, DialogContent, TextField } from '@mui/material';
import './AddTagsDialog.scss';
import { AddUserTag } from '../../endpoints/TagManagementEndpoints';
import { showNotification } from '../notification/Notification';
import { getRandomColor } from '../design/Utils';

let resolve;
let containerElement;

class AddTagsDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      hasConfirmed: false,
    };
    this.handleCancel = this.handleCancel.bind(this);
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
          <AddTagsDialog />
        </ThemeProvider>,
        containerElement
      );
    });
  }

  handleCancel() {
    this.setState({ isOpen: false, hasConfirmed: false }, () => {
      AddTagsDialog.destroy({ hasConfirmed: this.state.hasConfirmed });
    });
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false }, () => {
      AddTagsDialog.destroy();
    });
  }

  handleTagChange = (e) => {
    this.setState({ newTag: e.target.value });
  };

  handleAddTag = async () => {
    const { newTag } = this.state;
    if (newTag.trim() !== '') {
      const tagDetails = {
        tagValue: newTag,
        color: getRandomColor(),
      };

      try {
        const response = await AddUserTag(tagDetails);
        const addedTag = response.data.tag;
        console.log('added tag', addedTag);
        showNotification('success', 'Nice! You can now use your Tag');
        this.setState({ isOpen: false, hasConfirmed: true }, () => {
          AddTagsDialog.destroy({ hasConfirmed: true, addedTag });
        });
      } catch (error) {
        showNotification('error', 'Oh no! Please try that again');
        console.error('Error adding tag:', error);
        this.setState({ isOpen: false }, () => {
          AddTagsDialog.destroy();
        });
      }
    }
  };

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
        className="add-tags-dialog"
        open={true}
        fullScreen={null}
        onClose={this.handleCancel}
        maxWidth={'sm'}
        transitionDuration={400}
      >
        <DialogContent className="dialog-content styled-scrollbar">
          <div className="add-tags-title">Add tags</div>
          <div className="tags-input">
            <TextField
              value={this.state.newTag}
              onChange={this.handleTagChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  this.handleAddTag();
                }
              }}
              placeholder="MUSIC, MARKETING, HAPPY"
              variant="outlined"
              fullWidth
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

AddTagsDialog.propTypes = {};

export default AddTagsDialog;
