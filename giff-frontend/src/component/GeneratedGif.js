import React, { useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import './GeneratedGif.scss';
import Header from './Header';
// import { useNavigate } from 'react-router-dom';
import LoadingGif from './LoadingGif';
import OfficialButton from './OfficialButton';
import { DownloadAllLibraryGifs, GetMultipleGifs } from '../endpoints/Apis';
import { GiftContext } from '../context/GiftContextProvider';
import DesignGifDialog from './DesignGifDialog';
import { useTabs } from './Tabs';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, key } = props;
  // const navigate = useNavigate();
  const [importedGifs, setImportedGifs] = useState(null);
  const { editGif, isDesignOpen, isMobile, selectedDesignGif, handleOpenDesign, handleCloseDesign } = useContext(GiftContext);
  const [selectedGif, setSelectedGif] = useState(null);
  const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design']);

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
              return (
                <div className="gif-container">
                  <img src={gif?.url} alt="Generated GIF" style={{ border: `4px solid ${gif.selectedColor}`}} />
                  <Box className="gif-buttons"
                    onMouseEnter={() => setSelectedGif(index)}
                    onMouseLeave={() => setSelectedGif(null)}
                  >
                    <OfficialButton variant="pink" label="Edit" onClick={handleEditButtonClick} />
                  </Box>
                </div>
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
