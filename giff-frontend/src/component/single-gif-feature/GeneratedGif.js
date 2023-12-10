import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import './GeneratedGif.scss';
import Header from '../overall/Header';
import LoadingGif from '../overall/LoadingGif';
import OfficialButton from '../buttons/OfficialButton';
import { GiftContext } from '../../context/GiftContextProvider';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import { DownloadIndividualDesignedGifs, GetMultipleGifs } from '../../endpoints/GifCreationEndpoints';
import { getSelectedFramePath } from '../gif-library/GifLibraryUtils';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, key } = props;
  const [importedGifs, setImportedGifs] = useState(null);
  const { editGif, isDesignOpen, isMobile, selectedDesignGif, handleOpenDesign, handleCloseDesign } = useContext(GiftContext);
  const [selectedGif, setSelectedGif] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design', 'AI Optimization']);
  const [expandedDescriptionIndex, setExpandedDescriptionIndex] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
  const imageRef = useRef(null);

  const handleImageLoad = () => {
    const width = imageRef.current ? imageRef.current.offsetWidth : 0;
    const height = imageRef.current ? imageRef.current.offsetHeight : 0;
    setImageDimensions({ width, height });
  };

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
      editGif(hoveredGif.url, hoveredGif.resourceId, hoveredGif.selectedColor);
      setDesignChanges(false);
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
