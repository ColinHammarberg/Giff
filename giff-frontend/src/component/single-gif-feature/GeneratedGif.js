import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import './GeneratedGif.scss';
import Header from '../overall/Header';
import LoadingGif from '../overall/LoadingGif';
import { GiftContext } from '../../context/GiftContextProvider';
import DesignGifDialog from '../design/DesignGifDialog';
import { useTabs } from '../tabs/Tabs';
import {
  DownloadIndividualDesignedGifs,
  GetMultipleGifs,
} from '../../endpoints/GifCreationEndpoints';
// import { getSelectedFramePath } from '../gif-library/GifLibraryUtils';
// import { showNotification } from '../notification/Notification';
// import ExampleEmailPopover from './EmailExamplePopover';
import { tabsData } from '../tabs/TabsData';
import { useNavigate } from 'react-router-dom';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, key } = props;
  // const [importedGifs, setImportedGifs] = useState(null);
  const { isMobile } = useContext(GiftContext);
  const [selectedDesignGif, setSelectedDesignGif] = useState({});
  // const [selectedGif, setSelectedGif] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(null);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  // const [designChanges, setDesignChanges] = useState(false);
  const { tabs, changeTab, activeTab, setActiveTab } = useTabs(tabsData);
  const navigate = useNavigate();
  // const [expandedDescriptionIndex, setExpandedDescriptionIndex] =
  //   useState(null);
  // const [imageDimensions, setImageDimensions] = useState({
  //   width: null,
  //   height: null,
  // });
  // const imageRef = useRef(null);
  // const [openExampleEmail, setOpenExampleEmail] = useState(null);

  // const handleImageLoad = () => {
  //   const width = imageRef.current ? imageRef.current.offsetWidth : 0;
  //   const height = imageRef.current ? imageRef.current.offsetHeight : 0;
  //   setImageDimensions({ width, height });
  // };

  // const handleEditButtonClick = () => {
  //   if (selectedGif !== null) {
  //     const hoveredGif = importedGifs[selectedGif];
  //     editGif(
  //       hoveredGif.url,
  //       hoveredGif.resourceId,
  //       hoveredGif.selectedColor,
  //       hoveredGif.selectedFrame,
  //       hoveredGif.resourceType,
  //       hoveredGif.tags,
  //       hoveredGif.example_email,
  //       hoveredGif.frame_urls,
  //       hoveredGif.name,
  //       hoveredGif.duration
  //     );
  //     setDesignChanges(false);
  //   }
  // };

  // useEffect(() => {
  //   if (gifGenerated && importedGifs?.length > 0) {
  //     setOpenExampleEmail(true);
  //   }
  // }, [gifGenerated, importedGifs?.length]);

  // useEffect(() => {
  //   if (gifGenerated) {
  //     const fetchData = async () => {
  //       const response = await GetMultipleGifs(gifGenerated);
  //       try {
  //         if (response.data) {
  //           setImportedGifs(response.data);
  //         }
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };
  //     fetchData();
  //   }
  // }, [gifGenerated, designChanges]);

  const handleOpenDesign = useCallback(() => {
    setIsDesignOpen(true);
  }, []);

  const handleCloseDesign = () => {
    setIsDesignOpen(false);
  };

  const editGif = useCallback(
    (
      gifUrl,
      resourceId,
      selectedColor,
      selectedFrame,
      resourceType,
      tags,
      exampleEmail,
      frameUrls,
      gifName,
      duration
    ) => {
      console.log('tags', tags, resourceType);
      setIsDesignOpen(true);
      setSelectedDesignGif({
        url: gifUrl,
        resourceId: resourceId,
        selectedColor: selectedColor,
        selectedFrame: selectedFrame,
        tags: tags,
        exampleEmail: exampleEmail,
        frame_urls: frameUrls,
        gifName: gifName,
        duration: duration,
      });
    },
    []
  );

  useEffect(() => {
    const openDesignDialogWithImportedGif = async () => {
      if (gifGenerated) {
        try {
          const response = await GetMultipleGifs(gifGenerated);
          if (response.data && response.data.length > 0) {
            const importedGif = response.data[0];
            const {
              url,
              resourceId,
              selectedColor,
              selectedFrame,
              resourceType,
              tags,
              example_email,
              frame_urls,
              name,
              duration,
            } = importedGif;
            editGif(
              url,
              resourceId,
              selectedColor,
              selectedFrame,
              resourceType,
              tags,
              example_email,
              frame_urls,
              name,
              duration
            );
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    openDesignDialogWithImportedGif();
  }, [gifGenerated, editGif, handleOpenDesign]);

  async function handleDownloadClick() {
    if (!gifGenerated) return;

    const { url, name, selectedColor, selectedFrame, resourceType } =
      selectedDesignGif;
    console.log('selectedDesignGif', selectedDesignGif);
    const gifData = JSON.stringify({
      url,
      name,
      selectedColor,
      selectedFrame,
      resourceType,
    });

    try {
      setDownloadLoading(true);
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

  // const handleNameChange = (index, newName) => {
  //   const updatedGifs = [...importedGifs];
  //   updatedGifs[index].name = newName;
  //   setImportedGifs(updatedGifs);
  // };

  // const handleNameSubmit = async (gif) => {
  //   const updatedName = gif.name;
  //   try {
  //     await UpdateGifName(gif.resourceId, updatedName);
  //     showNotification('success', 'Name updated successfully!');
  //   } catch (error) {
  //     showNotification('error', 'Error updating GIF name:');
  //   }
  // };

  return (
    <div className="generated-gif" key={key}>
      <Header menu />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif singleGif />
        </Box>
      ) : (
        <>
          {/* <Box className="title">Your gif is ready. It looks great.</Box> */}
          {/* {gifGenerated && importedGifs?.length > 0 && (
            <Box className="gif">
              {importedGifs.map((gif, index) => {
                const isExpanded = expandedDescriptionIndex === index;
                const shortDescription =
                  gif?.ai_description?.substring(0, 100) + '...';
                return (
                  <>
                    <div className="gif-container">
                      <img
                        src={gif?.url}
                        ref={imageRef}
                        onLoad={handleImageLoad}
                        alt="Generated GIF"
                        style={{
                          border: `4px solid ${gif.selectedColor || '#ffffff'}`,
                        }}
                      />
                      <ExampleEmailPopover
                        open={openExampleEmail}
                        anchorEl={imageRef.current}
                        content={gif.example_email}
                        onClose={() => setOpenExampleEmail(false)}
                      />
                      {gif.selectedFrame && !gif.selectedColor && (
                        <img
                          src={getSelectedFramePath(gif.selectedFrame)}
                          style={{
                            width: imageDimensions.width,
                            height: imageDimensions.height,
                          }}
                          alt=""
                        />
                      )}
                      {!isMobile && (
                        <Box
                          className="gif-buttons"
                          onMouseEnter={() => setSelectedGif(index)}
                          onMouseLeave={() => setSelectedGif(null)}
                        >
                          <Button
                            className="edit"
                            onClick={handleEditButtonClick}
                          >
                            Edit
                          </Button>
                        </Box>
                      )}
                    </div>
                    {gif?.ai_description && (
                      <Box
                        className="description"
                        style={{
                          width: imageDimensions.width,
                          backgroundColor: gif.selectedColor || '#ffffff',
                        }}
                      >
                        <p>
                          {isExpanded ? gif?.ai_description : shortDescription}
                        </p>
                        <Button
                          className="view-more-button"
                          onClick={() =>
                            setExpandedDescriptionIndex(
                              isExpanded ? null : index
                            )
                          }
                        >
                          {isExpanded ? 'View Less' : 'See longer description'}
                        </Button>
                      </Box>
                    )}
                    <TextField
                      value={gif?.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleNameSubmit(gif)
                      }
                      style={{ backgroundColor: 'transparent', border: 'none' }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                    />
                  </>
                );
              })}
            </Box>
          )} */}
          {/* <Box className="generated-gif-btn-box">
            <OfficialButton
              variant="yellow"
              label="Download GIF"
              onClick={handleDownloadClick}
              isProcessing={downloadLoading}
            />
          </Box> */}
          <DesignGifDialog
            isOpen={isDesignOpen}
            // setDesignChanges={setDesignChanges}
            handleDownloadClick={handleDownloadClick}
            downloadLoading={downloadLoading}
            selectedGif={selectedDesignGif}
            gifCreationFlow
            tabs={tabs}
            navigate={navigate}
            isMobile={isMobile}
            changeTab={changeTab}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
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
