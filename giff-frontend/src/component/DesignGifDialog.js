import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './DesignGifDialog.scss';
import DialogWrapper from './DialogWrapper';
import { Box, Button } from '@mui/material';
import { ApplyGifDesign } from '../endpoints/Apis';
import { showNotification } from './Notification';
import Tabs from './Tabs';

class DesignGifDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      selectedColor: null,
      selectedFilter: null,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSaveGif = this.handleSaveGif.bind(this);
    this.handleOnChangeTab = this.handleOnChangeTab.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.handleCancel);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  handleCancel() {
    if (this.props.onClickCancel) {
      this.props.onClickCancel();
    } else {
      this.setState({ isOpen: false });
    }
  }

  handleSaveGif = async () => {
    const { selectedColor, selectedFilter } = this.state;
    const { selectedGif } = this.props;

    try {
      const response = await ApplyGifDesign(selectedGif, selectedColor);
      console.log('response.data.message', response.data.message);

      if (selectedFilter) {
        // Save the selected filter to your state or perform any other action as needed
        console.log('Selected Filter:', selectedFilter);
      }

      if (response.data.message === 'Selected color updated successfully') {
        this.handleCancel();
        this.props.setDesignChanges(true);
        showNotification('success', "You can't create more than 8 gifs at once.")
      }

      console.log('response', response.message);
    } catch (error) {
      console.error('Error saving GIF:', error);
    }
  };

  handleOnChangeTab(value) {
    this.props.changeTab(value);
  }

  handleColorClick(color) {
    this.setState({ selectedColor: color, selectedFilter: null });
  }

  handleFilterClick(filter) {
    this.setState({ selectedFilter: filter, selectedColor: null });
  }

  render() {
    const { selectedColor } = this.state;
    const { selectedGif, isOpen, tabs, activeTab } = this.props;
    const colorSelection = [
      { color: '#FEC901' },
      { color: '#B9F140' },
      { color: '#ffffff' },
      { color: '#FD95A7' },
      { color: '#F4149B' },
      { color: '#FD3333' },
      { color: '#0157FE' },
      { color: '#52DE68' },
      { color: '#83CEF8' },
      { color: '#5BFDAF' },
      { color: '#0E0B80' },
      { color: '#110946' },
      { color: '#626262' },
      { color: '#1B1A19' },
      { color: '#F5F5F5' },
      { color: '#FEC901' },
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
          <Tabs
            tabs={tabs}
            onChange={this.handleOnChangeTab}
            variant="tabs-level-2"
          />
          {activeTab === 0 && (
            <>
              <div className="title">
                <span>Choose a</span> good <span>frame,</span> see how it looks <span>and click save.</span>
              </div>
              <div className="container">
                <div>
                  <div className="image">
                    <img src={selectedGif.url} alt="" style={{ border: `7px solid ${selectedColor || 'transparent'}` }} />
                  </div>
                </div>
                <div className="select-color-container">
                    {colorSelection.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => this.handleColorClick(item.color)}
                        style={{
                          backgroundColor: item.color,
                          cursor: 'pointer',
                          boxShadow: selectedColor === item.color ? '0 0 10px 5px rgba(0, 0, 0, 0.3)' : 'none',
                        }}
                      ></Box>
                    ))}
                </div>
              </div>
              <div className="action-content">
                <div className="buttons">
                  <Button onClick={this.handleSaveGif}>Save Gif</Button>
                </div>
              </div>
            </>
          )}
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
