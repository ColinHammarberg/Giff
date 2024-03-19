import React, { useEffect, useMemo, useRef, useState } from 'react';
import './GifLibrary.scss';
import Header from '../overall/Header';
import { Box, Divider } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import { showNotification } from '../notification/Notification';
// import { getSelectedFramePath } from './GifLibraryUtils';
import {
  DeleteGif,
  // DownloadAllLibraryGifs,
  DownloadIndividualDesignedGifs,
  UpdateGifName,
} from '../../endpoints/GifCreationEndpoints';
import { FetchUserGifs } from '../../endpoints/UserEndpoints';
import useFetchUserTags from '../../queries/useUserTagsQuery';
// import Filter from './Filter';
import GifBoxes from './GifBoxes';
import ActionMenu from './ActionMenu';
import LoadingGif from '../../resources/loading-gif.png';
import { tabsData } from '../tabs/TabsData';
import PreviewSelectedGif from './PreviewSelectedGif';
import Tag from '../overall/Tag';
import AddTagsDialog from './AddTagsDialog';
import LightTooltip from '../overall/LightToolTip';
import SortGifs from './SortGifs';

function GifLibrary() {
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const [previewGif, setPreviewGif] = useState({});
  const { isMobile } = useMobileQuery();
  const navigate = useNavigate();
  // const [imageDimensions, setImageDimensions] = useState({
  //   width: null,
  //   height: null,
  // });
  const [currentGifIndex, setCurrentGifIndex] = useState(null);
  const [selectedGifId, setSelectedGifId] = useState(null);
  const imageRefs = useRef({});
  const access_token = localStorage.getItem('access_token');
  const { tags, refetch: refetchTags } = useFetchUserTags(isDesignOpen);
  const [sortCriteria, setSortCriteria] = useState('createdDate');
  const [selectedTags, setSelectedTags] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const userTagsLimit = tags?.length === 12;
  const filteredGifs = gifs?.filter(
    (gif) =>
      selectedTags.length === 0 ||
      gif?.tags?.some((gifTag) =>
        selectedTags.some((selectedTag) => selectedTag.value === gifTag.value)
      )
  );
  const { tabs, changeTab, activeTab, setActiveTab } = useTabs(tabsData, 0);

  useEffect(() => {
    if (!access_token) {
      const returnUrl = window.location.pathname;
      navigate(`/?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [access_token, navigate]);

  const sortedAndFilteredGifs = useMemo(() => {
    const sortedGifs = [...filteredGifs];
    if (sortCriteria === 'createdDate') {
      sortedGifs.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
    } else if (sortCriteria === 'alphabetical') {
      sortedGifs.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortCriteria === 'clickCount') {
      sortedGifs.sort((a, b) => b.clicks - a.clicks);
    }
    return sortedGifs;
  }, [filteredGifs, sortCriteria]);

  useEffect(() => {
    const fetchData = async () => {
      setShowLoading(true);
      const response = await FetchUserGifs();
      if (response.data) {
        const sortedGifs = response.data.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : null;
          const dateB = b.created_at ? new Date(b.created_at) : null;

          if (dateA && dateB) {
            return dateB - dateA;
          } else if (dateA) {
            return -1;
          } else if (dateB) {
            return 1;
          }
          return 0;
        });
        setGifs(sortedGifs);
      }
      setShowLoading(false);
      setDesignChanges(false);
    };
    fetchData();
  }, [designChanges]);

  const handleOpenActionMenu = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedGifId(item.resourceId);
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
  };

  const handleTagClick = (clickedTag) => {
    setSelectedTags((prevSelectedTags) => {
      const isTagAlreadySelected = prevSelectedTags.some(
        (tag) => tag.value === clickedTag.value
      );
      if (isTagAlreadySelected) {
        return prevSelectedTags.filter((tag) => tag.value !== clickedTag.value);
      } else {
        return [...prevSelectedTags, clickedTag];
      }
    });
  };

  function renderUserTags() {
    return tags?.map((tag, index) => {
      const isSelected = selectedTags.some(
        (selectedTag) => selectedTag.value === tag.value
      );
      return (
        <Tag
          label={tag.value}
          key={index}
          color={tag.color}
          selected={isSelected}
          onClick={() => handleTagClick(tag)}
        />
      );
    });
  }

  const handleActionSelect = (action) => {
    switch (action) {
      case 'Edit':
        handleEditButtonClick();
        break;
      case 'Delete':
        handleOnDeleteGif();
        break;
      case 'ShareOutlook':
        window.open(
          'https://appsource.microsoft.com/en-us/product/office/WA200006594?ref=producthunt'
        );
        break;
      case 'ShareGmail':
        window.open(
          'https://workspace.google.com/marketplace/app/gift/537947018056?ref=producthunt'
        );
        break;
      default:
        break;
    }
    setAnchorEl(null); // Close the action menu
  };

  // const handleImageLoad = (index) => {
  //   const image = imageRefs.current[index];
  //   if (image) {
  //     const width = image.offsetWidth;
  //     const height = image.offsetHeight;
  //     setImageDimensions((prevDimensions) => ({
  //       ...prevDimensions,
  //       [index]: { width, height },
  //     }));
  //   }
  // };

  const handleDownloadIndividualGifs = async (event, gifId) => {
    console.log('gifId', gifId);
    event.preventDefault();
    event.stopPropagation();

    const hoveredGif =
      gifs.find((gif) => gif.resourceId === gifId) || previewGif;

    if (!hoveredGif) return;

    const gifData = {
      url: hoveredGif.url,
      name: hoveredGif.name,
      selectedColor: hoveredGif.selectedColor,
      selectedFrame: hoveredGif.selectedFrame,
      resourceType: hoveredGif.resourceType,
    };

    try {
      setDownloading(gifId);
      const response = await DownloadIndividualDesignedGifs(
        JSON.stringify(gifData)
      );
      const blob = new Blob([response.data], { type: 'image/gif' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = downloadUrl;
      a.download = `${hoveredGif.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      setDownloading(null);
    } catch (error) {
      console.error('Error downloading individual GIF:', error);
      showNotification(
        'error',
        'Ohhh no! Something went wrong downloading your GIF. Please try again champ!'
      );
      setDownloading(null);
    }
  };

  const editGif = (
    gifUrl,
    resourceId,
    selectedColor,
    selectedFrame,
    resourceType,
    tags,
    exampleEmail,
    duration,
    frameUrls,
    gifName
  ) => {
    setIsDesignOpen(true);
    setSelectedDesignGif({
      url: gifUrl,
      resourceId: resourceId,
      selectedColor: selectedColor,
      selectedFrame: selectedFrame,
      tags: tags,
      exampleEmail: exampleEmail,
      resourceType: resourceType,
      duration: duration,
      frame_urls: frameUrls,
      gifName: gifName,
    });
  };

  const handleEditButtonClick = () => {
    const isPreviewGifNotEmpty = Object.keys(previewGif).length > 0;
    if (selectedGif !== null || isPreviewGifNotEmpty) {
      const hoveredGif = isPreviewGifNotEmpty
            ? previewGif
            : sortedAndFilteredGifs.find((gif) => gif.resourceId === selectedGifId);
      if (hoveredGif) {
        editGif(
          hoveredGif.url,
          hoveredGif.resourceId,
          hoveredGif.selectedColor,
          hoveredGif.selectedFrame,
          hoveredGif.resourceType,
          hoveredGif.tags,
          hoveredGif.example_email,
          hoveredGif.duration,
          hoveredGif.frame_urls,
          hoveredGif.name
        );
      }
      setPreviewGif({});
    }
  };

 async function handleOnDeleteGif() {
    const hoveredGif = sortedAndFilteredGifs.find((gif) => gif.resourceId === selectedGifId);
    if (hoveredGif !== null) {
      const gifData = {
        name: hoveredGif.name,
        resourceId: hoveredGif.resourceId,
      };
      try {
        const response = await DeleteGif(gifData);
        if (response.data) {
          setGifs(response.data.updatedGifs);
          showNotification('success', 'Your gif has been terminated.');
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          showNotification('error', 'Oh no! Please try that again.');
        } else {
          showNotification('error', 'Oh no! Please try that again.');
        }
      }
    }
  }

  const onChangePreview = (direction) => {
    let newIndex = currentGifIndex + (direction === 'next' ? 1 : -1);

    if (newIndex >= gifs.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = gifs.length - 1;
    }

    setCurrentGifIndex(newIndex);
    setPreviewGif(gifs[newIndex]);
  };

  const handleOpenDesign = () => {
    setIsDesignOpen(true);
  };

  const handlePreviewClick = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewGif(item);
  };

  const handleCloseDesign = () => {
    setIsDesignOpen(false);
  };

  const handleNameChange = (index, newName) => {
    const updatedGifs = [...gifs];
    updatedGifs[index].name = newName;
    setGifs(updatedGifs);
  };

  const handleNameSubmit = async (index) => {
    const gif = gifs[index];
    try {
      await UpdateGifName(gif.resourceId, gif.name);
      showNotification('success', 'Your gif name has been updated.');
    } catch (error) {
      showNotification('error', 'Ouch! Please try that again.');
    }
  };

  const openAddTagsDialog = () => {
    if (!userTagsLimit) {
      AddTagsDialog.show().then((result) => {
        if (result.hasConfirmed) {
          refetchTags()
            .then(() => {
              console.log('### Tag added');
            })
            .catch((error) => {
              console.error('Failed to refetch tags:', error);
            });
        }
      });
    }
  };

  if (showLoading) {
    return (
      <>
        <Header menu />
        <div className="loading-gifs-container">
          <img className="loading-spinner" src={LoadingGif} alt="" />
        </div>
      </>
    );
  }

  return (
    <div className="gif-library">
      <Header menu />
      <PreviewSelectedGif
        isOpen={!!Object.keys(previewGif).length}
        previewGif={previewGif}
        onChangePreview={onChangePreview}
        setPreviewGif={setPreviewGif}
        handleOnDownload={handleDownloadIndividualGifs}
        handleEditGif={handleEditButtonClick}
        isMobile={isMobile}
      />
      <DesignGifDialog
        isOpen={isDesignOpen}
        selectedGif={selectedDesignGif}
        setDesignChanges={setDesignChanges}
        tabs={tabs}
        gifLibrary
        isMobile={isMobile}
        changeTab={changeTab}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        onClickOk={() => {
          handleOpenDesign();
        }}
        onClickCancel={() => {
          handleCloseDesign();
        }}
      />
      <Box className="gif-showcase">
        <Box className="gif-showcase-info">
          <Box className="title">
            <div className="main-title">
              <span>Welcome to your </span>
              <span>gif library!</span>
            </div>
            <div className="sub-title">
              <span>here you can find and </span>
              manage all your gifs
            </div>
          </Box>
          <div className="library-actions">
            {gifs?.length === 0 && (
              <Box className="create">
                <OfficialButton
                  onClick={() => navigate('/choose-option-create')}
                  label="Create gifs"
                  variant="yellow"
                />
              </Box>
            )}
          </div>
        </Box>
        <div className="actions-section">
          <div className="tags">
            {tags?.length > 0 && (
              <span>
                Press a tag to only display gifs assigned with that tag
              </span>
            )}
            {selectedTags.length > 0 && (
              <Tag
                label="clear filter"
                color="#ffffff"
                onClick={() => {
                  setSelectedTags([]);
                }}
              />
            )}
          </div>
          <SortGifs
            setSortCriteria={setSortCriteria}
            sortCriteria={sortCriteria}
          />
        </div>
        <Divider />
        <div className="tags-list">
          {renderUserTags()}
          <LightTooltip
            title="You have added the maximum number of tags"
            disableHoverListener={!userTagsLimit}
          >
            <div>
              <Tag
                label={<AddCircleIcon />}
                color="#ffffff"
                onClick={openAddTagsDialog}
                disabled={userTagsLimit}
              />
            </div>
          </LightTooltip>
        </div>
        <Box className="gif-wrapper">
          {sortedAndFilteredGifs.length > 0 ? (
            sortedAndFilteredGifs.map((item, index) => {
              return (
                <Box
                  className="gif-box"
                  onMouseEnter={() => setSelectedGif(index)}
                  onMouseLeave={() => setSelectedGif(null)}
                >
                  <Box
                    className={`gif-container ${
                      selectedGif === index ? 'hovered' : ''
                    } ${isMobile ? 'hovered' : ''}`}
                    ref={(element) => (imageRefs.current[index] = element)}
                  >
                    <GifBoxes
                      name={item.name}
                      color={item.selectedColor}
                      downloading={downloading === item.resourceId}
                      resourceId={item.resourceId}
                      totalClicks={item.clicks}
                      gifUrl={item.url}
                      index={index}
                      onClickGif={(event) => handlePreviewClick(event, item)}
                      onClickMore={(event) => handleOpenActionMenu(event, item)}
                      onClickDownload={handleDownloadIndividualGifs}
                      onNameChange={(newName) =>
                        handleNameChange(index, newName)
                      }
                      onNameSubmit={() => handleNameSubmit(index)}
                    />
                    <ActionMenu
                      anchorEl={anchorEl}
                      onClose={handleCloseActionMenu}
                      onSelect={handleActionSelect}
                      isMobile={isMobile}
                    />
                    {/* {item.selectedFrame && !item.selectedColor && (
                      <img
                        src={getSelectedFramePath(item.selectedFrame)}
                        alt=""
                        style={
                          imageDimensions[index]
                            ? {
                                width: imageDimensions[index].width,
                                height: imageDimensions[index].height,
                              }
                            : {}
                        }
                      />
                    )} */}
                  </Box>
                </Box>
              );
            })
          ) : (
            <div style={{ color: '#fff' }}>No GIFs available</div>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default GifLibrary;
