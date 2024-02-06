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
  // DownloadAllLibraryGifs,
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
import PreviewSelectedGif from './PreviewSelectedGif';

function GifLibrary() {
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { user } = useContext(GiftContext);
  // const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const [previewGif, setPreviewGif] = useState({});
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
    if (selectedGif !== null || previewGif) {
      const hoveredGif = gifs[index] || previewGif;
      let selectedResolution = user?.userInfo?.resolution;

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
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `${hoveredGif.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading individual GIF:', error);
        showNotification(
          'error',
          'Ohhh no! Something went wrong downloading your GIF. Please try again champ!'
        );
      }
    }
  };

  // const handleDownloadLibraryGifs = async () => {
  //   if (!gifs) {
  //     return;
  //   }
  //   const gifData = gifs.map((gif) => ({
  //     url: gif.url,
  //     name: gif.name,
  //     selectedColor: gif.selectedColor,
  //     selectedFrame: gif.selectedFrame,
  //   }));
  //   setIsLoading(true);
  //   try {
  //     const response = await DownloadAllLibraryGifs(gifData);
  //     const blob = new Blob([response.data], { type: 'application/zip' });
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = downloadUrl;
  //     a.download = 'your-gift-bag.zip';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //   } catch (error) {
  //     console.error('Error downloading ZIP file:', error);
  //   }
  //   setIsLoading(false);
  // };

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
    if (selectedGif !== null || previewGif) {
      const hoveredGif = gifs[currentGifIndex] || previewGif;
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
      // setDesignChanges(false);
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
        <Filter tags={tags} onTagSelectionChange={setSelectedTags} />
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
                      totalClicks={item.clicks}
                      gifUrl={item.url}
                      index={index}
                      onClickGif={(event) => handlePreviewClick(event, item)}
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
            <div style={{ color: '#fff' }}>No GIFs available</div>
          )}
        </Box>
      </Box>
    </div>
  );
}

export default GifLibrary;
