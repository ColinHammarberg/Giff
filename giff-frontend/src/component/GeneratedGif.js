import React from 'react';
import { Box, Button } from '@mui/material';
import './GeneratedGif.scss';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import LoadingGif from './LoadingGif';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, onDownload, generatedGifUrl } = props;
  const navigate = useNavigate();

  return (
    <div className="generated-gif">
      <Header />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif singleGif />
        </Box>
      ) : (
        <>
          <Box className="gif">
            {gifGenerated && <img src={generatedGifUrl} alt="Generated GIF" />}
          </Box>
          <Box className="generated-gif-btn-box">
            <Button className="btn download" onClick={onDownload}>Download GIF</Button>
            <Button className="btn share" onClick={() => navigate('/email-choice')}>Share gif in email</Button>
            <Button className="btn share-else-where">Share gif elsewhere</Button>
          </Box>
        </>
      )}
    </div>
  );
}

export default GeneratedGif;
