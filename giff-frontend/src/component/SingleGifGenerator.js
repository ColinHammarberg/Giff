import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import './GifGenerator.scss';
import InfoButton from './InfoButton';
import Header from './Header';

function SingleGifGenerator(props) {
  const { onChange, gifGenerated, onKeyPress, generateSingleGif } = props;

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
        <TextField
          onChange={(event) => handleOnChangeUrl(event)}
          onKeyPress={(event) => {
            if (onKeyPress) {
              onKeyPress(event);
            }
          }}
          placeholder='https://spce.com'
        />
        <Box className="btn-content">
          {!gifGenerated && (
            <Button className="action-btn" onClick={generateSingleGif}>Create GIF</Button>
          )}
        </Box>
      </Box>
      <div className="gifs">
        {gifGenerated && <img src={Gif} alt="Generated GIF" />}
      </div>
    </div>
  );
}

export default SingleGifGenerator;
