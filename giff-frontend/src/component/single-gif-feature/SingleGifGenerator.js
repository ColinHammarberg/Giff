import React, { forwardRef } from 'react';
import { Box, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './SingleGifGenerator.scss';
import UploadPdfGifForm from './UploadPdfGifForm';
import OfficialButton from '../buttons/OfficialButton';
import LightTooltip from '../overall/LightToolTip';
import Header from '../overall/Header';
import useMobileQuery from '../../queries/useMobileQuery';

const SingleGifGenerator = forwardRef(
  (
    {
      onChange,
      gifGenerated,
      onKeyPress,
      generateSingleGif,
      selectedFile,
      setSelectedFile,
      handlePdfChange,
      handleCreateGifClick,
      setGifGenerated,
      setIsLoading,
    },
    ref
  ) => {
    function handleOnChangeUrl(event) {
      if (onChange) {
        console.log('event', event);
        onChange(event?.target?.value);
      }
    }
    const { isMobile } = useMobileQuery();

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
                    setSelectedFile={setSelectedFile}
                    selectedFile={selectedFile}
                    handlePdfChange={handlePdfChange}
                    ref={ref}
                    handleCreateGifClick={handleCreateGifClick}
                    generateSingleGif={generateSingleGif}
                  />
                  <span className="seperator">OR</span>
                  <LightTooltip
                    title="You have already uploaded a file!"
                    disableHoverListener={!selectedFile}
                    disableFocusListener={!selectedFile}
                  >
                    <div className="url">
                      <div className="box">Url</div>
                      <TextField
                        onChange={(event) => handleOnChangeUrl(event)}
                        onKeyPress={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            generateSingleGif();
                          }
                          if (onKeyPress) {
                            onKeyPress(event);
                          }
                        }}
                        disabled={selectedFile}
                        placeholder="Paste your url here"
                      />
                    </div>
                  </LightTooltip>
                </div>
                <span className="uploaded-pdf">
                  {selectedFile
                    ? selectedFile.name
                    : 'Uploaded files will be displayed here'}
                  {selectedFile && (
                    <DeleteIcon onClick={() => setSelectedFile(null)} />
                  )}
                </span>
              </Box>
              {!isMobile && (
                <>
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
                </>
              )}
            </Box>
            <Box className="btn-content">
              {!gifGenerated && (
                <OfficialButton
                  onClick={
                    selectedFile ? handleCreateGifClick : generateSingleGif
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
