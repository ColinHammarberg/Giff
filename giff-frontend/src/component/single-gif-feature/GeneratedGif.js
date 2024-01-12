import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button, TextField } from '@mui/material';
import './GeneratedGif.scss';
import Header from '../overall/Header';
import LoadingGif from '../overall/LoadingGif';
import OfficialButton from '../buttons/OfficialButton';
import { GiftContext } from '../../context/GiftContextProvider';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import { DownloadIndividualDesignedGifs, GetMultipleGifs, UpdateGifName } from '../../endpoints/GifCreationEndpoints';
import { getSelectedFramePath } from '../gif-library/GifLibraryUtils';
import { showNotification } from '../notification/Notification';
import ExampleEmailPopover from './EmailExamplePopover';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, key } = props;
  const [importedGifs, setImportedGifs] = useState(null);
  const { editGif, isDesignOpen, isMobile, selectedDesignGif, handleOpenDesign, handleCloseDesign } = useContext(GiftContext);
  const [selectedGif, setSelectedGif] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab, setActiveTab } = useTabs(['Cut', 'Frame Design', 'Tags', 'Email']);
  const [expandedDescriptionIndex, setExpandedDescriptionIndex] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
  const imageRef = useRef(null);
  const [openExampleEmail, setOpenExampleEmail] = useState(null);

  const handleImageLoad = () => {
    const width = imageRef.current ? imageRef.current.offsetWidth : 0;
    const height = imageRef.current ? imageRef.current.offsetHeight : 0;
    setImageDimensions({ width, height });
  };

  useEffect(() => {
    if (gifGenerated && importedGifs?.length > 0) {
      setOpenExampleEmail(true);
    }
  }, [gifGenerated, importedGifs?.length])

  useEffect(() => {
    if (gifGenerated) {
      const fetchData = async () => {
        const response = await GetMultipleGifs(gifGenerated);
        if (response.data) {
          setImportedGifs(response.data)
        }
      };
      fetchData();
    }
  }, [gifGenerated, designChanges]);

  async function handleDownloadClick() {
    if (!gifGenerated) return;
  
    const { url, name, selectedColor, selectedFrame, resourceType } = importedGifs[0];
    const gifData = JSON.stringify({ url, name, selectedColor, selectedFrame, resourceType });
  
    try {
      setDownloadLoading(true)
      const response = await DownloadIndividualDesignedGifs(gifData);
      const blob = new Blob([response.data], { type: 'image/gif' });
      initiateDownload(blob, name);
    } catch (error) {
      console.error('Error downloading individual GIF:', error);
    }
  }
  
  function initiateDownload(blob, filename) {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    setDownloadLoading(false);
  }

  const handleEditButtonClick = () => {
    if (selectedGif !== null) {
      const hoveredGif = importedGifs[selectedGif];
      editGif(hoveredGif.url, hoveredGif.resourceId, hoveredGif.selectedColor, hoveredGif.selectedFrame, hoveredGif.resourceType, hoveredGif.tags, hoveredGif.example_email, hoveredGif.frame_urls);
      setDesignChanges(false);
    }
  };

  const handleNameChange = (index, newName) => {
    const updatedGifs = [...importedGifs];
    updatedGifs[index].name = newName;
    setImportedGifs(updatedGifs);
  };
  
  const handleNameSubmit = async (gif) => {
    const updatedName = gif.name;
    try {
      await UpdateGifName(gif.resourceId, updatedName);
      showNotification('success', 'Name updated successfully!');
    } catch (error) {
      showNotification('error', 'Error updating GIF name:');
    }
  };

  return (
    <div className="generated-gif" key={key}>
      <Header menu />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif singleGif />
        </Box>
      ) : (
        <>
        <Box className="title">Your gif is ready. It looks great.</Box>
        {gifGenerated && importedGifs?.length > 0 && (
          <Box className="gif">
            {importedGifs.map((gif, index) => {
              const isExpanded = expandedDescriptionIndex === index;
              const shortDescription = gif?.ai_description?.substring(0, 100) + "...";
              return (
                <>
                  <div className="gif-container">
                    <img src={gif?.url} ref={imageRef} onLoad={handleImageLoad} alt="Generated GIF" style={{ border: `4px solid ${gif.selectedColor || '#ffffff'}`}} />
                    <ExampleEmailPopover
                      open={openExampleEmail}
                      anchorEl={imageRef.current}
                      content={gif.example_email}
                      onClose={() => setOpenExampleEmail(false)}
                    />
                    {gif.selectedFrame && !gif.selectedColor && (
                      <img src={getSelectedFramePath(gif.selectedFrame)} style={{width: imageDimensions.width, height: imageDimensions.height}} alt="" />
                    )}
                    <Box className="gif-buttons"
                      onMouseEnter={() => setSelectedGif(index)}
                      onMouseLeave={() => setSelectedGif(null)}
                    >
                      <Button className="edit" onClick={handleEditButtonClick}>Edit</Button>
                    </Box>
                  </div>
                  {gif?.ai_description && (
                    <Box className="description" style={{ width: imageDimensions.width, backgroundColor: gif.selectedColor || '#ffffff'}}>
                      <p>
                        {isExpanded ? gif?.ai_description : shortDescription}
                      </p>
                      <Button
                        className="view-more-button"
                        onClick={() => setExpandedDescriptionIndex(isExpanded ? null : index)}
                      >
                        {isExpanded ? "View Less" : "See longer description"}
                      </Button>
                  </Box>
                  )}
                  <TextField
                    value={gif?.name}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit(gif)}
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                    InputProps={{
                      disableUnderline: true,
                  }}
                />
                </>
              )
            })}
          </Box>
        )}  
          <Box className="generated-gif-btn-box">
            <OfficialButton variant="yellow" label="Download GIF" onClick={handleDownloadClick} isProcessing={downloadLoading} />
          </Box>
          <DesignGifDialog
            isOpen={isDesignOpen}
            setDesignChanges={setDesignChanges}
            selectedGif={selectedDesignGif}
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
        </>
      )}
    </div>
  );
}

export default GeneratedGif;
