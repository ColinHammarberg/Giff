import React, { forwardRef } from 'react';
import { Box, TextField } from '@mui/material';
import './SingleGifGenerator.scss';
import InfoButton from './InfoButton';
import Header from './Header';
import OfficialButton from './OfficialButton';
import UploadPdfGifForm from './UploadPdfGifForm';

const SingleGifGenerator = forwardRef(({ onChange, gifGenerated, onKeyPress, generateSingleGif, selectedPdf, setSelectedPdf, handlePdfChange, handleCreateGifClick }, ref) => {
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
        <div className="text-field-header">Add any* url <InfoButton infoButtonText={infoButtonText} /></div>
        <div className="url">
          <div className="box">Add Url</div>
          <TextField
            onChange={(event) => handleOnChangeUrl(event)}
            onKeyPress={(event) => {
              if (onKeyPress) {
                onKeyPress(event);
              }
            }}
            placeholder='https://spce.com'
          />
        </div>
        <span>OR</span>
        <UploadPdfGifForm setSelectedPdf={setSelectedPdf} selectedPdf={selectedPdf} handlePdfChange={handlePdfChange} ref={ref} handleCreateGifClick={handleCreateGifClick} generateSingleGif={generateSingleGif} />
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
