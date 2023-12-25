import React, { useContext, useEffect, useRef, useState } from 'react';
import './GifLibrary.scss';
import Header from '../overall/Header';
import { Box, Button, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import { showNotification } from '../notification/Notification';
import ChooseResolutionDialog from './ChooseResolutionDialog';
import { getSelectedFramePath } from './GifLibraryUtils';
import { GiftContext } from '../../context/GiftContextProvider';
import {
  DeleteGif,
  DownloadAllLibraryGifs,
  DownloadIndividualDesignedGifs,
  UpdateGifName,
} from '../../endpoints/GifCreationEndpoints';
import { FetchUserGifs } from '../../endpoints/UserEndpoints';
import LoopIcon from '@mui/icons-material/Loop';
import useFetchUserTags from '../../queries/useUserTagsQuery';
import Filter from './Filter';
import DeleteGifPopover from './DeleteGifPopover';

function GifLibrary() {
  const [gifs, setGifs] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { user } = useContext(GiftContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const { tabs, changeTab, activeTab } = useTabs([
    'Frame Design',
    'Filter Design',
    'Tags',
  ]);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const { isMobile } = useMobileQuery();
  const navigate = useNavigate();
  const [imageDimensions, setImageDimensions] = useState({
    width: null,
    height: null,
  });
  const [deletePopoverAnchorEl, setDeletePopoverAnchorEl] = useState(null);
  const [currentGifIndex, setCurrentGifIndex] = useState(null);
  const imageRefs = useRef({});
  const access_token = localStorage.getItem('access_token');
  const { tags } = useFetchUserTags(isDesignOpen);
  const [selectedTags, setSelectedTags] = useState([]);
  const filteredGifs = gifs?.filter(
    (gif) =>
      selectedTags.length === 0 ||
      gif?.tags?.some((gifTag) =>
        selectedTags.some((selectedTag) => selectedTag.value === gifTag.value)
      )
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const showDeletePopover = (anchorEl, index) => {
    setDeletePopoverAnchorEl(anchorEl);
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

  const handleImageLoad = (index) => {
    const image = imageRefs.current[index];
    if (image) {
      const width = image.offsetWidth;
      const height = image.offsetHeight;
      setImageDimensions((prevDimensions) => ({
        ...prevDimensions,
        [index]: { width, height },
      }));
    }
  };

  const handleDownloadIndividualGifs = async () => {
    if (selectedGif !== null) {
      const hoveredGif = gifs[selectedGif];
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
    tags
  ) => {
    console.log('resourceType', resourceType);
    setIsDesignOpen(true);
    setSelectedDesignGif({
      url: gifUrl,
      resourceId: resourceId,
      selectedColor: selectedColor,
      selectedFrame: selectedFrame,
      tags: tags,
    });
  };

  const handleEditButtonClick = () => {
    if (selectedGif !== null) {
      const hoveredGif = gifs[selectedGif];
      editGif(
        hoveredGif.url,
        hoveredGif.resourceId,
        hoveredGif.selectedColor,
        hoveredGif.selectedFrame,
        hoveredGif.resourceType,
        hoveredGif.tags
      );
      setDesignChanges(false);
    }
  };

  function handleOnOpenDeletePopover(index) {
    setSelectedGif(index);
    const anchorEl = imageRefs.current[index];
    showDeletePopover(anchorEl, index);
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
          <LoopIcon className="loading-spinner" />
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
              <Filter tags={tags} onTagSelectionChange={setSelectedTags} />
            </Box>
          </div>
        </Box>
        <Box className="gif-wrapper">
          {filteredGifs.length > 0 ? (
            filteredGifs.map((item, index) => {
              return (
                <Box className="gif-box">
                  <Box
                    className={`gif-container ${
                      selectedGif === index ? 'hovered' : ''
                    } ${isMobile ? 'hovered' : ''}`}
                    onMouseEnter={() => setSelectedGif(index)}
                    onMouseLeave={() => setSelectedGif(null)}
                  >
                    <img
                      src={item.url}
                      ref={(el) => (imageRefs.current[index] = el)}
                      onLoad={() => handleImageLoad(index)}
                      alt=""
                      style={{
                        border:
                          !item.selectedFrame &&
                          `4px solid ${item.selectedColor}`,
                      }}
                    />
                    {item.selectedFrame && !item.selectedColor && (
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
                    )}
                    <Box className="gif-buttons">
                      <>
                        <Button
                          className="download"
                          onClick={handleDownloadIndividualGifs}
                        >
                          {isLoading ? 'Processing...' : 'Download'}
                        </Button>
                        <Button
                          className="edit"
                          onClick={handleEditButtonClick}
                        >
                          Edit
                        </Button>
                      </>
                    </Box>
                    <IconButton
                      onClick={() => handleOnOpenDeletePopover(index)}
                      className="delete-icon"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <TextField
                    type="text"
                    value={item.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleNameSubmit(index)
                    }
                    className="gif-name-input"
                  />
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
