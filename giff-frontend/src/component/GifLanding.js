import React, { useState } from 'react';
import '../App.css'
import SingleGifGenerator from './SingleGifGenerator';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import GifPdf from '../gifs/pdf_animation.gif';
import GeneratedGif from './GeneratedGif';
import './GifLanding.scss';
import GifError from './GifError';
import { GeneratePdfGifs, GenerateSingleGif } from '../endpoints/Apis';
// import EmailAddressPopover from './EmailAddressPopover';

function GifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
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

  const generateSingleGif = async () => {
    try {
      setIsLoading(true);
      const response = await (url.endsWith('.pdf') ? GeneratePdfGifs(url) : GenerateSingleGif(url));
  
      if (response.data.error) {
        const errorMessage = response.data.error;
        if (errorMessage.includes("Invalid scroll height")) {
          setError('height error');
        } else if (errorMessage.includes("video")) {
          setError('video error');
        } else {
          setError('general error');
        }
      } else if (response.data.message === 'GIF generated successfully') {
        const generatedGifUrl = url.endsWith('.pdf') ? GifPdf : Gif;
        setGeneratedGifUrl(generatedGifUrl);
        setGifGenerated(true);
      }
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred while generating GIF.');
      setIsLoading(false);
    }
  };

  console.log('error', error);
  
  
  function handleDownloadClick() {
    if (gifGenerated) {
      // Create a virtual anchor element and trigger the download
      const link = document.createElement('a');
      link.href = generatedGifUrl; // Use the actual URL here
      link.target = '_blank';
      link.download = 'generated_gif.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // const onClosePopup = () => {
  //   setAnchorEl(null);
  // };

  // const handleOnClickEmailPopover = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleOnChange = (value) => {
  //   setEmailValue(value.target.value);
  // }

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
          <GeneratedGif gifGenerated={gifGenerated} generatedGifUrl={generatedGifUrl} isLoading={isLoading} onDownload={handleDownloadClick} />
        ) : (
          <SingleGifGenerator onChange={handleOnChangeUrl} onKeyPress={handleKeyPressGenerateGif} gifGenerated={gifGenerated} />
        )
        }
        {!isLoading && (
            <Box className="btn-content">
                {!gifGenerated && (
                    <Button className="action-btn" onClick={generateSingleGif}>Create GIF</Button>
                )}
            </Box>
        )}
        {/* {anchorEl && (
          <EmailAddressPopover anchorEl={anchorEl} onKeyPress={handleKeyPressSendGif} onClosePopup={onClosePopup} sendGif={sendGif} onChange={handleOnChange} />
        )} */}
        {!isLoading && (
            <Box className="bottom-content">
                {gifGenerated ? (
                    <Box className="go-back-content">
                        Want to create another gif? <span className="back-btn" onClick={() => {setGifGenerated(null)}}>Go back to home page here</span>
                    </Box>
                ) : (
                    <Box className="number-of-gifs-created">
                        [number of] gifs already created 
                    </Box>
                )
                }
            </Box>
        )}
    </div>
  )
}

export default GifLanding;
