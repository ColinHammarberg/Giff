import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import './DesignGifDialog.scss';
import DialogWrapper from '../DialogWrapper';
import { Box, Button, IconButton, TextField } from '@mui/material';
import { showNotification } from '../notification/Notification';
import Tabs from '../tabs/Tabs';
import LeftNavigation from '../../resources/left-nav.png'
import RightNavigation from '../../resources/right-nav.png'
import EyeIcon from '../../resources/eye.png'
import Frame1 from '../../resources/frames/alien.png'
import Frame2 from '../../resources/frames/chicken.png'
import Frame3 from '../../resources/frames/girafe.png'
import Frame4 from '../../resources/frames/unicorn.png'
import Frame5 from '../../resources/frames/robotic.png'
import Frame6 from '../../resources/frames/woman.png'
import Frame7 from '../../resources/frames/pdf-alien.png'
import Frame8 from '../../resources/frames/pdf-chicken.png'
import Frame9 from '../../resources/frames/pdf-girafe.png'
import Frame10 from '../../resources/frames/pdf-unicorn.png'
import Frame11 from '../../resources/frames/pdf-robotic.png'
import Frame12 from '../../resources/frames/pdf-woman.png'
import AlienIcon from '../../resources/icons/alien-icon.png'
import ChickenIcon from '../../resources/icons/chicken-icon.png'
import UnicornIcon from '../../resources/icons/unicorn-icon.png'
import RoboticIcon from '../../resources/icons/robotic-icon.png'
import WomanIcon from '../../resources/icons/woman-icon.png'
import GiraffeIcon from '../../resources/icons/girafe-icon.png'
import { getSelectedFramePath } from '../gif-library/GifLibraryUtils';
import { ApplyGifColor, ApplyGifFrame } from '../../endpoints/GifCreationEndpoints';
import Tag from '../overall/Tag';
import { AddUserTag, AssignTagToGif, FetchUserTags, RemoveTag } from '../../endpoints/TagManagementEndpoints';
import TagsActionDialog from '../gif-library/TagsActionDialog';


class DesignGifDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.gifImageRef = React.createRef();
    this.state = {
      isOpen: true,
      selectedColor: null,
      selectedFrame: null,
      selectedFilter: null,
      visibleColorIndex: 0,
      isGifPortrait: false,
      frameWidth: null,
      newTag: '',
      error: '',
      tags: props.selectedGif.tags || [],
      availableTags: [],
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
      { name: 'alien', frame: Frame1, icon: AlienIcon },
      { name: 'chicken', frame: Frame2, icon: ChickenIcon },
      { name: 'girafe', frame: Frame3, icon: GiraffeIcon },
      { name: 'unicorn', frame: Frame4, icon: UnicornIcon },
      { name: 'robotic', frame: Frame5, icon: RoboticIcon },
      { name: 'woman', frame: Frame6, icon: WomanIcon },
      { name: 'pdf-alien', frame: Frame7, icon: AlienIcon },
      { name: 'pdf-chicken', frame: Frame8, icon: ChickenIcon },
      { name: 'pdf-girafe', frame: Frame9, icon: GiraffeIcon },
      { name: 'pdf-unicorn', frame: Frame10, icon: UnicornIcon },
      { name: 'pdf-robotic', frame: Frame11, icon: RoboticIcon },
      { name: 'pdf-woman', frame: Frame12, icon: WomanIcon },
    ]
  }

  determineGifOrientation = (gifUrl) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = gifUrl;
      image.onload = () => {
        const isPortrait = image.height > image.width;
        resolve({ isPortrait });
      };
  
      image.onerror = reject;
    });
  };

  async updateGifOrientation() {
    try {
      const { isPortrait } = await this.determineGifOrientation(this.props.selectedGif.url);
      this.setState({ isGifPortrait: isPortrait });
    } catch (error) {
      console.error('Error determining GIF orientation:', error);
    }
  }

  handleTagChange = (e) => {
    this.setState({ newTag: e.target.value });
  };

  handleAddTag = async () => {
    console.log('jsjsjs')
    const { newTag, availableTags } = this.state;
    if (availableTags?.length < 9) {
      if (newTag.trim() !== '') {
        const tagDetails = {
          tagValue: newTag,
          color: this.getRandomColor(),
        };
  
        try {
          const response = await AddUserTag(tagDetails);
          const addedTag = response.data.tag;
  
          this.setState({
            availableTags: [...availableTags, addedTag],
            newTag: '',
          });
          showNotification('success', "New tag created!");
        } catch (error) {
          showNotification('error', "Failed to create new tag.");
          console.error('Error adding tag:', error);
        }
      }
    } else {
      showNotification('error', "Champ! You've added the maximum number of tags.")
    }
  };

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.colorSelection?.length);
    return this.colorSelection[randomIndex].color;
  }

  handleTagClick = async (tag) => {
    const { selectedGif } = this.props;
    const { tags } = this.state;
    const { hasConfirmed } = await TagsActionDialog.show();
    const tagDetails = {
      resourceId: selectedGif.resourceId,
      value: tag.value,
      color: tag.color,
    };
    if (!hasConfirmed) {
      // remove tag logic
      try {
        const response = await RemoveTag(tagDetails);
        console.log('response', response);
        const updatedTags = response.data.tags;
        this.setState({ availableTags: updatedTags, tags: tags.filter(t => t.value !== tag.value) });
        console.log('response', tags);
        showNotification('success', "Tag added successfully!");
      } catch (error) {
        showNotification('error', "Failed to remove tag")
      }
    } else {
        if (this.state.tags?.length < 3) {
          try {
            const response = await AssignTagToGif(tagDetails);
            const updatedTags = response.data.tags;
            this.setState({ tags: updatedTags });
            showNotification('success', "Tag added successfully!");
          } catch (error) {
            showNotification('error', "Failed to add tag.");
            console.error('Error adding tag:', error);
          }
        } else {
          showNotification('error', "Champ! You've added the maximum number of tags to this gif.")
        }
      }
  };

  updateFrameWidth() {
    const image = this.gifImageRef.current;
    if (image) {
      this.setState({ frameWidth: image.clientWidth });
    }
  }

  componentDidMount() {
    this.updateGifOrientation();
    window.addEventListener('popstate', this.handleCancel);
    this.fetchAvailableTags();
    this.setState({ tags: this.props.selectedGif.tags || [] });
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedGif.url !== prevProps.selectedGif.url) {
      this.setState({ selectedFrame: null })
      this.setState({ tags: [] })
      this.updateGifOrientation();
      this.updateFrameWidth();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleCancel);
  }

  handleCancel() {
    if (this.props.onClickCancel) {
      this.props.onClickCancel();
      this.setState({ selectedColor: null });
      this.setState({ tags: [] });
    } else {
      this.setState({ isOpen: false });
      this.setState({ tags: [] })
    }
  }

  fetchAvailableTags = async () => {
    try {
      const response = await FetchUserTags();
      this.setState({ availableTags: response.data.tags });
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

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

      if (response.data.message) {
        this.handleCancel();
        this.props.setDesignChanges(true);
        
        showNotification('success', "Woa! Your gif looks great, champ!")
      }
    } catch (error) {
      showNotification('error', "Whoops! We couldn’t save those changes. Please try again.")
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
  }

  handleFilterClick(filter) {
    this.setState({ selectedFilter: filter, selectedColor: null });
  }

  getFrameSourceByName(frameName) {
    const frame = this.frameSelection.find(f => f.name === frameName);
    return frame ? frame.frame : null;
  }

  getFilteredFrames() {
    const { isGifPortrait } = this.state;
    return this.frameSelection.filter(frame => 
      isGifPortrait ? frame.name.startsWith('pdf-') : !frame.name.startsWith('pdf-')
    );
  }
  

  render() {
    const { selectedColor, visibleColorIndex, tags, availableTags } = this.state;
    const { selectedGif, isOpen, tabs, activeTab, isMobile } = this.props;

    const filteredFrames = this.getFilteredFrames();

    const visibleColors = isMobile ? this.colorSelection.slice(visibleColorIndex, visibleColorIndex + 4) : this.colorSelection;

    const gifTags = Array.isArray(tags) && tags.length > 0 ? tags : (selectedGif.tags || []);

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
              variant="tabs-level-3"
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
                <img 
                  src={selectedGif.url}
                  alt="Selected Gif"
                  ref={this.gifImageRef}
                  onLoad={this.updateFrameWidth.bind(this)}
                />
                {(this.state.selectedFrame || getSelectedFramePath(selectedGif.selectedFrame, this.state.isGifPortrait)) && (
                  <img 
                    src={this.getFrameSourceByName(this.state.selectedFrame) || getSelectedFramePath(selectedGif.selectedFrame, this.state.isGifPortrait)}
                    style={{ width: this.state.frameWidth, height: '250px' }}
                    alt="Selected Frame"
                  />
                )}
              </div>
                <div className={`select-frame-container`}>
                  <div className="frames">
                    {filteredFrames.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => this.handleFrameClick(item.name)}
                        style={{cursor: 'pointer'}}
                        className={item.name}
                      >
                        <img src={item?.icon} alt="" />
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
          {activeTab === 2 && (
            <>
              <div className="title tag-title">
                <span>Create a tag by typing it in the field and clicking enter. CHoose a tag by clicking one in the list.</span>
              </div>
              <div className="container">
                <div className="image-with-tag">
                  <div className="image-frame-container">
                    <img 
                      src={selectedGif.url}
                      alt="Selected Gif"
                      ref={this.gifImageRef}
                      onLoad={this.updateFrameWidth.bind(this)}
                    />
                    {(this.state.selectedFrame || getSelectedFramePath(selectedGif.selectedFrame, this.state.isGifPortrait)) && (
                      <img 
                        src={this.getFrameSourceByName(this.state.selectedFrame) || getSelectedFramePath(selectedGif.selectedFrame, this.state.isGifPortrait)}
                        style={{ width: this.state.frameWidth, height: '250px' }}
                        alt="Selected Frame"
                      />
                    )}
                  </div>
                  <div className="tags-items" style={{ width: this.state.frameWidth }}>
                    {gifTags.map((tag, index) => {
                      return (
                        <Tag label={tag.value} variant={tag.color} color={tag.color} key={index} />
                      )
                    })}
                  </div>
                </div>
                <div className="tags">
                  <div className="tags-input">
                    <div className="label">Tag</div>
                      <TextField
                        value={this.state.newTag}
                        onChange={this.handleTagChange}
                        onKeyPress={(e) => { if (e.key === 'Enter') { this.handleAddTag(); }}}
                        variant="outlined"
                        fullWidth
                      />
                    </div>
                  <div className="tags-display">
                    <div className="tags-items">
                    {availableTags?.map((tag, index) => {
                      return (
                        <Tag label={tag.value} variant={tag.color} color={tag.color} onClick={() => this.handleTagClick(tag)} key={index} />
                      )
                    })}
                    </div>
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
