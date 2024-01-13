import React, { useContext, useEffect, useRef, useState } from 'react';
import './GifLibrary.scss';
import Header from '../overall/Header';
import { Box, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import { showNotification } from '../notification/Notification';
import ChooseResolutionDialog from './ChooseResolutionDialog';
// import { getSelectedFramePath } from './GifLibraryUtils';
import { GiftContext } from '../../context/GiftContextProvider';
import {
  DeleteGif,
  DownloadAllLibraryGifs,
  DownloadIndividualDesignedGifs,
  UpdateGifName,
} from '../../endpoints/GifCreationEndpoints';
import { FetchUserGifs } from '../../endpoints/UserEndpoints';
import useFetchUserTags from '../../queries/useUserTagsQuery';
import Filter from './Filter';
import DeleteGifPopover from './DeleteGifPopover';
import GifBoxes from './GifBoxes';
import ActionMenu from './ActionMenu';
import LoadingGif from '../../resources/loading-gif.png';
import { tabsData } from '../tabs/TabsData';

function GifLibrary() {
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { user } = useContext(GiftContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const { isMobile } = useMobileQuery();
  const navigate = useNavigate();
  // const [imageDimensions, setImageDimensions] = useState({
  //   width: null,
  //   height: null,
  // });
  const [deletePopoverAnchorEl, setDeletePopoverAnchorEl] = useState(null);
  const [currentGifIndex, setCurrentGifIndex] = useState(null);
  const imageRefs = useRef({});
  const access_token = localStorage.getItem('access_token');
  const { tags } = useFetchUserTags(isDesignOpen);
  const [selectedTags, setSelectedTags] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const filteredGifs = gifs?.filter(
    (gif) =>
      selectedTags.length === 0 ||
      gif?.tags?.some((gifTag) =>
        selectedTags.some((selectedTag) => selectedTag.value === gifTag.value)
      )
  );
  const { tabs, changeTab, activeTab, setActiveTab } = useTabs(tabsData, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const showDeletePopover = (index) => {
    setDeletePopoverAnchorEl(imageRefs.current[index]);
    setCurrentGifIndex(index);
  };

  useEffect(() => {
    if (!access_token) {
      const returnUrl = window.location.pathname;
      navigate(`/?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [access_token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
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
    };
    fetchData();
  }, [designChanges]);

  const handleOpenActionMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setCurrentGifIndex(selectedGif);
  };

  const handleCloseActionMenu = () => {
    setAnchorEl(null);
  };

  const handleActionSelect = (action) => {
    switch (action) {
      case 'Edit':
        handleEditButtonClick();
        break;
      case 'Delete':
        handleOnOpenDeletePopover(currentGifIndex);
        break;
      // case 'Download':
      //   handleDownloadIndividualGifs(index);
      //   break;
      case 'Share':
        // Handle the Share action
        break;
      default:
        break;
    }
    setAnchorEl(null);
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

  const handleDownloadIndividualGifs = async (index) => {
    if (selectedGif !== null) {
      const hoveredGif = gifs[index];
      let selectedResolution = user?.userInfo?.resolution;
      setIsLoading(true);

      if (!selectedResolution && !hoveredGif.resourceType === 'pdf') {
        const resolutionDialogResult = await ChooseResolutionDialog.show();
        if (!resolutionDialogResult.hasConfirmed) {
          return;
        }
        selectedResolution = resolutionDialogResult.selectedResolution;
      }

      const gifData = {
        url: hoveredGif.url,
        name: hoveredGif.name,
        selectedColor: hoveredGif.selectedColor,
        selectedFrame: hoveredGif.selectedFrame,
        resolution: selectedResolution,
      };

      try {
        const response = await DownloadIndividualDesignedGifs(
          JSON.stringify(gifData)
        );
        const blob = new Blob([response.data], { type: 'image/gif' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        setIsLoading(false);
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `${hoveredGif.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading individual GIF:', error);
        showNotification('error', 'Ohhh no! Something went wrong downloading your GIF. Please try again champ!')
      }
    }
  };

  const handleDownloadLibraryGifs = async () => {
    if (!gifs) {
      return;
    }
    const gifData = gifs.map((gif) => ({
      url: gif.url,
      name: gif.name,
      selectedColor: gif.selectedColor,
      selectedFrame: gif.selectedFrame,
    }));
    setIsLoading(true);
    try {
      const response = await DownloadAllLibraryGifs(gifData);
      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'your-gift-bag.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading ZIP file:', error);
    }
    setIsLoading(false);
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
    console.log('duration', duration, resourceType);
    setIsDesignOpen(true);
    setSelectedDesignGif({
      url: gifUrl,
      resourceId: resourceId,
      selectedColor: selectedColor,
      selectedFrame: selectedFrame,
      tags: tags,
      exampleEmail: exampleEmail,
      frame_urls: frameUrls,
      gifName: gifName,
    });
  };

  const handleEditButtonClick = () => {
    if (selectedGif !== null) {
      const hoveredGif = gifs[currentGifIndex];
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
      setDesignChanges(false);
    }
  };

  function handleOnOpenDeletePopover(index) {
    setCurrentGifIndex(index);
    showDeletePopover(index);
  }

  async function handleOnDeleteGif() {
    if (currentGifIndex !== null) {
      const hoveredGif = gifs[currentGifIndex];
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
      setDeletePopoverAnchorEl(null);
    }
  }
  const handleOpenDesign = () => {
    setIsDesignOpen(true);
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
      {deletePopoverAnchorEl && (
        <DeleteGifPopover
          anchorEl={deletePopoverAnchorEl}
          open={deletePopoverAnchorEl}
          onConfirm={() => handleOnDeleteGif()}
          onClose={() => setDeletePopoverAnchorEl(null)}
          onCancel={() => setDeletePopoverAnchorEl(null)}
        />
      )}
      <DesignGifDialog
        isOpen={isDesignOpen}
        selectedGif={selectedDesignGif}
        setDesignChanges={setDesignChanges}
        tabs={tabs}
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
            <>
              <span>This is your library. </span>
              Download all gifs at once
              <span> or </span>
              {isMobile ? 'click on' : 'hover over'} the gif you want to
              download.
            </>
          </Box>
          <div className="library-actions">
            <Box className="download">
              {gifs?.length > 0 ? (
                <OfficialButton
                  onClick={handleDownloadLibraryGifs}
                  isProcessing={isLoading}
                  label="Download all gifs"
                  variant="yellow"
                />
              ) : (
                <OfficialButton
                  onClick={() => navigate('/choose-option-create')}
                  label="Create gifs"
                  variant="yellow"
                />
              )}
            </Box>
            <Filter tags={tags} onTagSelectionChange={setSelectedTags} />
          </div>
        </Box>
        <Divider />
        <Box className="gif-wrapper">
          {filteredGifs.length > 0 ? (
            filteredGifs.map((item, index) => {
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
                      gifUrl={item.url}
                      index={index}
                      onClickMore={handleOpenActionMenu}
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
            <div style={{ color: '#fff' }}>No GIFs with that tag available</div>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default GifLibrary;
