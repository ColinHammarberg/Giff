import React from 'react';
import { Box, Button } from '@mui/material';
import './MultipleGeneratedGifs.scss';
import CircularWithValueLabel from './Loading';
import Header from './Header';

function MultipleGeneratedGifs(props) {
  const { gifGenerated, isLoading, onDownload, generatedGifUrl } = props;

  return (
    <div className="generated-gif">
      <Header />
      {isLoading ? (
        <Box className="loading-container">
          <CircularWithValueLabel />
          Creating your gif...
        </Box>
      ) : (
        <>
          <Box className="gif">
            {gifGenerated && <img src={generatedGifUrl} alt="Generated GIF" />}
          </Box>
          <Box className="generated-gif-btn-box">
            <Button className="btn download" onClick={onDownload}>Download GIF</Button>
          </Box>
        </>
      )}
    </div>
  );
}

export default MultipleGeneratedGifs;
