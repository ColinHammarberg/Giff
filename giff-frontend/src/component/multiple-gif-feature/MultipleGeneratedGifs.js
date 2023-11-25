import React, { useEffect, useState } from 'react';
import { Box, Grid, Button } from '@mui/material';
import './MultipleGeneratedGifs.scss';
import LoadingGif from '../overall/LoadingGif';
import Header from '../overall/Header';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import OfficialButton from '../buttons/OfficialButton';
import useMobileQuery from '../../queries/useMobileQuery';
import { GetMultipleGifs } from '../../endpoints/GifCreationEndpoints';

function MultipleGeneratedGifs(props) {
  const { gifGenerated, isLoading, onDownload, setImportedGifs, importedGifs } = props;
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design' ]);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const [selectedGif, setSelectedGif] = useState(null);
  const { isMobile } = useMobileQuery();

  const editGif = (gifUrl, resourceId, selectedColor) => {
    console.log('Sharing GIF:', gifUrl);
    console.log('Resource ID:', resourceId);
    setIsDesignOpen(true);
    setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId, 'selectedColor': selectedColor});
  };

  const handleEditButtonClick = () => {
    if (selectedGif !== null) {
      const hoveredGif = importedGifs[selectedGif];
      editGif(hoveredGif.url, hoveredGif.resourceId, hoveredGif.selectedColor);
      setDesignChanges(false);
    }
  };

  const handleOpenDesign = () => {
    setIsDesignOpen(true);
  };

  const handleCloseDesign = () => {
    setIsDesignOpen(false);
  };

  useEffect(() => {
    if (gifGenerated) {
      console.log('gifGenerated.data', gifGenerated);
      const fetchData = async () => {
        const response = await GetMultipleGifs(gifGenerated);
        if (response.data) {
          console.log('response', response.data);
          setImportedGifs(response.data)
        }
      };
      fetchData();
    }
  }, [gifGenerated, designChanges, setImportedGifs]);

  console.log('gifGenerated', gifGenerated);

  const renderImportedGifs = () => {
    return importedGifs.map((gif, index) => (
      <Box className="gif" key={index}>
          <div className="gif-container">
            <img
              src={gif.url}
              alt={`Generated GIF ${index}`}
              className="generated-gif"
              style={{ border: `4px solid ${gif.selectedColor}`}}
            />
              <Box className="gif-buttons"
                onMouseEnter={() => setSelectedGif(index)}
                onMouseLeave={() => setSelectedGif(null)}
              >
                <Button className="edit" onClick={handleEditButtonClick}>Edit</Button>
              </Box>
          </div>
        <div className="file-info">
          <p className="gif-url">{gif.name}</p>
        </div>
      </Box>
    ));
  };
  
  

  return (
    <div className="multiple-generated-gif">
      <Header menu />
      {isLoading && !gifGenerated ? (
        <Box className="loading-container">
          <LoadingGif />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} className="multiple-gifs">
            {gifGenerated && renderImportedGifs()}
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
          </Grid>

          <Box className="button-container">
            <OfficialButton onClick={onDownload} className="download-btn" label="Download Gifs" isProcessing={isLoading} variant="yellow" />
          </Box>
        </>
      )}
    </div>
  );
}

export default MultipleGeneratedGifs;
