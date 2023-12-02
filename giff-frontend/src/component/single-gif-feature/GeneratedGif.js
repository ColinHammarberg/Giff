import React, { useContext, useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import './GeneratedGif.scss';
import Header from '../overall/Header';
import LoadingGif from '../overall/LoadingGif';
import OfficialButton from '../buttons/OfficialButton';
import { GiftContext } from '../../context/GiftContextProvider';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import { DownloadAllLibraryGifs, GetMultipleGifs } from '../../endpoints/GifCreationEndpoints';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, key } = props;
  // const navigate = useNavigate();
  const [importedGifs, setImportedGifs] = useState(null);
  const { editGif, isDesignOpen, isMobile, selectedDesignGif, handleOpenDesign, handleCloseDesign } = useContext(GiftContext);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design', 'AI Optimization']);
  const [expandedDescriptionIndex, setExpandedDescriptionIndex] = useState(null);
  const [descriptionWidth, setDescriptionWidth] = useState(null);
  const imageRef = useRef(null);

  const handleImageLoad = () => {
    const width = imageRef.current ? imageRef.current.offsetWidth : 0;
    setDescriptionWidth(width);
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
    if (gifGenerated) {
      const gifData = importedGifs.map(gif => ({ url: gif.url, name: gif.name, selectedColor: gif.selectedColor }));
      try {
        const response = await DownloadAllLibraryGifs(gifData);
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        setTimeout(() => {
          link.href = url;
          link.target = '_blank';
          link.download = 'your-gift-bag.zip';
          link.click();
          window.URL.revokeObjectURL(url);
        }, 3000)
      } catch (error) {
        console.error('Error downloading ZIP file:', error);
      }
    }
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
                    <Box className="gif-buttons"
                      onMouseEnter={() => setSelectedGif(index)}
                      onMouseLeave={() => setSelectedGif(null)}
                    >
                      <OfficialButton variant="pink" label="Edit" onClick={handleEditButtonClick} />
                    </Box>
                  </div>
                  <Box className="description" style={{ width: descriptionWidth, backgroundColor: gif.selectedColor || '#ffffff'}}>
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
                </>
              )
            })}
          </Box>
        )}  
          <Box className="generated-gif-btn-box">
            <OfficialButton variant="yellow" label="Download GIF" onClick={handleDownloadClick} />
            {/* <OfficialButton variant="green" label="Share gif in email" onClick={() => navigate('/email-choice')} /> */}
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
