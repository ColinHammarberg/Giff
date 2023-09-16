import React, { useState } from 'react';
import '../App.css'
import MultipleGifGenerator from './MultipleGifGenerator';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import GifPdf from '../gifs/pdf_animation.gif';
import GeneratedGif from './GeneratedGif';
import './GifLanding.scss';
import GifError from './GifError';
import { GenerateMultipleGifs, GenerateMultiplePdfGifs } from '../endpoints/Apis';
// import EmailAddressPopover from './EmailAddressPopover';

function MultipleGifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  // const [anchorEl, setAnchorEl] = useState(null);
  // const [emailValue, setEmailValue] = useState('');

  function handleOnChangeUrl(value) {
    if (!value.startsWith("https://")) {
        value = "http://" + value
    }
    setUrl(value);
    console.log('url', value);
  }

  const generateMultipleGifs = async () => {
    try {
      setIsLoading(true);
      const response = await (url.endsWith('.pdf') ? GenerateMultiplePdfGifs(url) : GenerateMultipleGifs(url));
      console.log('response', response);
      if (!response || !response.data) {
        // Check if response or response.data is undefined
        console.error('Response or response.data is undefined');
        setError('An error occurred while generating GIF.');
      } else if (response.data.error) {
        console.error('Error generating GIF:', response.data.error);
        setError(response.data.error);
      } else if (response.data.message === 'GIF generated successfully') {
        const generatedGifUrl = url.endsWith('.pdf') ? GifPdf : Gif;
        console.log('generatedGifUrl', generatedGifUrl);
        setGeneratedGifUrl(generatedGifUrl);
        setGifGenerated(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating GIF:', error);
      setError('An error occurred while generating GIF.');
      setIsLoading(false);
    }
  };

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

  const handleKeyPressGenerateGif = (event) => {
    if (event.key === 'Enter') {
      generateMultipleGifs();
    }
  };

  if (error) {
    return (
      <div className="gif-landing">
        <GifError setGifGenerated={setGifGenerated} setError={setError} />
      </div>
    )
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
          <GeneratedGif gifGenerated={gifGenerated} generatedGifUrl={generatedGifUrl} isLoading={isLoading} onDownload={handleDownloadClick} />
        ) : (
          <MultipleGifGenerator onChange={handleOnChangeUrl} onKeyPress={handleKeyPressGenerateGif} gifGenerated={gifGenerated} />
        )
        }
        {!isLoading && (
            <Box className="btn-content">
                {!gifGenerated && (
                    <Button className="action-btn" onClick={generateMultipleGifs}>Create {urls.length} GIFS</Button>
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

export default MultipleGifLanding;
