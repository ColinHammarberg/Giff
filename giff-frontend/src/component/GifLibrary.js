import React, { useEffect, useState } from 'react';
import './GifLibrary.scss';
import Header from './Header';
import { Box, Button } from '@mui/material';
import { DownloadAllLibraryGifs, DownloadIndividualDesignedGifs, FetchUserGifs } from '../endpoints/Apis';
import { useNavigate } from 'react-router-dom';
import DesignGifDialog from './DesignGifDialog';
import { useTabs } from './Tabs';
import giftUser from '../access/GiftUser';
import OfficialButton from './OfficialButton';
import useMobileQuery from '../queries/useMobileQuery';
// import { showNotification } from './Notification';

function GifLibrary() {
    const [gifs, setGifs] = useState([]);
    const [selectedGif, setSelectedGif] = useState(null);
    const [designChanges, setDesignChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDesignOpen, setIsDesignOpen] = useState(false);
    const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design' ]);
    const [selectedDesignGif, setSelectedDesignGif] = useState({});
    const { isMobile } = useMobileQuery();
    const navigate = useNavigate();
    useEffect(() => {
      const isLoggedIn = giftUser.isLoggedIn();
      const fetchData = async () => {
        const response = await FetchUserGifs(isLoggedIn);
        if (response.data) {
          console.log('response', response.data);
  
          // Sort the gifs based on the created_at field in descending order
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

      const handleDownloadIndividualGifs = async () => {
        if (selectedGif !== null) {
          const hoveredGif = gifs[selectedGif];
          const gifData = {
            url: hoveredGif.url,
            name: hoveredGif.name,
            selectedColor: hoveredGif.selectedColor,
          };
      
          try {
            const response = await DownloadIndividualDesignedGifs(JSON.stringify(gifData));
      
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
          }
        }
      };
      

      const handleDownloadLibraryGifs = async () => {
        if (!gifs) {
          return;
        }
        const gifData = gifs.map(gif => ({ url: gif.url, name: gif.name, selectedColor: gif.selectedColor }));
        setIsLoading(true);
        try {
          const response = await DownloadAllLibraryGifs(gifData);
          // Create blob
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

      const shareGif = (gifUrl, resourceId, selectedColor) => {
        console.log('Sharing GIF:', gifUrl);
        console.log('Resource ID:', resourceId);
        setIsDesignOpen(true);
        setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId, 'selectedColor': selectedColor});
      };

      // async function handleOnDeleteGif() {
      //   const hoveredGif = gifs[selectedGif];
      //   const gifData = {
      //     name: hoveredGif.name,
      //     resourceId: hoveredGif.resourceId,
      //   };
      
      //   try {
      //     const response = await DeleteGif(gifData);
      //     if (response.data) {
      //       console.log('response', response.data);
      
      //       // Update local state to remove the deleted GIF
      //       const updatedGifs = gifs.filter(gif => gif.resourceId !== hoveredGif.resourceId);
      //       setGifs(updatedGifs);
      
      //       showNotification('success', 'GIF deleted from your library.');
      //     }
      //   } catch (error) {
      //     if (error.response && error.response.status === 404) {
      //       showNotification('error', 'GIF not found.');
      //     } else {
      //       showNotification('error', 'Failed to delete the GIF.');
      //     }
      //   }
      // }

      const handleEditButtonClick = () => {
        if (selectedGif !== null) {
          const hoveredGif = gifs[selectedGif];
          shareGif(hoveredGif.url, hoveredGif.resourceId, hoveredGif.selectedColor);
          setDesignChanges(false);
        }
      };

      console.log('gifs', gifs);
      const handleOpenDesign = () => {
        setIsDesignOpen(true);
      };
    
      const handleCloseDesign = () => {
        setIsDesignOpen(false);
      };
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
          <Box className="title"><span>This is your library.</span> download all gifs at once <span>or</span> hover over the gif you want to download or share.</Box>
          <Box className="download">{gifs?.length > 0 ? <OfficialButton onClick={handleDownloadLibraryGifs} isProcessing={isLoading} label="Download all gifs" variant="yellow" /> : <OfficialButton onClick={() => navigate('/choose-option-create')} label="Create gifs" variant="yellow" />}</Box>
        </Box>
          <Box className="gif-wrapper">
            {gifs?.map((item, index) => {
              return (
                <Box
                  className="gif-box"
                >
                  <Box
                    className={`gif-container ${selectedGif === index ? 'hovered' : ''}`} 
                    onMouseEnter={() => setSelectedGif(index)}
                    onMouseLeave={() => setSelectedGif(null)}
                  >
                    <img src={item.url} alt="" style={{ border: `4px solid ${item.selectedColor}`}} />
                    <Box className="gif-buttons">
                      <Button className="download" onClick={handleDownloadIndividualGifs}>Download</Button>
                      <Button className="share" onClick={handleEditButtonClick}>Edit</Button>
                      {/* <Button className="delete" onClick={handleOnDeleteGif}>Delete</Button> */}
                    </Box>
                  </Box>
                  <span>{item.name}</span>
                </Box>
              )
            })}
          </Box>
      </Box>
    </div>
  );
}

export default GifLibrary;
