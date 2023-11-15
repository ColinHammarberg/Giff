import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './DesignGifDialog.scss';
import DialogWrapper from '../DialogWrapper';
import { Box, Button, IconButton } from '@mui/material';
import { ApplyGifColor, ApplyGifFrame } from '../../endpoints/Apis';
import { showNotification } from '../notification/Notification';
import Tabs from '../tabs/Tabs';
import LeftNavigation from '../../resources/left-nav.png'
import RightNavigation from '../../resources/right-nav.png'
import EyeIcon from '../../resources/eye.png'
import Frame1 from '../../resources/filter1.png'
import Frame2 from '../../resources/filter-2.png'
import Frame3 from '../../resources/filter-3.png'


class DesignGifDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
      selectedColor: null,
      selectedFrame: null,
      selectedFilter: null,
      visibleColorIndex: 0,
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSaveGif = this.handleSaveGif.bind(this);
    this.handleOnChangeTab = this.handleOnChangeTab.bind(this);
    this.handlePrevColors = this.handlePrevColors.bind(this);
    this.handleNextColors = this.handleNextColors.bind(this);
    this.colorSelection = [
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
    this.frameSelection = [
      { name: 'frame-1', frame: Frame1 },
      { name: 'frame-2', frame: Frame2 },
      { name: 'frame-3', frame: Frame3 },
    ]
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
      this.setState({ selectedColor: null });
    } else {
      this.setState({ isOpen: false });
    }
  }

  handleSaveGif = async () => {
    const { selectedColor, selectedFrame } = this.state;
    const { selectedGif } = this.props;

    try {
      let response;
      if (selectedColor) {
        response = await ApplyGifColor(selectedGif, selectedColor);
      } else {
        response = await ApplyGifFrame(selectedGif, selectedFrame);
      }

      if (response.data.message === 'Selected color updated successfully') {
        this.handleCancel();
        this.props.setDesignChanges(true);
        showNotification('success', "Your design changes have been applied to your gif!")
      }

      console.log('response', response.message);
    } catch (error) {
      console.error('Error saving GIF:', error);
    }
  };

  handleOnChangeTab(value) {
    this.props.changeTab(value);
  }

  handlePrevColors() {
    const { visibleColorIndex } = this.state;
    const prevIndex = Math.max(visibleColorIndex - 4, 0);
    this.setState({ visibleColorIndex: prevIndex });
  }

  handleNextColors() {
    const { visibleColorIndex } = this.state;
    const nextIndex = Math.min(visibleColorIndex + 4, this.colorSelection.length - 4);
    this.setState({ visibleColorIndex: nextIndex });
  }

  handleColorClick(color) {
    this.setState({ selectedColor: color, selectedFrame: null });
  }

  handleFrameClick(frameName) {
    this.setState({ selectedFrame: frameName, selectedColor: null });
    console.log('state', this.state.selectedFrame);
  }

  handleFilterClick(filter) {
    this.setState({ selectedFilter: filter, selectedColor: null });
  }

  getFrameSourceByName(frameName) {
    const frame = this.frameSelection.find(f => f.name === frameName);
    return frame ? frame.frame : null;
  }

  render() {
    const { selectedColor, visibleColorIndex } = this.state;
    const { selectedGif, isOpen, tabs, activeTab, isMobile } = this.props;

    console.log('selectedGif', selectedGif);

    const visibleColors = isMobile ? this.colorSelection.slice(visibleColorIndex, visibleColorIndex + 4) : this.colorSelection;

    return (
      <DialogWrapper
        modal
        maxWidth="lg"
        className={`white new-popup design-gif-dialog ${isMobile ? 'mobile-view' : ''}`}
        onClose={this.handleCancel}
        open={isOpen}
      >
        <div className="content">
          {!isMobile && (
            <Tabs
              tabs={tabs}
              onChange={this.handleOnChangeTab}
              variant="tabs-level-2"
          />
          )}
          {activeTab === 0 && (
            <>
              <div className="title">
                <span>Choose a</span> good <span>frame,</span> see how it looks <span>and click save.</span>
              </div>
              <div className="container">
                <div>
                  <div className="image">
                    <img src={selectedGif.url} alt="" style={{ border: `7px solid ${selectedColor || selectedGif.selectedColor || 'transparent'}` }} />
                  </div>
                </div>
                <div className={`select-color-container ${isMobile ? 'mobile-view' : ''}`}>
                  {isMobile && (
                    <IconButton onClick={this.handlePrevColors}><img src={LeftNavigation} alt="" /></IconButton>
                  )}
                  <div className="colors">
                    {visibleColors.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => this.handleColorClick(item.color)}
                        style={{
                          backgroundColor: item.color,
                          cursor: 'pointer',
                          boxShadow: selectedColor === item.color ? '0 0 10px 5px rgba(0, 0, 0, 0.3)' : 'none',
                          position: 'relative',
                        }}
                      >
                        {selectedColor === item.color && (
                          <img src={EyeIcon} alt="" />
                        )}
                      </Box>
                    ))}
                  </div>
                  {isMobile && (
                    <IconButton onClick={this.handleNextColors}><img src={RightNavigation} alt="" /></IconButton>
                  )}
                </div>
              </div>
              <div className="action-content">
                <div className="buttons">
                  <Button onClick={this.handleSaveGif}>Save Gif</Button>
                </div>
              </div>
            </>
          )}
          {activeTab === 1 && (
            <>
              <div className="title">
                <span>Choose a</span> good <span>frame,</span> see how it looks <span>and click save.</span>
              </div>
              <div className="container">
              <div className="image-frame-container">
                <img src={selectedGif.url} alt="Selected Gif" />
                {this.state.selectedFrame && (
                  <img src={this.getFrameSourceByName(this.state.selectedFrame)} alt="Selected Frame" />
                )}
              </div>
                <div className={`select-frame-container`}>
                  <div className="frames">
                    {this.frameSelection.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => this.handleFrameClick(item.name)}
                        style={{cursor: 'pointer'}}
                      >
                        <img src={item.frame} alt="" />
                      </Box>
                    ))}
                  </div>
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
