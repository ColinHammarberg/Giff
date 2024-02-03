import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import './DesignGifDialog.scss';
import DialogWrapper from '../DialogWrapper';
import { Box, Button, IconButton, Slider, TextField } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { showNotification } from '../notification/Notification';
import Tabs from '../tabs/Tabs';
import LeftNavigation from '../../resources/left-nav.png';
import RightNavigation from '../../resources/right-nav.png';
import EyeIcon from '../../resources/eye.png';
import Frame1 from '../../resources/frames/alien.png';
import Frame2 from '../../resources/frames/chicken.png';
import Frame3 from '../../resources/frames/girafe.png';
import Frame4 from '../../resources/frames/unicorn.png';
import Frame5 from '../../resources/frames/robotic.png';
import Frame6 from '../../resources/frames/woman.png';
import Frame7 from '../../resources/frames/pdf-alien.png';
import Frame8 from '../../resources/frames/pdf-chicken.png';
import Frame9 from '../../resources/frames/pdf-girafe.png';
import Frame10 from '../../resources/frames/pdf-unicorn.png';
import Frame11 from '../../resources/frames/pdf-robotic.png';
import Frame12 from '../../resources/frames/pdf-woman.png';
import AlienIcon from '../../resources/icons/alien-icon.png';
import ChickenIcon from '../../resources/icons/chicken-icon.png';
import UnicornIcon from '../../resources/icons/unicorn-icon.png';
import RoboticIcon from '../../resources/icons/robotic-icon.png';
import WomanIcon from '../../resources/icons/woman-icon.png';
import GiraffeIcon from '../../resources/icons/girafe-icon.png';
import { getSelectedFramePath } from '../gif-library/GifLibraryUtils';
import {
  ApplyGifColor,
  ApplyGifFrame,
  DeleteGifFrames,
  UpdateGifDuration,
  UpdateGifFrames,
  UpdateGifName,
  updateEmailAPI,
} from '../../endpoints/GifCreationEndpoints';
import Tag from '../overall/Tag';
import {
  AddUserTag,
  AssignTagToGif,
  FetchUserTags,
  RemoveTag,
  RemoveTagFromGif,
} from '../../endpoints/TagManagementEndpoints';
import TagsActionDialog from '../gif-library/TagsActionDialog';
import EditEmail from './EditEmail';
import LoadingGif from '../../resources/loading-gif.png';
import { GenerateGifEmail, EnhanceGifEmail } from '../../endpoints/AiEndpoints';

class DesignGifDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.gifImageRef = React.createRef();
    this.state = {
      isOpen: true,
      selectedColor: null,
      selectedFrame: null,
      exampleEmail: props.selectedGif?.exampleEmail || '',
      selectedFilter: null,
      visibleColorIndex: 0,
      selectedFrames: this.props.selectedGif.frame_urls || [],
      gifDuration: 1,
      currentGifUrl: this.props.selectedGif.url,
      isEditingName: false,
      editedName: this.props.selectedGif?.gifName || '',
      isLoading: false,
      isLoadingEmail: false,
      isSaving: false,
      isGifPortrait: false,
      frameWidth: null,
      frameUrls: this.props.selectedGif.frame_urls || [],
      newTag: '',
      error: '',
      tags: props.selectedGif.tags || [],
      availableTags: [],
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSaveGif = this.handleSaveGif.bind(this);
    this.handleOnChangeTab = this.handleOnChangeTab.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
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
      { color: '#FA6CC1' },
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
    ];
  }

  handleDurationChange = async (event, newValue) => {
    const { selectedGif } = this.props;
    this.setState({ gifDuration: newValue, isLoading: true });

    let durationMultiplier = 1000;
    let duration = newValue * durationMultiplier;

    try {
      const response = await UpdateGifDuration(
        selectedGif.resourceId,
        duration
      );
      if (response && response.data && response.data.new_gif_url) {
        setTimeout(() => {
          this.setState({
            currentGifUrl: response.data.new_gif_url,
            isLoading: false,
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating GIF duration:', error);
      this.setState({ isLoading: false });
      showNotification('error', 'Failed to update GIF duration.');
    }
  };

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
      const { isPortrait } = await this.determineGifOrientation(
        this.props.selectedGif.url
      );
      this.setState({ isGifPortrait: isPortrait });
    } catch (error) {
      console.error('Error determining GIF orientation:', error);
    }
  }

  handleTagChange = (e) => {
    this.setState({ newTag: e.target.value });
  };

  handleAddTag = async () => {
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
          showNotification('success', 'Nice! You can now use your Tag');
        } catch (error) {
          showNotification('error', 'Oh no! Please try that again');
          console.error('Error adding tag:', error);
        }
      }
    } else {
      showNotification(
        'error',
        "Champ! You've added the maximum number of tags."
      );
    }
  };

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.colorSelection?.length);
    return this.colorSelection[randomIndex].color;
  }

  handleRemoveTagFromGif = async (tag) => {
    const { selectedGif } = this.props;
    const tagDetails = {
      resourceId: selectedGif.resourceId,
      value: tag.value,
    };
    try {
      const response = await RemoveTagFromGif(tagDetails);
      const updatedTags = response.data.tags;
      this.setState({ tags: updatedTags });
      showNotification('success', 'Your tag is removed!');
    } catch (error) {
      showNotification('error', 'Oh no! Please try that again');
    }
  };

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
      try {
        const response = await RemoveTag(tagDetails);
        console.log('response', response);
        const updatedTags = response.data.tags;
        this.setState({
          availableTags: updatedTags,
          tags: tags.filter((t) => t.value !== tag.value),
        });
        console.log('response', tags);
        showNotification('success', 'Your tag is removed!');
      } catch (error) {
        showNotification('error', 'Oh no! Please try that again');
      }
    } else {
      if (this.state.tags?.length < 3) {
        try {
          const response = await AssignTagToGif(tagDetails);
          const updatedTags = response.data.tags;
          this.setState({ tags: updatedTags });
          showNotification('success', 'Aaaand your gif has a tag');
        } catch (error) {
          showNotification('error', 'Oh no! Please try that again');
          console.error('Error adding tag:', error);
        }
      } else {
        showNotification(
          'error',
          "Champ! You've added the maximum number of tags to this gif."
        );
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
    this.setState({ exampleEmail: this.props.selectedGif.exampleEmail || '' });
  }

  componentDidUpdate(prevProps) {
    const { selectedGif, setActiveTab, gifLibrary } = this.props;
    console.log('this.props.selectedGif.duration', this.props.selectedGif);
    if (this.props.selectedGif.url !== prevProps.selectedGif.url) {
      this.setState({
        selectedFrame: null,
        gifDuration: this.props.selectedGif.duration || 1,
        frameUrls: this.props.selectedGif.frame_urls,
        selectedFrames: this.props.selectedGif.frame_urls,
        editedName: this.props.selectedGif.gifName,
        currentGifUrl: this.props.selectedGif.url,
      });
      if (selectedGif.selectedColor) {
        setActiveTab(2);
      } else if (selectedGif?.frame_urls?.length === 0 || gifLibrary) {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }
      this.setState({ tags: [] });
      this.setState({
        exampleEmail: this.props.selectedGif.exampleEmail || '',
      });
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
      this.setState({ tags: [] });
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
    const { selectedColor, selectedFrame, exampleEmail, editedName } =
      this.state;
    const { selectedGif } = this.props;

    let isUpdated = false;
    this.setState({ isSaving: true });
    if (exampleEmail !== selectedGif.exampleEmail) {
      try {
        await updateEmailAPI(selectedGif.resourceId, exampleEmail);
        isUpdated = true;
      } catch (error) {
        showNotification('error', 'Failed to update email.');
      }
    }
    try {
      let response;
      if (editedName !== selectedGif.gifName) {
        await UpdateGifName(selectedGif.resourceId, editedName);
      }
      if (selectedColor) {
        response = await ApplyGifColor(selectedGif, selectedColor);
      } else if (selectedFrame) {
        response = await ApplyGifFrame(selectedGif, selectedFrame);
      }

      if (response && response.data.message) {
        isUpdated = true;
      }
    } catch (error) {
      console.error('Error applying color/frame to GIF:', error);
      showNotification(
        'error',
        'Whoops! We couldn’t apply the color/frame. Please try again.'
      );
    }
    if (isUpdated) {
      showNotification(
        'success',
        'Woa! Your new gif details looks great, champ!'
      );
    }
    try {
      if (this.props.gifCreationFlow) {
        const gifFramesData = {
          name: selectedGif.gifName,
          resourceId: selectedGif.resourceId,
        };
        const resp = await DeleteGifFrames(gifFramesData);
        console.log('resp', resp);
        this.props.navigate('/gif-library');
      } else {
        this.props.setDesignChanges(true);
        this.handleCancel();
      }
    } catch (error) {
      showNotification(
        'error',
        'Something went sideways champ! Please try it again!'
      );
    }
    this.setState({ isSaving: false });
  };

  handleOnChangeTab(value) {
    if (this.props.activeTab !== value) {
      this.props.changeTab(value);
    }
  }

  handlePrevColors() {
    const { visibleColorIndex } = this.state;
    const prevIndex = Math.max(visibleColorIndex - 4, 0);
    this.setState({ visibleColorIndex: prevIndex });
  }

  handleEmailChange = (newEmail) => {
    this.setState({ exampleEmail: newEmail });
  };

  handleNextColors() {
    const { visibleColorIndex } = this.state;
    const nextIndex = Math.min(
      visibleColorIndex + 4,
      this.colorSelection.length - 4
    );
    this.setState({ visibleColorIndex: nextIndex });
  }

  handleColorClick(color) {
    this.setState((prevState) => ({
      selectedColor: prevState.selectedColor === color ? null : color,
      selectedFrame: null,
    }));
  }

  handleFrameClick(frameName) {
    this.setState({ selectedFrame: frameName, selectedColor: null });
  }

  handleFilterClick(filter) {
    this.setState({ selectedFilter: filter, selectedColor: null });
  }

  getFrameSourceByName(frameName) {
    const frame = this.frameSelection.find((f) => f.name === frameName);
    return frame ? frame.frame : null;
  }

  getFilteredFrames() {
    const { isGifPortrait } = this.state;
    return this.frameSelection.filter((frame) =>
      isGifPortrait
        ? frame.name.startsWith('pdf-')
        : !frame.name.startsWith('pdf-')
    );
  }

  handleGenerateEmail = async () => {
    const { currentGifUrl } = this.state;
    try {
      this.setState({ isLoadingEmail: true });
      console.log('currentGifUrl', currentGifUrl);
      const response = await GenerateGifEmail(currentGifUrl);
      console.log('response', response);
      this.setState({
        exampleEmail: response.data.example_email,
        isLoadingEmail: false,
      });
    } catch (error) {
      console.error('Error generating email:', error);
      this.setState({ isLoading: false });
      showNotification('error', 'Failed to generate email.');
    }
  };

  handleEnhanceEmail = async () => {
    const { currentGifUrl, exampleEmail } = this.state;
    try {
      this.setState({ isLoadingEmail: true });
      console.log('currentGifUrl', currentGifUrl);
      const response = await EnhanceGifEmail(currentGifUrl, exampleEmail);
      console.log('response', response);
      this.setState({
        exampleEmail: response.data.example_email,
        isLoadingEmail: false,
      });
    } catch (error) {
      console.error('Error generating email:', error);
      this.setState({ isLoading: false });
      showNotification('error', 'Failed to generate email.');
    }
  };

  handleSaveEditedName = async () => {
    this.setState({ isEditingName: false });
  };

  handleCancelNameEdit = () => {
    this.setState({ isEditingName: false });
  };

  updateGif = async (updatedFrames) => {
    const { selectedGif } = this.props;
    const gifData = {
      resourceId: selectedGif.resourceId,
      frameUrls: updatedFrames,
    };
    try {
      this.setState({ isLoading: true });
      const response = await UpdateGifFrames(gifData);
      this.setState({ currentGifUrl: response.new_gif_url });
      this.setState({ isLoading: false });
    } catch (error) {
      console.error('Error updating GIF frames:', error);
    }
  };

  toggleGifFrameSelection = async (frameUrl) => {
    this.setState((prevState) => {
      const isSelected = prevState.selectedFrames.includes(frameUrl);
      const updatedFrames = isSelected
        ? prevState.selectedFrames.filter((url) => url !== frameUrl)
        : [...prevState.selectedFrames, frameUrl];

      this.updateGif(updatedFrames);
      return { selectedFrames: updatedFrames };
    });
  };

  sliderMarks = [
    { value: 0.33, label: '0.33s' },
    { value: 0.66, label: '0.66s' },
    { value: 1, label: '1s' },
    { value: 1.33, label: '1.33s' },
    { value: 1.66, label: '1.66s' },
    { value: 2, label: '2s' },
    { value: 2.33, label: '2.33s' },
    { value: 2.66, label: '2.66s' },
    { value: 3, label: '3s' },
  ];

  renderTitles = {
    0: (
      <div>
        Show your <span>director skills</span> and edit your gif so that it
        displays the best parts <span>of your content.</span>
      </div>
    ),
    1: (
      <div>
        Choose a <span>nice frame</span> to wrap your gif by{' '}
        <span>clicking on the</span> color selections.
      </div>
    ),
    2: (
      <div>
        Assign a tag to your gif! <span>Create a new one</span> by typing{' '}
        <span>into the field</span> or use your existing tags by clicking on
        them.
      </div>
    ),
    3: (
      <div>
        Attach <span>an email text to your gif</span> that can be reused to
        speed up the marketing process.
      </div>
    ),
  };

  render() {
    const {
      selectedColor,
      visibleColorIndex,
      tags,
      availableTags,
      exampleEmail,
      currentGifUrl,
      isLoading,
      frameUrls,
      isEditingName,
      editedName,
    } = this.state;
    const { selectedGif, isOpen, tabs, activeTab, isMobile } = this.props;

    // const filteredFrames = this.getFilteredFrames();

    const visibleColors = isMobile
      ? this.colorSelection.slice(visibleColorIndex, visibleColorIndex + 4)
      : this.colorSelection;

    const gifTags =
      Array.isArray(tags) && tags.length > 0 ? tags : selectedGif.tags || [];

    return (
      <DialogWrapper
        modal
        maxWidth="lg"
        className={`white new-popup design-gif-dialog ${
          isMobile ? 'mobile-view' : ''
        }`}
        onClose={this.handleCancel}
        open={isOpen}
      >
        <div className="content">
          <div className="title">
            <span className="main-title">
              Your gif is ready, <span>it looks great!</span>
            </span>
            <span className="sub-title">
              <span>Customize your gif to make it</span> extra special and
              perfect for your target audience
            </span>
          </div>
          <div className="style-content">
            <div className="left-content">
              <div className="left-title">
                <span>Gif preview</span>
              </div>
              <div className="image-with-tag">
                <div
                  className="tags-items"
                  style={{ width: this.state.frameWidth }}
                >
                  {gifTags.map((tag, index) => {
                    return (
                      <Tag
                        label={tag.value}
                        variant={tag.color}
                        color={tag.color}
                        key={index}
                        onRemove={() => this.handleRemoveTagFromGif(tag)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="image-frame-container">
                {isLoading ? (
                  <img className="loading-spinner" src={LoadingGif} alt="" />
                ) : (
                  <img
                    src={currentGifUrl || selectedGif.url}
                    alt="Selected Gif"
                    ref={this.gifImageRef}
                    onLoad={this.updateFrameWidth.bind(this)}
                    style={{
                      border: `7px solid ${
                        selectedColor ||
                        selectedGif.selectedColor ||
                        'transparent'
                      }`,
                    }}
                  />
                )}
                {(this.state.selectedFrame ||
                  getSelectedFramePath(
                    selectedGif.selectedFrame,
                    this.state.isGifPortrait
                  )) && (
                  <img
                    src={
                      this.getFrameSourceByName(this.state.selectedFrame) ||
                      getSelectedFramePath(
                        selectedGif.selectedFrame,
                        this.state.isGifPortrait
                      )
                    }
                    style={{
                      width: this.state.frameWidth,
                      height: '250px',
                    }}
                    alt="Selected Frame"
                  />
                )}
                {this.props.gifCreationFlow && (
                  <IconButton className="delete" onClick={this.props.onDelete}>
                    <CloseIcon />
                  </IconButton>
                )}
              </div>
              <div className="gif-name-section">
                {isEditingName ? (
                  <>
                    <TextField
                      value={editedName}
                      type="text"
                      onChange={(e) =>
                        this.setState({ editedName: e.target.value })
                      }
                      InputProps={{
                        endAdornment: (
                          <>
                            <IconButton onClick={this.handleSaveEditedName}>
                              <CheckIcon className="confirm" />
                            </IconButton>
                            <IconButton onClick={this.handleCancelNameEdit}>
                              <CloseIcon className="close" />
                            </IconButton>
                          </>
                        ),
                      }}
                    />
                  </>
                ) : (
                  <>
                    <span>{editedName}</span>
                    <IconButton
                      onClick={() => this.setState({ isEditingName: true })}
                    >
                      <EditIcon />
                    </IconButton>
                  </>
                )}
              </div>
              {!selectedGif?.resourceType === 'video' ||
                (selectedGif?.resourceType === null && (
                  <div className="slider-container">
                    <span>Adjust GIF Duration:</span>
                    <div className="slider">
                      <span>Fast</span>
                      <Slider
                        value={this.state.gifDuration}
                        onChange={this.handleDurationChange}
                        min={0.33}
                        defaultValue={1}
                        max={3}
                        step={0.33}
                        valueLabelDisplay="auto"
                        aria-labelledby="duration-slider"
                        marks={this.sliderMarks}
                      />
                      <span>Slow</span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="right-content">
              <div className="top-right-content">
                {!isMobile && (
                  <Tabs
                    tabs={tabs}
                    onChange={this.handleOnChangeTab}
                    disabled={tabs.map((tab, index) => {
                      if (
                        (index === 0 && !selectedGif?.frame_urls) ||
                        (index === 0 && this.props.gifLibrary) ||
                        (index === 1 && selectedGif?.selectedColor)
                      ) {
                        return true;
                      } else return false;
                    })}
                    selectedGif={selectedGif}
                    gifLibrary={this.props.gifLibrary}
                    variant="tabs-level-3"
                  />
                )}
                <div className="description">
                  {this.renderTitles[activeTab]}
                </div>
              </div>
              {activeTab === 0 && (
                <>
                  <div className="container">
                    <div className="gif-images">
                      {isMobile && (
                        <IconButton onClick={this.handlePrevColors}>
                          <img src={LeftNavigation} alt="" />
                        </IconButton>
                      )}
                      <div className="gifImages">
                        {frameUrls?.map((url, index) => (
                          <img
                            src={url}
                            key={index}
                            alt=""
                            className={
                              this.state.selectedFrames.includes(url)
                                ? 'selected'
                                : 'deselected'
                            }
                            onClick={() => this.toggleGifFrameSelection(url)}
                          />
                        ))}
                      </div>
                      {isMobile && (
                        <IconButton onClick={this.handleNextColors}>
                          <img src={RightNavigation} alt="" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 1 && (
                <>
                  <div className="container">
                    <div
                      className={`select-color-container ${
                        isMobile ? 'mobile-view' : ''
                      }`}
                    >
                      {isMobile && (
                        <IconButton onClick={this.handlePrevColors}>
                          <img src={LeftNavigation} alt="" />
                        </IconButton>
                      )}
                      <div className="colors">
                        {visibleColors.map((item, index) => (
                          <Box
                            key={index}
                            onClick={() => this.handleColorClick(item.color)}
                            style={{
                              backgroundColor: item.color,
                              cursor: 'pointer',
                              boxShadow:
                                selectedColor === item.color
                                  ? '0 0 10px 5px rgba(0, 0, 0, 0.3)'
                                  : 'none',
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
                        <IconButton onClick={this.handleNextColors}>
                          <img src={RightNavigation} alt="" />
                        </IconButton>
                      )}
                    </div>
                  </div>
                </>
              )}
              {activeTab === 2 && (
                <>
                  <div className="container">
                    <div className="tags">
                      <div className="tags-input">
                        <div className="label">Tag</div>
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
                      <div className="tags-display">
                        <div className="tags-items">
                          {availableTags?.map((tag, index) => {
                            return (
                              <Tag
                                label={tag.value}
                                variant={tag.color}
                                color={tag.color}
                                onClick={() => this.handleTagClick(tag)}
                                key={index}
                              />
                            );
                          })}
                          {availableTags.length > 0 && (
                            <span className="info">
                              press on a tag to select it
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 3 && (
                <div className="container">
                  <EditEmail
                    defaultEmail={exampleEmail}
                    placeholder="You currently have no email text attached to this email... No worries! Just start typing one right now or use our ai feature to generate your message based on the gifs content and your intended target audience."
                    onEmailChange={this.handleEmailChange}
                  />
                  {!exampleEmail ? (
                    <Button onClick={this.handleGenerateEmail}>
                      <SmartToyIcon />
                      {this.state.isLoadingEmail
                        ? 'Processing'
                        : 'Ai generate an email draft'}
                    </Button>
                  ) : (
                    <Button onClick={this.handleEnhanceEmail}>
                      <SmartToyIcon />
                      {this.state.isLoadingEmail
                        ? 'Processing'
                        : 'Enhance your email draft'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="action-content">
            <div className="buttons">
              <Button onClick={this.handleSaveGif}>
                {this.state.isSaving ? 'Processing...' : 'Done'}
              </Button>
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
