import React, { useContext, useEffect, useRef, useState } from 'react';
import './GifLibrary.scss';
import Header from '../overall/Header';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import { showNotification } from '../notification/Notification';
import DeleteGifDialog from './DeleteGifDialog';
import ChooseResolutionDialog from './ChooseResolutionDialog';
import { getSelectedFramePath } from './GifLibraryUtils';
import { GiftContext } from '../../context/GiftContextProvider';
import { DeleteGif, DownloadAllLibraryGifs, DownloadIndividualDesignedGifs } from '../../endpoints/GifCreationEndpoints';
import { FetchUserGifs } from '../../endpoints/UserEndpoints';
import LoopIcon from '@mui/icons-material/Loop';
import useFetchUserTags from '../../queries/useUserTagsQuery';
import Filter from './Filter';

function GifLibrary() {
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null);
    const [designChanges, setDesignChanges] = useState(false);
    const { user } = useContext(GiftContext);
    const [isLoading, setIsLoading] = useState(false);
    const [showLoading, setShowLoading] = useState(true);
    const [isDesignOpen, setIsDesignOpen] = useState(false);
    const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design', 'Tags']);
    const [selectedDesignGif, setSelectedDesignGif] = useState({});
    const [openEditMode, setOpenEditMode] = useState(false);
    const { isMobile } = useMobileQuery();
    const navigate = useNavigate();
    const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
    const imageRefs = useRef({});
    const access_token = localStorage.getItem('access_token');
    const { tags } = useFetchUserTags(isDesignOpen);
    const [selectedTags, setSelectedTags] = useState([]);
    const filteredGifs = gifs?.filter(gif => 
      selectedTags.length === 0 || gif.tags.some(gifTag => 
        selectedTags.some(selectedTag => selectedTag.value === gifTag.value))
    );
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 5000);
    
      return () => clearTimeout(timer);
    }, []);

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
        setImageDimensions(prevDimensions => ({
          ...prevDimensions,
          [index]: { width, height }
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
          const response = await DownloadIndividualDesignedGifs(JSON.stringify(gifData));
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

      function handleOnClickOpenEditMode() {
        setOpenEditMode(true);
      }
      
      const handleDownloadLibraryGifs = async () => {
        if (!gifs) {
          return;
        }
        const gifData = gifs.map(gif => ({ url: gif.url, name: gif.name, selectedColor: gif.selectedColor, selectedFrame: gif.selectedFrame }));
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

      const editGif = (gifUrl, resourceId, selectedColor, selectedFrame, resourceType, tags) => {
        console.log('tags', tags, resourceType);
        setIsDesignOpen(true);
        setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId, 'selectedColor': selectedColor, 'selectedFrame': selectedFrame, 'tags': tags});
      };

      const handleEditButtonClick = () => {
        if (selectedGif !== null) {
          const hoveredGif = gifs[selectedGif];
          console.log('hoveredGif', hoveredGif);
          editGif(hoveredGif.url, hoveredGif.resourceId, hoveredGif.selectedColor, hoveredGif.selectedFrame, hoveredGif.resourceType, hoveredGif.tags);
          setDesignChanges(false);
        }
      };

      async function handleOnDeleteGif() {
        const hoveredGif = gifs[selectedGif];
        const gifData = {
          name: hoveredGif.name,
          resourceId: hoveredGif.resourceId,
        };

        const { hasConfirmed } = await DeleteGifDialog.show();
        if (!hasConfirmed) {
          return;
        } else {
          try {
            const response = await DeleteGif(gifData);
            if (response.data) {        
              const updatedGifs = gifs.filter(gif => gif.resourceId !== hoveredGif.resourceId);
              setGifs(updatedGifs);
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
  const handleOpenDesign = () => {
    setIsDesignOpen(true);
  };
    
  const handleCloseDesign = () => {
    setIsDesignOpen(false);
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
          {openEditMode ? (
            <>
              <span>You are in edit mode. Hover over </span>
              the gif you want
              <span> or </span>
              When ready, click the big button to go back to your library.
            </>
          ) : (
            <>
              <span>This is your library. </span>
               Download all gifs at once
              <span> or </span>
              {isMobile ? 'click on' : 'hover over'} the gif you want to download.
            </>
          )}
          </Box>
          <div className="library-actions">
            <Box className="download">
              {gifs?.length > 0 ? (
                openEditMode ? (
                  <OfficialButton 
                    onClick={() => setOpenEditMode(false)} 
                    isProcessing={isLoading} 
                    label="Go back to library" 
                    variant="yellow" 
                  />
                ) : (
                  <OfficialButton 
                    onClick={handleDownloadLibraryGifs} 
                    isProcessing={isLoading} 
                    label="Download all gifs" 
                    variant="yellow"
                  />
                )
              ) : (
                <OfficialButton 
                  onClick={() => navigate('/choose-option-create')} 
                  label="Create gifs" 
                  variant="yellow" 
                />
              )}
              {!openEditMode && (
                <Filter tags={tags} onTagSelectionChange={setSelectedTags} />
              )}
            </Box>
          </div>
          {gifs?.length > 0 && !openEditMode && filteredGifs.length > 0 && (<Box className="edit"><Button onClick={handleOnClickOpenEditMode} className="edit-mode-btn">Edit Mode</Button></Box>)}
        </Box>
          <Box className="gif-wrapper">
            {filteredGifs.length > 0 ? (
              filteredGifs.map((item, index) => {
                return (
                  <Box
                    className="gif-box"
                  >
                    <Box
                      className={`gif-container ${selectedGif === index ? 'hovered' : ''} ${isMobile ? 'hovered' : ''}`}
                      onMouseEnter={() => setSelectedGif(index)}
                      onMouseLeave={() => setSelectedGif(null)}
                    >
                      <img
                        src={item.url} 
                        ref={el => imageRefs.current[index] = el} 
                        onLoad={() => handleImageLoad(index)}
                        alt=""
                        style={{ border: !item.selectedFrame && `4px solid ${item.selectedColor}`}} 
                      />
                      {item.selectedFrame && !item.selectedColor && (
                        <img 
                          src={getSelectedFramePath(item.selectedFrame)} 
                          alt="" 
                          style={imageDimensions[index] ? {width: imageDimensions[index].width, height: imageDimensions[index].height} : {}} 
                        />
                      )}
                      <Box className="gif-buttons">
                      {!openEditMode ? (
                        <>
                          <Button className="download" onClick={handleDownloadIndividualGifs}>{isLoading ? 'Processing...' : 'Download'}</Button>
                        </>
                      ) : (
                        <>
                          <Button className="download" onClick={handleOnDeleteGif}>Delete</Button>
                          <Button className="edit" onClick={handleEditButtonClick}>Edit</Button>
                        </>
                    )}
                      </Box>
                    </Box>
                    <span>{item.name}</span>
                  </Box>
                )
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
