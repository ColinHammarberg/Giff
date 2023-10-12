import React, { useContext, useState } from 'react';
import '../App.css'
import SingleGifGenerator from './SingleGifGenerator';
import { Box } from '@mui/material';
import GeneratedGif from './GeneratedGif';
import './GifLanding.scss';
import GifError from './GifError';
import { GeneratePdfGifs, GenerateSingleGif } from '../endpoints/Apis';
import { GiftContext } from '../context/GiftContextProvider';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const { handleDownloadClick } = useContext(GiftContext); // Get the context value
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [emailValue, setEmailValue] = useState('');

  function handleOnChangeUrl(value) {
    if (!value.startsWith("https://")) {
        value = "http://" + value
    }
    setUrl(value);
    console.log('url', value);
  }

  const handleErrors = (errorMessage) => {
    if (errorMessage.includes("Invalid scroll height")) {
      setError('height error');
    } else if (errorMessage.includes("video")) {
      setError('video error');
    } else {
      setError('general error');
    }
  };

  const generateSingleGif = async () => {
    const access_token = localStorage.getItem('access_token');
    try {
      setIsLoading(true);
      const response = await (url.endsWith('.pdf') ? GeneratePdfGifs(url, access_token) : GenerateSingleGif(url));
      console.log('response', response);
      if (response?.data?.error) {
        handleErrors(response.data.error);
      } else if (response.data.message === 'GIF generated and uploaded!') {
        setGifGenerated(response.data.name);
      }
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while generating GIF.');
      setIsLoading(false);
    }
  };

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      generateSingleGif();
    }
  };

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} variant={error} setError={setError} />
      </div>
    )
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
          <GeneratedGif key={gifGenerated} url={url} gifGenerated={gifGenerated} isLoading={isLoading} onDownload={handleDownloadClick} />
        ) : (
          <SingleGifGenerator onChange={handleOnChangeUrl} onKeyPress={handleKeyPressGenerateGif} generateSingleGif={generateSingleGif} gifGenerated={gifGenerated} />
        )
        }
        {!isLoading && (
            <Box className="bottom-content">
                {gifGenerated && (
                  <Box className="go-back-content">
                    Want to create another gif? <span className="back-btn" onClick={() => {setGifGenerated(null)}}>Go back to home page here</span>
                  </Box>
                )}
            </Box>
        )}
    </div>
  )
}

export default GifLanding;
