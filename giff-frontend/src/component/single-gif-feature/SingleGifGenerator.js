import React, { forwardRef } from 'react';
import { Box, TextField } from '@mui/material';
import './SingleGifGenerator.scss';
import UploadPdfGifForm from './UploadPdfGifForm';
import OfficialButton from '../buttons/OfficialButton';
import LightTooltip from '../overall/LightToolTip';
import Header from '../overall/Header';
import InfoButton from '../overall/InfoButton';

const SingleGifGenerator = forwardRef(({ onChange, gifGenerated, onKeyPress, generateSingleGif, selectedPdf, setSelectedPdf, handlePdfChange, handleCreateGifClick, setGifGenerated, setIsLoading }, ref) => {
  const infoButtonText = [
    {text: 'With Gif-t, you can create a gif from an online pdf, web page or presentation. Simply add the url and click Create gif.'},
    {text: 'Our gif-machine (AKA the Gif-ter) will scroll through the place your url leads to, create a gif and make it ready for you to share.'},
    {text: 'Your url needs to lead somewhere scrollable (it can’t just be one page, like google.com), and it cannot be locked behind a login or verification (like a sharepoint or a pay-walled magazine).'}
  ]          

  function handleOnChangeUrl(event) {
    if (onChange) {
      console.log('event', event);
      onChange(event?.target?.value)
    }
  }

  return (
    <div className="gif-generator">
      <Header menu />
      <Box className="text-field-content">
        <div className="text-field-header">Your gif is one click away<InfoButton infoButtonText={infoButtonText} /></div>
        <LightTooltip title="You have already uploaded a file!" disableHoverListener={!selectedPdf} disableFocusListener={!selectedPdf}>
          <div className="url">
            <div className="box">Add Url</div>
              <TextField
                onChange={(event) => handleOnChangeUrl(event)}
                onKeyPress={(event) => {
                  if (onKeyPress) {
                    onKeyPress(event);
                  }
                }}
                disabled={selectedPdf}
                placeholder='https://spce.com'
              />
          </div>
        </LightTooltip>
        <span>OR</span>
        <UploadPdfGifForm setIsLoading={setIsLoading} setGifGenerated={setGifGenerated} setSelectedPdf={setSelectedPdf} selectedPdf={selectedPdf} handlePdfChange={handlePdfChange} ref={ref} handleCreateGifClick={handleCreateGifClick} generateSingleGif={generateSingleGif} />
        <Box className="btn-content">
          {!gifGenerated && (
            <OfficialButton onClick={selectedPdf ? handleCreateGifClick : generateSingleGif} label="Create GIF" variant="yellow" />
          )}
        </Box>
      </Box>
    </div>
  );
})

export default SingleGifGenerator;
