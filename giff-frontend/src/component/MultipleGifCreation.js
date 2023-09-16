import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import Gif from '../gifs/scrolling_animation.gif';
import GifPdf from '../gifs/pdf_animation.gif';
import GeneratedGif from './GeneratedGif';
import MultipleGifGenerator from './MultipleGifGenerator';
import './GifLanding.scss';
import GifError from './GifError';
import { GenerateMultipleGifs, GenerateMultiplePdfGifs } from '../endpoints/Apis';
import MultipleGeneratedGifs from './MultipleGeneratedGifs';

function MultipleGifLanding() {
  const [gifGenerated, setGifGenerated] = useState(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [urlList, setUrlList] = useState([
    { name: '', url: '' },
    { name: '', url: '' },
  ]);

  console.log('urlList', urlList);

  const generateMultipleGifs = async () => {
    try {
      setIsLoading(true);
      // Determine the GIF type (PDF or regular)
      const isPdf = urlList.some((item) => item.url.endsWith('.pdf'));
      const gifData = urlList.map((item) => ({ url: item.url, name: item.name }));

      const response = await (isPdf
        ? GenerateMultiplePdfGifs(gifData)
        : GenerateMultipleGifs(gifData));

      console.log('response', response);

      if (!response || !response.data) {
        console.error('Response or response.data is undefined');
        setError('An error occurred while generating GIF.');
      } else if (response.data.error) {
        console.error('Error generating GIF:', response.data.error);
        setError(response.data.error);
      } else if (response.data.message === 'GIF generated successfully') {
        const generatedGifUrl = isPdf ? GifPdf : Gif;
        console.log('generatedGifUrl', generatedGifUrl);
        setGeneratedGifUrl(generatedGifUrl);
      }
      setGifGenerated(true);
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
    );
  }

  return (
    <div className="gif-landing">
      {isLoading || gifGenerated ? (
        <MultipleGeneratedGifs
          gifGenerated={gifGenerated}
          generatedGifUrl={generatedGifUrl}
          isLoading={isLoading}
          onDownload={handleDownloadClick}
        />
      ) : (
        <MultipleGifGenerator
          urlList={urlList}
          setUrlList={setUrlList}
          onKeyPress={handleKeyPressGenerateGif}
          gifGenerated={gifGenerated}
        />
      )}
      {!isLoading && (
        <Box className="btn-content">
          {!gifGenerated && (
            <Button className="action-btn" onClick={generateMultipleGifs}>
              Create {urlList.length} GIFS
            </Button>
          )}
        </Box>
      )}
      {!isLoading && (
        <Box className="bottom-content">
          {gifGenerated ? (
            <Box className="go-back-content">
              Want to create another gif?{' '}
              <span className="back-btn" onClick={() => setGifGenerated(false)}>
                Go back to home page here
              </span>
            </Box>
          ) : (
            <Box className="number-of-gifs-created">
              [number of] gifs already created
            </Box>
          )}
        </Box>
      )}
    </div>
  );
}

export default MultipleGifLanding;
