import React, { forwardRef } from 'react';
import { Box, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './SingleGifGenerator.scss';
import UploadPdfGifForm from './UploadPdfGifForm';
import OfficialButton from '../buttons/OfficialButton';
import LightTooltip from '../overall/LightToolTip';
import Header from '../overall/Header';

const SingleGifGenerator = forwardRef(
  (
    {
      onChange,
      gifGenerated,
      onKeyPress,
      generateSingleGif,
      selectedPdf,
      setSelectedPdf,
      handlePdfChange,
      handleCreateGifClick,
      setGifGenerated,
      setIsLoading,
      sectorType,
    },
    ref
  ) => {
    function handleOnChangeUrl(event) {
      if (onChange) {
        console.log('event', event);
        onChange(event?.target?.value);
      }
    }

    return (
      <div className="gif-generator">
        <Header menu />
        <div className="wrapper">
          <Box className="container">
            <Box className="header">
              Create a <span>&nbsp;Gif</span>
            </Box>
            <Box className="content">
              <Box className="left-content">
                <div className="left-header">
                  <span>Upload file or paste an url</span>
                </div>
                <div className="gif-creation">
                  <UploadPdfGifForm
                    setIsLoading={setIsLoading}
                    setGifGenerated={setGifGenerated}
                    setSelectedPdf={setSelectedPdf}
                    selectedPdf={selectedPdf}
                    handlePdfChange={handlePdfChange}
                    ref={ref}
                    handleCreateGifClick={handleCreateGifClick}
                    generateSingleGif={generateSingleGif}
                    sectorType={sectorType}
                  />
                  <span className="seperator">OR</span>
                  <LightTooltip
                    title="You have already uploaded a file!"
                    disableHoverListener={!selectedPdf}
                    disableFocusListener={!selectedPdf}
                  >
                    <div className="url">
                      <div className="box">Url</div>
                      <TextField
                        onChange={(event) => handleOnChangeUrl(event)}
                        onKeyPress={(event) => {
                          if (onKeyPress) {
                            onKeyPress(event);
                          }
                        }}
                        disabled={selectedPdf}
                        placeholder="https://spce.com"
                      />
                    </div>
                  </LightTooltip>
                </div>
                <span className="uploaded-pdf">
                  {selectedPdf
                    ? selectedPdf.name
                    : 'Uploaded files will be displayed here'}
                  <DeleteIcon onClick={() => setSelectedPdf(null)} />
                </span>
              </Box>
              <div className="divider"></div>
              <Box className="right-content">
                <div className="right-header">
                  <span>Instructions</span>
                </div>
                <div className="instructions">
                  <span>1: Finding your content:</span>
                  <span className="step-a">
                    A: Upload a pdf by dragging it to the box or{' '}
                    <span>
                      pressing “choose file” to add file from your computer.
                    </span>
                  </span>
                  <span className="step-b">
                    B: Paste a URl link to the website or page you want to
                    create a gif from.{' '}
                    <span>The page needs to be publicly available.</span>
                  </span>
                  <span className="step-c">
                    2: Check your uploaded files to{' '}
                    <span>make sure they are correct.</span>
                  </span>
                  <span className="step-d">
                    3: Press create and enjoy your gif,{' '}
                    <span>simple as that!</span>
                  </span>
                </div>
              </Box>
            </Box>
            <Box className="btn-content">
              {!gifGenerated && (
                <OfficialButton
                  onClick={
                    selectedPdf ? handleCreateGifClick : generateSingleGif
                  }
                  label="Create GIF"
                  variant="yellow"
                />
              )}
            </Box>
          </Box>
        </div>
      </div>
    );
  }
);

export default SingleGifGenerator;
