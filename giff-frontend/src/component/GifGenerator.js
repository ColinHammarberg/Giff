import React from 'react';
import { Box, TextField } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import './GifGenerator.scss';
import InfoButton from './InfoButton';
import Header from './Header';

function GifGenerator(props) {
  const { onChange, gifGenerated } = props;

  function handleOnChangeUrl(event) {
    if (onChange) {
      console.log('event', event);
      onChange(event?.target?.value)
    }
  }

  return (
    <div className="gif-generator">
      <Header generator />
      <Box className="text-field-content">
        <div className="text-field-header">Add any* url <InfoButton/></div>
        <TextField onChange={(event) => handleOnChangeUrl(event)} placeholder='https://spce.com' />
      </Box>
      <div className="gifs">
        {gifGenerated && <img src={Gif} alt="Generated GIF" />}
      </div>
    </div>
  );
}

export default GifGenerator;
