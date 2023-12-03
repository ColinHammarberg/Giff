import React, { useEffect, useRef, useState } from 'react';
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
  const { tabs, changeTab, activeTab } = useTabs(['Frame Design', 'Filter Design', 'AI Optimization']);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  const [selectedGif, setSelectedGif] = useState(null);
  const [expandedDescriptionIndex, setExpandedDescriptionIndex] = useState(null);
  const [descriptionWidth, setDescriptionWidth] = useState(null);
  const imageRef = useRef(null);
  const { isMobile } = useMobileQuery();

  const editGif = (gifUrl, resourceId, selectedColor) => {
    console.log('Sharing GIF:', gifUrl);
    console.log('Resource ID:', resourceId);
    setIsDesignOpen(true);
    setSelectedDesignGif({'url': gifUrl, 'resourceId': resourceId, 'selectedColor': selectedColor});
  };

  const handleImageLoad = () => {
    const width = imageRef.current ? imageRef.current.offsetWidth : 0;
    setDescriptionWidth(width);
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
    return importedGifs.map((gif, index) => {
      const isExpanded = expandedDescriptionIndex === index;
      const shortDescription = gif?.ai_description?.substring(0, 100) + "...";
      return (
        <Box className="gif" key={index}>
          <div className="gif-container">
            <img
              src={gif.url}
              ref={imageRef} 
              onLoad={handleImageLoad}
              alt={`Generated GIF ${index}`}
              className="generated-gif"
              style={{ border: `4px solid ${gif.selectedColor || '#ffffff'}`}}
            />
              <Box className="gif-buttons"
                onMouseEnter={() => setSelectedGif(index)}
                onMouseLeave={() => setSelectedGif(null)}
              >
                <Button className="edit" onClick={handleEditButtonClick}>Edit</Button>
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
      </Box>
      )
    });
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
