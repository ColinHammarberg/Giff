import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './DesignGifDialog.scss';
import DialogWrapper from './DialogWrapper';
import { Box, Button } from '@mui/material';
import { ApplyGifDesign } from '../endpoints/Apis';
import { showNotification } from './Notification';

class DesignGifDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      selectedColor: null,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleHistoryStateChanged = this.handleHistoryStateChanged.bind(this);
    this.handleSaveGif = this.handleSaveGif.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleHistoryStateChanged);
  }

  componentWillUnmount() {
    console.log('componentWillUnmount WelcomeSpaceAnalytics');
    window.removeEventListener('popstate', this.handleHistoryStateChanged);
  }

  handleCancel() {
    if (this.props.onClickCancel) {
      this.props.onClickCancel();
    } else {
      this.setState({ isOpen: false });
    }
  }

  handleHistoryStateChanged() {
    this.setState({ isOpen: false });
  }

  handleConfirm() {
    if (this.props.onClickOk) {
      this.props.onClickOk();
    } else {
      this.setState({ isOpen: false });
    }
  }

  handleColorClick(color) {
    this.setState({ selectedColor: color });
  }

  handleSaveGif = async () => {
    const { selectedColor } = this.state;
    const { selectedGif } = this.props;
    try {
      const response = await ApplyGifDesign(selectedGif, selectedColor);
      console.log('response.data.message', response.data.message);
      if (response.data.message === 'Selected color updated successfully') {
        this.handleCancel()
        this.props.setDesignChanges(true);
        showNotification('success', "You can't create more than 8 gifs at once.")
      }
      // Handle success, e.g., show a success message
      console.log('response', response.message);
    } catch (error) {
      // Handle error, e.g., show an error message
      console.error('Error saving GIF:', error);
    }
  };

  render() {
    const { selectedColor } = this.state;
    const { selectedGif, isOpen } = this.props;
    const colorSelection = [
      { color: '#FEC901' },
      { color: '#B9F140' },
      { color: '#ffffff' },
      { color: '#FD95A7' },
      { color: '#F4149B' },
    ];

    return (
      <DialogWrapper
        modal
        maxWidth="lg"
        className="white new-popup design-gif-dialog"
        onClose={this.handleCancel}
        open={isOpen}
      >
        <div className="content">
          <div className="title">
            <span>Choose a</span> good <span>frame,</span> see how it looks <span>and click save.</span>
          </div>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
            {colorSelection.map((item, index) => (
              <Box
                key={index}
                onClick={() => this.handleColorClick(item.color)}
                style={{
                  width: '100px',
                  height: '100px',
                  border: `3px solid ${item.color}`,
                  cursor: 'pointer',
                  boxShadow: selectedColor === item.color ? '0 0 10px 5px rgba(0, 0, 0, 0.3)' : 'none',
                }}
              ></Box>
            ))}
          </div>
          <div className="image">
            <img src={selectedGif.url} alt="" style={{ border: `4px solid ${selectedColor || 'transparent'}` }} />
          </div>
          <div className="action-content">
            <div className="buttons">
              <Button onClick={this.handleSaveGif}>Save Gif</Button>
            </div>
          </div>
        </div>
      </DialogWrapper>
    );
  }
}

DesignGifDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClickOk: PropTypes.func,
  onClickCancel: PropTypes.func,
  isPublicSpace: PropTypes.bool,
  selectedGif: PropTypes.object,
};

export default DesignGifDialog;
