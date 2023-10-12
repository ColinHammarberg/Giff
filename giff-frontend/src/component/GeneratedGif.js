import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import './GeneratedGif.scss';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import LoadingGif from './LoadingGif';

function GeneratedGif(props) {
  const { gifGenerated, isLoading, onDownload, key, url, edit } = props;
  const navigate = useNavigate();
  const [gifSrc, setGifSrc] = useState(null);

  useEffect(() => {
    const fetchGif = async () => {
      try {
        const gifModule = await import(
          `../gifs/${gifGenerated}`
        );
        setGifSrc(gifModule.default);
      } catch (error) {
        console.error("Could not load GIF:", error);
      }
    };
    if (!edit) {
      fetchGif();
    } else {
      // fetch resource from resourceId
    }
    }, [url, gifGenerated, edit]);

  return (
    <div className="generated-gif" key={key}>
      <Header menu />
      {isLoading ? (
        <Box className="loading-container">
          <LoadingGif singleGif />
        </Box>
      ) : (
        <>
          <Box className="gif">
            {gifGenerated && <img src={gifSrc} alt="Generated GIF" />}
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
